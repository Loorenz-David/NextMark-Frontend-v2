import type { ReactNode } from 'react'
import type { useStorePickupPageController } from '../controllers/useStorePickupPageController'
type StorePickupPageModel = ReturnType<typeof useStorePickupPageController>
export type StorePickupOrdersContextType = StorePickupPageModel & {
  planId: number
}
type StorePickupOrdersProviderProps = {
  value: StorePickupOrdersContextType
  children: ReactNode
}
import { StorePickupOrdersContext } from './StorePickupOrders.provider'

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
