import type { ReactNode } from 'react'
import { useOrderCaseMainController } from '../controllers'
import { OrderCaseMainContextProvider } from './orderCaseMain.context'

type OrderCaseMainProviderProps = {
  children: ReactNode
  closeOverlay: () => void
  freshAfter?: string | null
  initialOrderCaseClientId?: string
  initialOrderCaseId?: number
  orderId: number
}

export function OrderCaseMainProvider({
  children,
  closeOverlay,
  freshAfter,
  initialOrderCaseClientId,
  initialOrderCaseId,
  orderId,
}: OrderCaseMainProviderProps) {
  const controller = useOrderCaseMainController({
    orderId,
    closeOverlay,
    freshAfter,
    initialOrderCaseClientId,
    initialOrderCaseId,
  })

  return (
    <OrderCaseMainContextProvider value={controller}>
      {children}
    </OrderCaseMainContextProvider>
  )
}
