import { createContext, useContext } from 'react'

import type { OrderFormCloseSlice } from '../state/OrderForm.types'

export const OrderFormCloseContext = createContext<OrderFormCloseSlice | null>(null)


export const useOrderFormCloseSlice = () => {
  const context = useContext(OrderFormCloseContext)
  if (!context) {
    throw new Error('OrderFormCloseContext is not available. Wrap with OrderFormProvider.')
  }
  return context
}
