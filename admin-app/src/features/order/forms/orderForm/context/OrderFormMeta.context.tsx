import { createContext, useContext } from 'react'

import type { OrderFormMetaSlice } from '../state/OrderForm.types'

export const OrderFormMetaContext = createContext<OrderFormMetaSlice | null>(null)


export const useOrderFormMetaSlice = () => {
  const context = useContext(OrderFormMetaContext)
  if (!context) {
    throw new Error('OrderFormMetaContext is not available. Wrap with OrderFormProvider.')
  }
  return context
}
