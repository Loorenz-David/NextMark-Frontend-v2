import { createContext, useContext, type ReactNode } from 'react'

import type { OrderFormFormSlice } from '../state/OrderForm.types'

const OrderFormFormContext = createContext<OrderFormFormSlice | null>(null)

export const OrderFormFormContextProvider = ({
  value,
  children,
}: {
  value: OrderFormFormSlice
  children: ReactNode
}) => <OrderFormFormContext.Provider value={value}>{children}</OrderFormFormContext.Provider>

export const useOrderFormFormSlice = () => {
  const context = useContext(OrderFormFormContext)
  if (!context) {
    throw new Error('OrderFormFormContext is not available. Wrap with OrderFormProvider.')
  }
  return context
}
