import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useSyncExternalStore } from 'react'
import {
  createRouteOrdersChannel,
  createTeamMembersChannel,
  type BusinessEventEnvelope,
} from '@shared-realtime'
import type { SessionSnapshot } from '@shared-api'
import { shouldRefreshForFreshness } from '@shared-utils'
import { useWorkspace } from './workspace.context'
import { useSession } from './session.context'
import { driverRealtimeClient } from '@/app/services/realtime'
import { patchOrderStateByServerIds, selectOrderByServerId, useOrdersStore } from '@/features/routes/orders'
import { initializeOrderCaseChatFlow } from '@/features/order-case'
import { useRouteExecutionShell } from '@/features/route-execution'
import { buildAssignedRouteSnapshotFromStores } from '@/features/route-execution/flows/initializeRouteWorkspace.flow'
import {
  patchAssignedRouteOrderStateByServerIds,
  setAssignedRouteSnapshot,
  setAssignedRouteSnapshotMeta,
} from '@/features/route-execution/stores/routeExecution.mutations'
import {
  hydrateDriverRouteByIdFlow,
  routeSnapshotMetaStore,
  selectSelectedRoute,
  useRoutesSelectionStore,
  useRoutesStore,
} from '@/features/routes'
import { useDriverAppShell } from '@/app/shell'
import {
  markDriverRealtimeEventHandled,
  refreshDriverRealtimeOrderCases,
  refreshDriverRouteSummaries,
} from '@/app/realtime/driverRealtimeCoordinator'

type BusinessPayload = Record<string, unknown>
type RouteExecutionBottomSheetPage = 'route-workspace' | 'route-stop-detail'

const isRealtimeReady = (
  sessionState: string,
  session: SessionSnapshot | null,
  teamId: string | null,
  canExecuteRoutes: boolean,
) => {
  return sessionState === 'authenticated'
    && Boolean(session?.socketToken)
    && Boolean(teamId)
    && canExecuteRoutes
}

const getPayloadNumber = (payload: BusinessPayload, key: string): number | null => {
  const value = payload[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

const isRouteExecutionPage = (page: string | undefined | null): page is RouteExecutionBottomSheetPage => {
  return page === 'route-workspace' || page === 'route-stop-detail'
}

export function DriverRealtimeProvider({ children }: PropsWithChildren) {
  const { session, sessionState } = useSession()
  const { workspace } = useWorkspace()
  const { store: shellStore } = useDriverAppShell()
  const { store: routeExecutionStore } = useRouteExecutionShell()
  const routesState = useRoutesStore((state) => state)
  const routesSelectionState = useRoutesSelectionStore((state) => state)
  const shellState = useSyncExternalStore(shellStore.subscribe, shellStore.getState, shellStore.getState)
  const selectedRoute = useMemo(
    () => selectSelectedRoute(routesSelectionState, routesState),
    [routesSelectionState, routesState],
  )

  const routeOrdersChannel = useMemo(
    () => createRouteOrdersChannel(driverRealtimeClient),
    [],
  )

  const teamMembersChannel = useMemo(
    () => createTeamMembersChannel(driverRealtimeClient),
    [],
  )

  useEffect(() => {
    const canExecuteRoutes = workspace?.capabilities.canExecuteRoutes ?? false
    const teamId = workspace?.teamId ?? null
    const workspaceScopeKey = workspace?.workspaceScopeKey
    const routeId = selectedRoute?.id ?? null
    const isRouteWorkspaceOpen = isRouteExecutionPage(shellState.bottomSheetStack.at(-1)?.page)

    if (!workspaceScopeKey || !routeId || !isRouteWorkspaceOpen || !isRealtimeReady(sessionState, session, teamId, canExecuteRoutes)) {
      return
    }

    const syncActiveRouteSnapshot = (freshness: string | null) => {
      if (!routeId) {
        return false
      }

      const snapshotState = routeSnapshotMetaStore.getState()
      if (!snapshotState.route || snapshotState.hydratedRouteId !== routeId) {
        return false
      }

      setAssignedRouteSnapshot(
        routeExecutionStore,
        buildAssignedRouteSnapshotFromStores(snapshotState.route),
      )
      setAssignedRouteSnapshotMeta(
        routeExecutionStore,
        snapshotState.hydratedRouteId,
        freshness ?? snapshotState.hydratedRouteFreshnessUpdatedAt,
      )
      return true
    }

    const handleRouteBusinessEvent = (event: BusinessEventEnvelope<BusinessPayload>) => {
      if (!markDriverRealtimeEventHandled(event.event_id)) {
        return
      }

      const payload = event.payload ?? {}
      const orderId = getPayloadNumber(payload, 'order_id')

      if (event.event_name === 'order.created' || event.event_name === 'order.updated' || event.event_name === 'order.state_changed') {
        const resolvedOrderId = orderId ?? event.entity_id
        if (event.event_name === 'order.state_changed') {
          if (!resolvedOrderId) {
            return
          }

          const routeFreshness = typeof payload.route_freshness_updated_at === 'string'
            ? payload.route_freshness_updated_at
            : null
          const order = selectOrderByServerId(resolvedOrderId)(useOrdersStore.getState())
          const orderStateId = getPayloadNumber(payload, 'order_state_id')
          if (orderStateId != null) {
            if (order) {
              patchOrderStateByServerIds([resolvedOrderId], orderStateId)
            }

            const didPatchAssignedRoute = patchAssignedRouteOrderStateByServerIds(
              routeExecutionStore,
              [resolvedOrderId],
              orderStateId,
            )
            if (!didPatchAssignedRoute) {
              void hydrateDriverRouteByIdFlow({
                routeId,
                workspaceScopeKey,
                freshAfter: routeFreshness,
                force: true,
              }).then((didHydrate) => {
                if (didHydrate) {
                  syncActiveRouteSnapshot(routeFreshness)
                }
              })
            }
          }

          return
        }

        const routeFreshness = typeof payload.route_freshness_updated_at === 'string'
          ? payload.route_freshness_updated_at
          : null
        const currentRouteFreshness = routeExecutionStore.getState().workspace.hydratedRouteFreshnessUpdatedAt
          ?? selectedRoute?.delivery_plan?.updated_at
          ?? null
        if (!shouldRefreshForFreshness(currentRouteFreshness, routeFreshness)) {
          return
        }

        void hydrateDriverRouteByIdFlow({
          routeId,
          workspaceScopeKey,
          freshAfter: routeFreshness,
        }).then((didHydrate) => {
          if (didHydrate) {
            syncActiveRouteSnapshot(routeFreshness)
          }
        })
        return
      }

      if (
        event.event_name === 'order_case.created'
        || event.event_name === 'order_case.updated'
        || event.event_name === 'order_case.state_changed'
        || event.event_name === 'order_chat.message_created'
      ) {
        if (!orderId) {
          return
        }

        const order = selectOrderByServerId(orderId)(useOrdersStore.getState())
        if (!order) {
          return
        }

        const orderCaseId = getPayloadNumber(payload, 'order_case_id')
        if (event.event_name === 'order_chat.message_created' && orderCaseId != null) {
          void initializeOrderCaseChatFlow(orderCaseId, { force: true })
        }

        void refreshDriverRealtimeOrderCases(orderId)
      }
    }

    const releaseRouteOrders = routeOrdersChannel.subscribeRouteOrders(routeId, handleRouteBusinessEvent)

    return () => {
      releaseRouteOrders()
    }
    }, [
      routeOrdersChannel,
      routeExecutionStore,
      shellState.bottomSheetStack,
      session,
      sessionState,
      selectedRoute?.id,
      selectedRoute?.delivery_plan?.updated_at,
      workspace,
    ])

  useEffect(() => {
    const teamId = workspace?.teamId ?? null
    const workspaceScopeKey = workspace?.workspaceScopeKey
    const selectedRouteId = selectedRoute?.id ?? null

    if (
      !workspaceScopeKey
      || sessionState !== 'authenticated'
      || !session?.socketToken
      || !teamId
    ) {
      return
    }

    const currentUserId = workspace?.userId ?? session?.identity?.user_id ?? session?.user?.id ?? null

    const releaseTeamMembers = teamMembersChannel.subscribeTeamMembers((event: BusinessEventEnvelope<BusinessPayload>) => {
      if (!markDriverRealtimeEventHandled(event.event_id)) {
        return
      }

      const payload = event.payload ?? {}
      const driverId = getPayloadNumber(payload, 'driver_id')
      const oldDriverId = getPayloadNumber(payload, 'old_driver_id')
      const eventRouteId = getPayloadNumber(payload, 'route_solution_id') ?? event.entity_id

      const matchesCurrentDriver = currentUserId != null && (
        (driverId != null && String(driverId) === String(currentUserId))
        || (oldDriverId != null && String(oldDriverId) === String(currentUserId))
      )
      const matchesSelectedRoute = selectedRouteId != null && eventRouteId != null && eventRouteId === selectedRouteId

      if (event.event_name === 'route_solution.created') {
        if (!matchesCurrentDriver && !matchesSelectedRoute) {
          return
        }

        if (eventRouteId == null) {
          return
        }

        const routeFreshness = typeof payload.route_freshness_updated_at === 'string'
          ? payload.route_freshness_updated_at
          : null

        void hydrateDriverRouteByIdFlow({
          routeId: eventRouteId,
          workspaceScopeKey,
          freshAfter: routeFreshness,
          force: true,
        })
        return
      }

      if (
        event.event_name === 'route_solution.updated'
        || event.event_name === 'route_solution.deleted'
        || event.event_name === 'route_solution_stop.updated'
        || event.event_name === 'local_delivery_plan.updated'
      ) {
        if (!matchesCurrentDriver && !matchesSelectedRoute) {
          return
        }

        void refreshDriverRouteSummaries(workspaceScopeKey)
      }
    })

    return () => {
      releaseTeamMembers()
    }
  }, [
    teamMembersChannel,
    session,
    sessionState,
    selectedRoute?.id,
    workspace,
  ])

  return <>{children}</>
}
