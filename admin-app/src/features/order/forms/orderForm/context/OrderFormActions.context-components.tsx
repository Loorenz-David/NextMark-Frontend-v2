import { type ReactNode } from 'react'
import type { OrderFormActionsSlice } from '../state/OrderForm.types'
import { OrderFormActionsContext } from './OrderFormActions.context'

export const OrderFormActionsContextProvider = ({
  value,
  children,
}: {
  value: OrderFormActionsSlice
  children: ReactNode
}) => <OrderFormActionsContext.Provider value={value}>{children}</OrderFormActionsContext.Provider>
