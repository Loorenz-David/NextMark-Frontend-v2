import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { createEntityStore } from "@shared-store"
import type { EntityTable } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId, selectVisible } from "@shared-store"

import type { CaseChat, OrderCase, OrderCaseMap, OrderCaseState } from '../types'

export const useOrderCaseStore = createEntityStore<OrderCase>()

export const selectAllOrderCases = (state: EntityTable<OrderCase>) => selectAll<OrderCase>()(state)
export const selectVisibleOrderCases = (state: EntityTable<OrderCase>) => selectVisible<OrderCase>()(state)

export const selectOrderCaseById = (id: number | null | undefined) =>
  (state: EntityTable<OrderCase>) => selectByServerId<OrderCase>(id)(state)

export const selectOrderCaseByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<OrderCase>) => selectByClientId<OrderCase>(clientId)(state)


export const selectOrderCasesByOrderId = (orderId: number | null | undefined) =>
  (state: EntityTable<OrderCase>) => {
    if (orderId == null) return []

    return state.allIds
      .map((clientId) => state.byClientId[clientId])
      .filter((orderCase) => orderCase.order_id === orderId)
  }

export const useOrderCases = () => useOrderCaseStore(useShallow(selectAllOrderCases))
export const useVisibleOrderCases = () => useOrderCaseStore(useShallow(selectVisibleOrderCases))

export const useOrderCaseById = (id: number | null | undefined) =>
  useOrderCaseStore(selectOrderCaseById(id))

export  const useOrderCaseByClientId = (clientId: string | null | undefined) =>
  useOrderCaseStore(selectOrderCaseByClientId(clientId))

export const useOrderCasesByOrderId = (orderId: number | null | undefined) =>
  useOrderCaseStore(useShallow(selectOrderCasesByOrderId(orderId)))

export const setOrderCases = (table: OrderCaseMap) =>
  useOrderCaseStore.getState().insertMany(table)

export const setVisibleOrderCases = (clientIds: string[] | null) =>
  useOrderCaseStore.getState().setVisibleIds(clientIds)

export const upsertOrderCase = (orderCase: OrderCase) => {
  const state = useOrderCaseStore.getState()

  if (state.byClientId[orderCase.client_id]) {
    state.update(orderCase.client_id, (existing) => ({...existing,...orderCase,}))
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

export const removeOrderCaseByClientId = (clientId: string) =>
  useOrderCaseStore.getState().remove(clientId)

export const clearOrderCases = () => useOrderCaseStore.getState().clear()

export const appendChatToCase = (caseId: number, chat: CaseChat) => {
  const orderCase = selectOrderCaseById(caseId)(useOrderCaseStore.getState())
  if (!orderCase) return

  useOrderCaseStore.getState().update(orderCase.client_id, (existing) => ({
    ...existing,
    chats: [...existing.chats, chat],
  }))
}

export const updateCaseState = (caseId: number, nextState: OrderCaseState) => {
  const orderCase = selectOrderCaseById(caseId)(useOrderCaseStore.getState())
  if (!orderCase) return

  useOrderCaseStore.getState().update(orderCase.client_id, (existing) => ({
    ...existing,
    state: nextState,
  }))
}

export const updateUnseenCount = (caseId: number, count: number) => {
  const orderCase = selectOrderCaseById(caseId)(useOrderCaseStore.getState())
  if (!orderCase) return

  useOrderCaseStore.getState().update(orderCase.client_id, (existing) => ({
    ...existing,
    unseen_chats: count,
  }))
}



export const useSetOrderCases = () =>
  useCallback((table: OrderCaseMap) => {
    setOrderCases(table)
  }, [])

export const useUpsertOrderCase = () =>
  useCallback((orderCase: OrderCase) => {
    upsertOrderCase(orderCase)
  }, [])

export const useRemoveOrderCase = () =>
  useCallback((clientId: string) => {
    removeOrderCaseByClientId(clientId)
  }, [])
