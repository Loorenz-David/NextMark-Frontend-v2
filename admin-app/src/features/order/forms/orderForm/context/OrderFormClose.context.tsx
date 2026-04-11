import { createContext, useContext, type ReactNode } from 'react'

import type { OrderFormCloseSlice } from '../state/OrderForm.types'

const OrderFormCloseContext = createContext<OrderFormCloseSlice | null>(null)

export const OrderFormCloseContextProvider = ({
  value,
  children,
}: {
  value: OrderFormCloseSlice
  children: ReactNode
}) => <OrderFormCloseContext.Provider value={value}>{children}</OrderFormCloseContext.Provider>

export const useOrderFormCloseSlice = () => {
  const context = useContext(OrderFormCloseContext)
  if (!context) {
    throw new Error('OrderFormCloseContext is not available. Wrap with OrderFormProvider.')
  }
  return context
}
