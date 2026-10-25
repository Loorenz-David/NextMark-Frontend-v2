import { createContext, useContext } from 'react'

import type { OrderFormItemEditorSlice } from '../state/OrderForm.types'

export const OrderFormItemEditorContext = createContext<OrderFormItemEditorSlice | null>(null)


export const useOrderFormItemEditorSlice = () => {
  const context = useContext(OrderFormItemEditorContext)
  if (!context) {
    throw new Error('OrderFormItemEditorContext is not available. Wrap with OrderFormProvider.')
  }
  return context
}
