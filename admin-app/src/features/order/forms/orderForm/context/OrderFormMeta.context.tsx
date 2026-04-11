import { createContext, useContext, type ReactNode } from 'react'

import type { OrderFormMetaSlice } from '../state/OrderForm.types'

const OrderFormMetaContext = createContext<OrderFormMetaSlice | null>(null)

export const OrderFormMetaContextProvider = ({
  value,
  children,
}: {
  value: OrderFormMetaSlice
  children: ReactNode
}) => <OrderFormMetaContext.Provider value={value}>{children}</OrderFormMetaContext.Provider>

export const useOrderFormMetaSlice = () => {
  const context = useContext(OrderFormMetaContext)
  if (!context) {
    throw new Error('OrderFormMetaContext is not available. Wrap with OrderFormProvider.')
  }
  return context
}
