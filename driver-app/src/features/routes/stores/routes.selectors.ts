import {
  selectAll,
  selectByClientId,
  selectByServerId,
  type EntityTable,
} from '@shared-store'
import type { DriverRouteRecord } from '../domain'

export const selectAllRoutes = (state: EntityTable<DriverRouteRecord>) =>
  selectAll<DriverRouteRecord>()(state)

export const selectRouteByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<DriverRouteRecord>) =>
    selectByClientId<DriverRouteRecord>(clientId)(state)

export const selectRouteByServerId = (id: number | null | undefined) =>
  (state: EntityTable<DriverRouteRecord>) =>
    selectByServerId<DriverRouteRecord>(id)(state)
