import { createContext, useContext } from 'react'

import type { OrderFormActionsSlice } from '../state/OrderForm.types'

export const OrderFormActionsContext = createContext<OrderFormActionsSlice | null>(null)


export const useOrderFormActionsSlice = () => {
  const context = useContext(OrderFormActionsContext)
  if (!context) {
    throw new Error('OrderFormActionsContext is not available. Wrap with OrderFormProvider.')
  }
  return context
}
