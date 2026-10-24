import { type ReactNode } from 'react'
import type { OrderFormMetaSlice } from '../state/OrderForm.types'
import { OrderFormMetaContext } from './OrderFormMeta.context'

export const OrderFormMetaContextProvider = ({
  value,
  children,
}: {
  value: OrderFormMetaSlice
  children: ReactNode
}) => <OrderFormMetaContext.Provider value={value}>{children}</OrderFormMetaContext.Provider>
