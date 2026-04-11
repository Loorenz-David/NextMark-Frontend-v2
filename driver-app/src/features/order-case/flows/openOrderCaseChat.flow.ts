type OpenOrderCaseChatFlowOptions = {
  orderCaseId: number
  orderCaseClientId: string
  orderId: number
  openCase: (orderCaseId: number, orderCaseClientId: string) => void
}

export async function openOrderCaseChatFlow(options: OpenOrderCaseChatFlowOptions) {
  const { orderCaseId, orderCaseClientId, openCase } = options
  openCase(orderCaseId, orderCaseClientId)
}
