import { type ReactNode } from 'react'
import type { OrderFormFormSlice } from '../state/OrderForm.types'
import { OrderFormFormContext } from './OrderFormForm.context'

export const OrderFormFormContextProvider = ({
  value,
  children,
}: {
  value: OrderFormFormSlice
  children: ReactNode
}) => <OrderFormFormContext.Provider value={value}>{children}</OrderFormFormContext.Provider>
