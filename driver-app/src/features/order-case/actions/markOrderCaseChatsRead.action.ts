import { markOrderCaseChatsReadApi } from '../api'

export async function markOrderCaseChatsReadAction(orderCaseId: number) {
  const response = await markOrderCaseChatsReadApi(orderCaseId)
  return response.data
}
