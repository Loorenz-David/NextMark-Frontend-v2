import type { DriverWorkspaceScopeKey } from '@/app/contracts/driverSession.types'
import { refreshDriverRealtimeOrderCases } from '@/app/realtime/driverRealtimeCoordinator'
import type { useDriverAppShell } from '@/app/shell'
import type { NotificationItem } from '@shared-realtime'
import { shouldRefreshForFreshness } from '@shared-utils'
import type { useOpenRouteStopDetail } from '@/features/route-execution'
import type { RouteExecutionStore } from '@/features/route-execution/stores/routeExecution.store'
import { hydrateDriverRouteByIdFlow } from '@/features/routes'
import { selectRouteFlow } from '@/features/routes/flows/selectRoute.flow'
import { useStopsStore } from '@/features/routes/stops'
import {
  routeSnapshotMetaStore,
  selectRouteByServerId,
  useRoutesStore,
} from '@/features/routes/stores'

type DriverNotificationOpenDependencies = {
  closeSlidingPage: ReturnType<typeof useDriverAppShell>['closeSlidingPage']
  openBottomSheet: ReturnType<typeof useDriverAppShell>['openBottomSheet']
  openOverlay: ReturnType<typeof useDriverAppShell>['openOverlay']
  openRouteStopDetail: ReturnType<typeof useOpenRouteStopDetail>
  routeExecutionStore: RouteExecutionStore
  routesState: ReturnType<typeof useRoutesStore.getState>
  workspaceScopeKey: DriverWorkspaceScopeKey | null
}

type DriverNotificationMatchDependencies = {
  activeRouteId: number | null
  overlayEntry?: {
    page?: string
    params?: Record<string, unknown>
  } | null
}

const ensureRouteSelected = (
  workspaceScopeKey: DriverWorkspaceScopeKey,
  routeId: number,
  routesState: ReturnType<typeof useRoutesStore.getState>,
) => {
  const route = selectRouteByServerId(routeId)(routesState)
  if (!route?.client_id) {
    return false
  }

  selectRouteFlow({
    workspaceScopeKey,
    routeClientId: route.client_id,
  })
  return true
}

const selectRouteWhenAvailable = async (
  workspaceScopeKey: DriverWorkspaceScopeKey,
  routeId: number,
  routesState: ReturnType<typeof useRoutesStore.getState>,
  freshAfter: string | null,
) => {
  if (ensureRouteSelected(workspaceScopeKey, routeId, routesState)) {
    return true
  }

  const didHydrate = await hydrateDriverRouteByIdFlow({
    routeId,
    workspaceScopeKey,
    freshAfter: notificationFreshness(freshAfter),
    force: true,
  })

  if (!didHydrate) {
    return false
  }

  return ensureRouteSelected(workspaceScopeKey, routeId, useRoutesStore.getState())
}

export const openDriverNotificationTarget = (
  notification: NotificationItem,
  dependencies: DriverNotificationOpenDependencies,
) => {
  const {
    closeSlidingPage,
    openBottomSheet,
    openOverlay,
    openRouteStopDetail,
    routeExecutionStore,
    routesState,
    workspaceScopeKey,
  } = dependencies
  const routeId = notification.target.params.routeId
  const routeFreshness = notificationFreshness(notification.route_freshness_updated_at)
  const orderId = typeof notification.target.params.orderId === 'number'
    ? notification.target.params.orderId
    : null

  if (!workspaceScopeKey || typeof routeId !== 'number') {
    closeSlidingPage()
    return
  }

  void (async () => {
    const didSelectRoute = await selectRouteWhenAvailable(
      workspaceScopeKey,
      routeId,
      routesState,
      routeFreshness,
    )
    if (!didSelectRoute) {
      openBottomSheet('route-workspace', undefined)
      closeSlidingPage()
      return
    }

    if (notification.target.kind === 'driver_order_case_chat') {
      const orderCaseId = notification.target.params.orderCaseId
      const orderCaseClientId = notification.target.params.orderCaseClientId

      if (
        orderId != null
        && typeof orderCaseId === 'number'
        && typeof orderCaseClientId === 'string'
        && orderCaseClientId
      ) {
        void refreshDriverRealtimeOrderCases(orderId)
        openOverlay('order-case-main', {
          orderId,
          orderCaseClientId,
          orderCaseId,
          freshAfter: notification.occurred_at,
        })
      }

      closeSlidingPage()
      return
    }

    openBottomSheet('route-workspace', undefined)

    if (orderId != null) {
      const stopClientId = await resolveStopClientIdForOrderNotification({
        orderId,
        routeExecutionStore,
        routeFreshness,
        routeId,
        workspaceScopeKey,
      })
      if (stopClientId) {
        openRouteStopDetail(stopClientId)
      }
      void refreshDriverRealtimeOrderCases(orderId)
    }

    closeSlidingPage()
  })()
}

async function resolveStopClientIdForOrderNotification({
  orderId,
  routeExecutionStore,
  routeFreshness,
  routeId,
  workspaceScopeKey,
}: {
  orderId: number
  routeExecutionStore: RouteExecutionStore
  routeFreshness: string | null
  routeId: number
  workspaceScopeKey: DriverWorkspaceScopeKey
}) {
  const workspaceStopClientId = resolveStopClientIdFromWorkspaceSnapshot(routeExecutionStore, routeId, orderId)
  const hasFreshWorkspaceSnapshot = hasFreshAssignedRouteSnapshot(routeExecutionStore, routeId, routeFreshness)

  if (workspaceStopClientId && hasFreshWorkspaceSnapshot) {
    return workspaceStopClientId
  }

  if (!hasFreshWorkspaceSnapshot) {
    const didHydrate = await hydrateDriverRouteByIdFlow({
      routeId,
      workspaceScopeKey,
      freshAfter: routeFreshness,
    })
    if (!didHydrate) {
      return null
    }
  }

  return resolveStopClientIdFromHydratedRoute(routeId, orderId)
}

function hasFreshAssignedRouteSnapshot(
  routeExecutionStore: RouteExecutionStore,
  routeId: number,
  routeFreshness: string | null,
) {
  const workspace = routeExecutionStore.getState().workspace
  return (
    workspace.routeRecord != null
    && workspace.hydratedRouteId === routeId
    && !shouldRefreshForFreshness(
      workspace.hydratedRouteFreshnessUpdatedAt,
      routeFreshness,
    )
  )
}

function resolveStopClientIdFromWorkspaceSnapshot(
  routeExecutionStore: RouteExecutionStore,
  routeId: number,
  orderId: number,
) {
  const workspace = routeExecutionStore.getState().workspace
  if (workspace.hydratedRouteId !== routeId) {
    return null
  }

  for (const stopClientId of workspace.stops.allIds) {
    const stop = workspace.stops.byClientId[stopClientId]
    if (stop?.route_solution_id === routeId && stop.order_id === orderId) {
      return stop.client_id
    }
  }

  return null
}

function resolveStopClientIdFromHydratedRoute(routeId: number, orderId: number) {
  const hydratedRoute = routeSnapshotMetaStore.getState().route
  if (!hydratedRoute || hydratedRoute.id !== routeId) {
    return null
  }

  const stopsState = useStopsStore.getState()
  for (const stopClientId of stopsState.allIds) {
    const stop = stopsState.byClientId[stopClientId]
    if (stop?.route_solution_id === routeId && stop.order_id === orderId) {
      return stop.client_id
    }
  }

  return null
}

function notificationFreshness(primary: string | null | undefined) {
  return primary ?? null
}

export const matchesDriverNotificationTarget = (
  notification: NotificationItem,
  dependencies: DriverNotificationMatchDependencies,
) => {
  const { activeRouteId, overlayEntry } = dependencies

  if (notification.target.kind === 'route_execution') {
    return activeRouteId != null && notification.target.params.routeId === activeRouteId
  }

  if (notification.target.kind === 'driver_order_case_chat') {
    if (activeRouteId == null || notification.target.params.routeId !== activeRouteId) {
      return false
    }

    if (overlayEntry?.page !== 'order-case-main') {
      return false
    }

    return (
      (typeof notification.target.params.orderCaseClientId === 'string'
        && overlayEntry.params?.orderCaseClientId === notification.target.params.orderCaseClientId)
      || (typeof notification.target.params.orderCaseId === 'number'
        && overlayEntry.params?.orderCaseId === notification.target.params.orderCaseId)
    )
  }

  return false
}
