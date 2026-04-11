import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'

import type { OrderState, OrderStateMap } from '../types/orderState'
import {
  insertOrderStates,
  selectAllOrderStates,
  selectOrderStateByClientId,
  selectOrderStateByServerId,
  setOrderState,
  updateOrderStateByClientId,
  useOrderStateStore,
} from './orderState.store'

export const useOrderStates = () => useOrderStateStore(useShallow(selectAllOrderStates))

export const useOrderStateByClientId = (clientId: string | null | undefined) =>
  useOrderStateStore(selectOrderStateByClientId(clientId))

export const useOrderStateByServerId = (id: number | null | undefined) =>
  useOrderStateStore(selectOrderStateByServerId(id))

export const useSetOrderStateStore = () =>
  useCallback((orderState: OrderState) => {
    setOrderState(orderState)
  }, [])

export const useSetOrderStatesStore = () =>
  useCallback((table: OrderStateMap) => {
    insertOrderStates(table)
  }, [])

export const useUpdateOrderStateStore = () =>
  useCallback(
    (clientId: string, updater: (orderState: OrderState) => OrderState) => {
      updateOrderStateByClientId(clientId, updater)
    },
    [],
  )
