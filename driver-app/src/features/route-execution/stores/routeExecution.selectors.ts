import type { DriverOrderStateIds } from '@/features/order-states'
import type { DriverOrderRecord } from '@/features/routes/orders'
import type { DriverRouteStopRecord } from '@/features/routes/stops'
import {
  createDriverOrderLookup,
  mapDriverRouteRecordToAssignedRouteViewModel,
} from '../domain/mapActiveRoutesToAssignedRouteViewModel'
import type { RouteExecutionStoreState, RouteExecutionWorkspaceState } from './routeExecution.store'

export function selectRouteExecutionWorkspaceState(
  state: RouteExecutionStoreState,
): RouteExecutionWorkspaceState {
  return state.workspace
}

export function selectAssignedRoute(
  state: RouteExecutionStoreState,
  orderStateIds: DriverOrderStateIds,
) {
  const routeRecord = state.workspace.routeRecord
  if (!routeRecord) {
    return null
  }

  const orderLookup = createDriverOrderLookup(
    state.workspace.orders.allIds
      .map((clientId) => state.workspace.orders.byClientId[clientId])
      .filter((order): order is DriverOrderRecord => Boolean(order)),
  )
  const routeStops = state.workspace.stops.allIds
    .map((clientId) => state.workspace.stops.byClientId[clientId])
    .filter((stop): stop is DriverRouteStopRecord => {
      return Boolean(stop) && stop.route_solution_id === routeRecord.id
    })

  return mapDriverRouteRecordToAssignedRouteViewModel(
    routeRecord,
    orderLookup,
    routeStops,
    orderStateIds,
  )
}

export function selectAssignedStopByClientId(
  state: RouteExecutionStoreState,
  orderStateIds: DriverOrderStateIds,
  stopClientId?: string,
) {
  if (!stopClientId) {
    return null
  }

  return selectAssignedRoute(state, orderStateIds)?.stops.find((stop) => stop.stopClientId === stopClientId) ?? null
}
