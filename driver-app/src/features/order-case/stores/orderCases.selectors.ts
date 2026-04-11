import {
  selectAll,
  selectByClientId,
  selectByServerId,
  type EntityTable,
} from '@shared-store'
import type { OrderCase } from '../domain'

function byNewestFirst(a: OrderCase, b: OrderCase) {
  return new Date(b.creation_date).getTime() - new Date(a.creation_date).getTime()
}

export const selectAllOrderCases = (state: EntityTable<OrderCase>) => selectAll<OrderCase>()(state)

export const selectOrderCaseByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<OrderCase>) => selectByClientId<OrderCase>(clientId)(state)

export const selectOrderCaseByServerId = (id: number | null | undefined) =>
  (state: EntityTable<OrderCase>) => selectByServerId<OrderCase>(id)(state)

export const selectOrderCasesByOrderId = (
  state: EntityTable<OrderCase>,
  orderId: number | null | undefined,
) => {
  if (orderId == null) return []

  return state.allIds
    .map((clientId) => state.byClientId[clientId])
    .filter((orderCase) => orderCase?.order_id === orderId)
    .sort(byNewestFirst)
}

export const selectActiveOrderCasesByOrderId = (
  state: EntityTable<OrderCase>,
  orderId: number | null | undefined,
) =>
  selectOrderCasesByOrderId(state, orderId).filter((orderCase) => orderCase.state !== 'Resolved')
