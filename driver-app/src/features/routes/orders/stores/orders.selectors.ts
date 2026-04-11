import {
  selectAll,
  selectByClientId,
  selectByServerId,
  type EntityTable,
} from '@shared-store'
import type { DriverOrderRecord } from '../domain'

export const selectAllOrders = (state: EntityTable<DriverOrderRecord>) =>
  selectAll<DriverOrderRecord>()(state)

export const selectOrderByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<DriverOrderRecord>) =>
    selectByClientId<DriverOrderRecord>(clientId)(state)

export const selectOrderByServerId = (id: number | null | undefined) =>
  (state: EntityTable<DriverOrderRecord>) =>
    selectByServerId<DriverOrderRecord>(id)(state)
