import { shouldRefreshForFreshness } from '@shared-utils'
import type { DriverWorkspaceScopeKey } from '@/app/contracts/driverSession.types'
import { loadRouteByIdQuery } from '../actions'
import type { DriverRouteRecord } from '../domain'
import { clearOrders, setOrders } from '../orders'
import { selectRouteFlow } from './selectRoute.flow'
import {
  routeSnapshotMetaStore,
  setRouteSnapshotMeta,
  selectSelectedRouteClientId,
  selectRouteByServerId,
  setRoutes,
  useRoutesSelectionStore,
  useRoutesStore,
} from '../stores'
import { clearStops, setStops } from '../stops'

type HydrateDriverRouteByIdFlowDependencies = {
  routeId: number
  workspaceScopeKey: DriverWorkspaceScopeKey
  freshAfter?: string | null
  force?: boolean
}

const inFlightHydrations = new Map<number, Promise<boolean>>()

export async function hydrateDriverRouteByIdFlow({
  routeId,
  workspaceScopeKey,
  freshAfter = null,
  force = false,
}: HydrateDriverRouteByIdFlowDependencies) {
  if (routeId <= 0) {
    return false
  }

  const existingRoute = selectRouteByServerId(routeId)(useRoutesStore.getState())
  const existingSnapshot = routeSnapshotMetaStore.getState()
  const hasFreshSnapshot = (
    existingSnapshot.route != null
    && existingSnapshot.hydratedRouteId === routeId
    && !shouldRefreshForFreshness(
      existingSnapshot.hydratedRouteFreshnessUpdatedAt,
      freshAfter,
    )
  )
  const staleByFreshness = shouldRefreshForFreshness(
    getCanonicalRouteFreshness(existingSnapshot.route ?? existingRoute),
    freshAfter,
  )

  if (!force && hasFreshSnapshot && !staleByFreshness) {
    maybeSelectHydratedRoute((existingSnapshot.route ?? existingRoute)?.client_id ?? '', workspaceScopeKey)
    return true
  }

  const existingRequest = inFlightHydrations.get(routeId)
  if (existingRequest) {
    return existingRequest
  }

  const request = (async () => {
    try {
      const payload = await loadRouteByIdQuery(routeId)
      setRoutes({
        byClientId: {
          [payload.route.client_id]: toRouteSummary(payload.route),
        },
        allIds: [payload.route.client_id],
      })
      clearOrders()
      setOrders(payload.orders)
      clearStops()
      setStops(payload.stops)
      setRouteSnapshotMeta(
        payload.route,
        payload.route.id,
        getCanonicalRouteFreshness(payload.route),
      )
      maybeSelectHydratedRoute(payload.route.client_id, workspaceScopeKey)
      return true
    } catch (error) {
      console.error('Failed to hydrate driver route by id', error)
      return false
    } finally {
      inFlightHydrations.delete(routeId)
    }
  })()

  inFlightHydrations.set(routeId, request)
  return request
}

function maybeSelectHydratedRoute(routeClientId: string, workspaceScopeKey: DriverWorkspaceScopeKey) {
  if (!routeClientId) {
    return
  }

  const selectedRouteClientId = selectSelectedRouteClientId(useRoutesSelectionStore.getState())
  if (selectedRouteClientId) {
    return
  }

  selectRouteFlow({
    routeClientId,
    workspaceScopeKey,
  })
}

function getCanonicalRouteFreshness(
  route: {
    delivery_plan?: { updated_at: string | null } | null
    updated_at?: string | null
  } | null | undefined,
) {
  return route?.delivery_plan?.updated_at ?? route?.updated_at ?? null
}

function toRouteSummary(route: DriverRouteRecord): DriverRouteRecord {
  return {
    id: route.id,
    client_id: route.client_id,
    _representation: 'summary',
    is_selected: route.is_selected,
    driver_id: route.driver_id,
    route_solution_id: route.route_solution_id,
    route_group_id: route.route_group_id,
    local_delivery_plan_id: route.local_delivery_plan_id,
    created_at: route.created_at,
    updated_at: route.updated_at,
    delivery_plan: route.delivery_plan ?? null,
  }
}
