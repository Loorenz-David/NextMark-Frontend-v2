import { createContext, useContext, type ReactNode } from 'react'

import type { Costumer } from '../dto/costumer.dto'

type CostumerDetailContextValue = {
  costumer: Costumer | null
  closeCostumerDetail: () => void
  openCostumerEditForm: (clientId?: string | null) => void
  openOrderFormCreateForCostumer: (costumerId?: number | null) => void
  openOrderDetail: (payload: { clientId?: string; serverId?: number }) => void
}

const CostumerDetailContext = createContext<CostumerDetailContextValue | null>(null)

export const CostumerDetailContextProvider = ({
  value,
  children,
}: {
  value: CostumerDetailContextValue
  children: ReactNode
}) => <CostumerDetailContext.Provider value={value}>{children}</CostumerDetailContext.Provider>

export const useCostumerDetailContext = () => {
  const context = useContext(CostumerDetailContext)
  if (!context) {
    throw new Error('useCostumerDetailContext must be used within CostumerDetailProvider')
  }
  return context
}

