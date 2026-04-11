import { useContext } from 'react'
import { StorePickupOrdersContext } from './StorePickupOrders.provider'

export const useStorePickupOrdersContext = () => {
  const context = useContext(StorePickupOrdersContext)
  if (!context) {
    throw new Error(
      'useStorePickupOrdersContext must be used within StorePickupOrdersProvider'
    )
  }
  return context
}
