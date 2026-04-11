import { createContext } from 'react'
import type { ReactNode } from 'react'

type InternationalShippingOrdersContextType = {
  planId: number | null
}

export const InternationalShippingOrdersContext = createContext<InternationalShippingOrdersContextType | null>(null)

type InternationalShippingOrdersProviderProps = {
  planId: number
  children: ReactNode
}

export const InternationalShippingOrdersProvider = ({
  planId,
  children,
}: InternationalShippingOrdersProviderProps) => {
  const value: InternationalShippingOrdersContextType = {
    planId,
  }

  return (
    <InternationalShippingOrdersContext.Provider value={value}>
      {children}
    </InternationalShippingOrdersContext.Provider>
  )
}
