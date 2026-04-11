import { undoTerminalOrderApi } from '../api'

export async function undoTerminalOrderAction(orderId: number) {
  const response = await undoTerminalOrderApi(orderId)
  return response.data
}
