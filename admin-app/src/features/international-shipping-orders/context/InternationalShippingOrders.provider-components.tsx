import type { ReactNode } from 'react'
import type { useInternationalShippingPageController } from '../controllers/useInternationalShippingPageController'
type InternationalShippingPageModel = ReturnType<
  typeof useInternationalShippingPageController
>
export type InternationalShippingOrdersContextType =
  InternationalShippingPageModel & {
    planId: number
  }
type InternationalShippingOrdersProviderProps = {
  value: InternationalShippingOrdersContextType
  children: ReactNode
}
import { InternationalShippingOrdersContext } from './InternationalShippingOrders.provider'

export const InternationalShippingOrdersProvider = ({
  value,
  children,
}: InternationalShippingOrdersProviderProps) => {
  return (
    <InternationalShippingOrdersContext.Provider value={value}>
      {children}
    </InternationalShippingOrdersContext.Provider>
  )
}
