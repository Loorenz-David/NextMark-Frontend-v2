import { type ReactNode } from 'react'
import type { OrderFormCloseSlice } from '../state/OrderForm.types'
import { OrderFormCloseContext } from './OrderFormClose.context'

export const OrderFormCloseContextProvider = ({
  value,
  children,
}: {
  value: OrderFormCloseSlice
  children: ReactNode
}) => <OrderFormCloseContext.Provider value={value}>{children}</OrderFormCloseContext.Provider>
