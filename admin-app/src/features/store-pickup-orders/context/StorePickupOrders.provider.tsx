import { createContext } from 'react'
import type { ReactNode } from 'react'

import type { useStorePickupPageController } from '../controllers/useStorePickupPageController'

type StorePickupPageModel = ReturnType<typeof useStorePickupPageController>

export type StorePickupOrdersContextType = StorePickupPageModel & {
  planId: number
}

export const StorePickupOrdersContext =
  createContext<StorePickupOrdersContextType | null>(null)

type StorePickupOrdersProviderProps = {
  value: StorePickupOrdersContextType
  children: ReactNode
}

export const StorePickupOrdersProvider = ({
  value,
  children,
}: StorePickupOrdersProviderProps) => {
  return (
    <StorePickupOrdersContext.Provider value={value}>
      {children}
    </StorePickupOrdersContext.Provider>
  )
}
