import { createContext, useContext } from 'react'

import type { OrderFormFormSlice } from '../state/OrderForm.types'

export const OrderFormFormContext = createContext<OrderFormFormSlice | null>(null)


export const useOrderFormFormSlice = () => {
  const context = useContext(OrderFormFormContext)
  if (!context) {
    throw new Error('OrderFormFormContext is not available. Wrap with OrderFormProvider.')
  }
  return context
}
