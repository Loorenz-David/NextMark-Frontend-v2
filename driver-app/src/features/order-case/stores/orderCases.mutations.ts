import type { OrderCase, OrderCaseMap, OrderCaseState } from '../domain'
import { useOrderCasesStore } from './orderCases.store'
import { selectOrderCaseByServerId } from './orderCases.selectors'

export const setOrderCases = (table: OrderCaseMap) => useOrderCasesStore.getState().insertMany(table)

export const upsertOrderCase = (orderCase: OrderCase) => {
  const state = useOrderCasesStore.getState()

  if (state.byClientId[orderCase.client_id]) {
    state.update(orderCase.client_id, (existing) => ({ ...existing, ...orderCase }))
    return
  }

  state.insert(orderCase)
}

export const upsertOrderCases = (table: OrderCaseMap) => {
  table.allIds.forEach((clientId) => {
    const orderCase = table.byClientId[clientId]
    if (!orderCase) return
    upsertOrderCase(orderCase)
  })
}

export const removeOrderCaseByClientId = (clientId: string) => useOrderCasesStore.getState().remove(clientId)

export const clearOrderCases = () => useOrderCasesStore.getState().clear()

export const patchOrderCaseByClientId = (clientId: string, partial: Partial<OrderCase>) =>
  useOrderCasesStore.getState().patch(clientId, partial)

export const updateOrderCaseState = (caseId: number, nextState: OrderCaseState) => {
  const orderCase = selectOrderCaseByServerId(caseId)(useOrderCasesStore.getState())
  if (!orderCase) return

  useOrderCasesStore.getState().update(orderCase.client_id, (existing) => ({
    ...existing,
    state: nextState,
  }))
}

export const updateOrderCaseUnseenCount = (caseId: number, count: number) => {
  const orderCase = selectOrderCaseByServerId(caseId)(useOrderCasesStore.getState())
  if (!orderCase) return

  useOrderCasesStore.getState().update(orderCase.client_id, (existing) => ({
    ...existing,
    unseen_chats: count,
  }))
}
