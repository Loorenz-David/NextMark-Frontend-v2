import type { OrderStateMap } from '@shared-domain'
import { useOrderStatesStore } from './orderStates.store'

export const setOrderStates = (orderStates: OrderStateMap) => {
  useOrderStatesStore.getState().insertMany(orderStates)
}

export const clearOrderStates = () => {
  useOrderStatesStore.getState().clear()
}
