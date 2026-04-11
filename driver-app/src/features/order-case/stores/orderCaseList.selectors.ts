import type { OrderCaseListStoreState } from './orderCaseList.store'

export const selectOrderCaseListScope = (
  state: OrderCaseListStoreState,
  orderId: number | null | undefined,
) => {
  if (orderId == null) {
    return null
  }

  return state.scopes[orderId] ?? null
}
