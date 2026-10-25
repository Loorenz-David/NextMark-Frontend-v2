import { createContext } from 'react'

import type { useStorePickupPageController } from '../controllers/useStorePickupPageController'

type StorePickupPageModel = ReturnType<typeof useStorePickupPageController>

export type StorePickupOrdersContextType = StorePickupPageModel & {
  planId: number
}

export const StorePickupOrdersContext =
  createContext<StorePickupOrdersContextType | null>(null)
