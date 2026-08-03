import { createContext } from 'react'
import type { ReactNode } from 'react'

import type { useInternationalShippingPageController } from '../controllers/useInternationalShippingPageController'

type InternationalShippingPageModel = ReturnType<
  typeof useInternationalShippingPageController
>

export type InternationalShippingOrdersContextType =
  InternationalShippingPageModel & {
    planId: number
  }

export const InternationalShippingOrdersContext =
  createContext<InternationalShippingOrdersContextType | null>(null)

type InternationalShippingOrdersProviderProps = {
  value: InternationalShippingOrdersContextType
  children: ReactNode
}

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
