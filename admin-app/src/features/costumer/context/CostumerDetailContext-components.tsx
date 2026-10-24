import { type ReactNode } from 'react'
import type { Costumer } from '../dto/costumer.dto'
type CostumerDetailContextValue = {
  costumer: Costumer | null
  closeCostumerDetail: () => void
  openCostumerEditForm: (clientId?: string | null) => void
  openOrderFormCreateForCostumer: (costumerId?: number | null) => void
  openOrderDetail: (payload: { clientId?: string; serverId?: number }) => void
}
import { CostumerDetailContext } from './CostumerDetailContext'

export const CostumerDetailContextProvider = ({
  value,
  children,
}: {
  value: CostumerDetailContextValue
  children: ReactNode
}) => <CostumerDetailContext.Provider value={value}>{children}</CostumerDetailContext.Provider>
