import { createContext } from 'react'
import type { ReactNode } from 'react'
import type { useOrderCaseMainController } from '../controllers/useOrderCaseMain.controller'

type OrderCaseMainContextValue = ReturnType<typeof useOrderCaseMainController> | null

const OrderCaseMainContext = createContext<OrderCaseMainContextValue>(null)

export function OrderCaseMainContextProvider({
  children,
  value,
}: {
  children: ReactNode
  value: NonNullable<OrderCaseMainContextValue>
}) {
  return (
    <OrderCaseMainContext.Provider value={value}>
      {children}
    </OrderCaseMainContext.Provider>
  )
}

export { OrderCaseMainContext }
