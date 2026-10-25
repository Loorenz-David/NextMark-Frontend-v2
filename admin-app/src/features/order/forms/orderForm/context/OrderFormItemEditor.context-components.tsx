import { type ReactNode } from 'react'
import type { OrderFormItemEditorSlice } from '../state/OrderForm.types'
import { OrderFormItemEditorContext } from './OrderFormItemEditor.context'

export const OrderFormItemEditorContextProvider = ({
  value,
  children,
}: {
  value: OrderFormItemEditorSlice
  children: ReactNode
}) => <OrderFormItemEditorContext.Provider value={value}>{children}</OrderFormItemEditorContext.Provider>
