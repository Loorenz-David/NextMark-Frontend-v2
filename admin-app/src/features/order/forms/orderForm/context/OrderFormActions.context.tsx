import { createContext, useContext, type ReactNode } from 'react'

import type { OrderFormActionsSlice } from '../state/OrderForm.types'

const OrderFormActionsContext = createContext<OrderFormActionsSlice | null>(null)

export const OrderFormActionsContextProvider = ({
  value,
  children,
}: {
  value: OrderFormActionsSlice
  children: ReactNode
}) => <OrderFormActionsContext.Provider value={value}>{children}</OrderFormActionsContext.Provider>

export const useOrderFormActionsSlice = () => {
  const context = useContext(OrderFormActionsContext)
  if (!context) {
    throw new Error('OrderFormActionsContext is not available. Wrap with OrderFormProvider.')
  }
  return context
}
