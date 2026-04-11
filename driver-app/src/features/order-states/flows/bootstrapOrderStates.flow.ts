import { clearOrderStates, setOrderStates } from '../stores'
import type { OrderStateMap } from '@shared-domain'

export function hydrateOrderStatesFlow(orderStates: OrderStateMap) {
  clearOrderStates()
  setOrderStates(orderStates)
}
