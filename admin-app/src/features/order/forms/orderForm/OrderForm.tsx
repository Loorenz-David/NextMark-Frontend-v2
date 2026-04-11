import type { ReactNode } from 'react'

import type { OrderFormPayload } from './state/OrderForm.types'
import { OrderFormProvider } from './providers/OrderForm.provider'

export const OrderFormFeature = ({
  payload,
  onClose,
  children,
}: {
  payload?: OrderFormPayload
  onClose?: () => void
  children: ReactNode
}) => (
  <OrderFormProvider payload={payload} onClose={onClose}>
    {children}
  </OrderFormProvider>
)
