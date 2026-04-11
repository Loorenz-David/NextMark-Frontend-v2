import {
  selectAll,
  selectByClientId,
  selectByServerId,
  type EntityTable,
} from '@shared-store'
import type { DriverRouteRecord } from '../../domain'
import type { DriverRouteStopRecord } from '../domain'

export const selectAllStops = (state: EntityTable<DriverRouteStopRecord>) =>
  selectAll<DriverRouteStopRecord>()(state)

export const selectStopByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<DriverRouteStopRecord>) =>
    selectByClientId<DriverRouteStopRecord>(clientId)(state)

export const selectStopByServerId = (id: number | null | undefined) =>
  (state: EntityTable<DriverRouteStopRecord>) =>
    selectByServerId<DriverRouteStopRecord>(id)(state)

export function selectStopsByRouteId(
  state: EntityTable<DriverRouteStopRecord>,
  routeId: number | null | undefined,
) {
  if (routeId == null) {
    return []
  }

  return state.allIds
    .map((clientId) => state.byClientId[clientId])
    .filter((stop) => stop?.route_solution_id === routeId)
}

export function selectStopsByRouteRecord(
  state: EntityTable<DriverRouteStopRecord>,
  route: DriverRouteRecord | null,
) {
  return selectStopsByRouteId(state, route?.id)
}
