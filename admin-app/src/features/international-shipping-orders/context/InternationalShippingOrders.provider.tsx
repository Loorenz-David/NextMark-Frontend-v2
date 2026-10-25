import { createContext } from 'react'

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
