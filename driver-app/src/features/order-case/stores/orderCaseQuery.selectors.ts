import type { OrderCaseQueryStoreState } from './orderCaseQuery.store'

export const selectOrderCaseQueryScope = (
  state: OrderCaseQueryStoreState,
  orderId: number | null | undefined,
) => {
  if (orderId == null) {
    return null
  }

  return state.scopes[orderId] ?? null
}
