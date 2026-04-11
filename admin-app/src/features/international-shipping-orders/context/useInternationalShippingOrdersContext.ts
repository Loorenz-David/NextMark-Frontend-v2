import { useContext } from 'react'
import { InternationalShippingOrdersContext } from './InternationalShippingOrders.provider'

export const useInternationalShippingOrdersContext = () => {
  const context = useContext(InternationalShippingOrdersContext)
  if (!context) {
    throw new Error(
      'useInternationalShippingOrdersContext must be used within InternationalShippingOrdersProvider'
    )
  }
  return context
}
