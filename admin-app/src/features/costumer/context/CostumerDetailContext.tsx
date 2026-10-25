import { createContext, useContext } from 'react'

import type { Costumer } from '../dto/costumer.dto'

type CostumerDetailContextValue = {
  costumer: Costumer | null
  closeCostumerDetail: () => void
  openCostumerEditForm: (clientId?: string | null) => void
  openOrderFormCreateForCostumer: (costumerId?: number | null) => void
  openOrderDetail: (payload: { clientId?: string; serverId?: number }) => void
}

export const CostumerDetailContext = createContext<CostumerDetailContextValue | null>(null)


export const useCostumerDetailContext = () => {
  const context = useContext(CostumerDetailContext)
  if (!context) {
    throw new Error('useCostumerDetailContext must be used within CostumerDetailProvider')
  }
  return context
}

