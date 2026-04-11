import { createContext, useContext, type ReactNode } from 'react'

import type { OrderFormItemEditorSlice } from '../state/OrderForm.types'

const OrderFormItemEditorContext = createContext<OrderFormItemEditorSlice | null>(null)

export const OrderFormItemEditorContextProvider = ({
  value,
  children,
}: {
  value: OrderFormItemEditorSlice
  children: ReactNode
}) => <OrderFormItemEditorContext.Provider value={value}>{children}</OrderFormItemEditorContext.Provider>

export const useOrderFormItemEditorSlice = () => {
  const context = useContext(OrderFormItemEditorContext)
  if (!context) {
    throw new Error('OrderFormItemEditorContext is not available. Wrap with OrderFormProvider.')
  }
  return context
}
