import type { OrderCaseState } from '../domain'
import { updateOrderCaseStateApi } from '../api'

type UpdateOrderCaseStateActionOptions = {
  orderCaseId: number
  nextState: OrderCaseState
}

export async function updateOrderCaseStateAction({
  orderCaseId,
  nextState,
}: UpdateOrderCaseStateActionOptions) {
  await updateOrderCaseStateApi(orderCaseId, { state: nextState })
  return true
}
