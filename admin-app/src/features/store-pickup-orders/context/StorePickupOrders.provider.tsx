import { createContext } from 'react'
import type { ReactNode } from 'react'

type StorePickupOrdersContextType = {
  planId: number | null
}

export const StorePickupOrdersContext = createContext<StorePickupOrdersContextType | null>(null)

type StorePickupOrdersProviderProps = {
  planId: number
  children: ReactNode
}

export const StorePickupOrdersProvider = ({
  planId,
  children,
}: StorePickupOrdersProviderProps) => {
  const value: StorePickupOrdersContextType = {
    planId,
  }

  return (
    <StorePickupOrdersContext.Provider value={value}>
      {children}
    </StorePickupOrdersContext.Provider>
  )
}
