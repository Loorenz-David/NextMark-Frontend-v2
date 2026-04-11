import { useEffect, useMemo, type PropsWithChildren } from 'react'

import { useCostumerDetailActions } from '../actions/costumerDetails.actions'
import { useCostumerQueries } from '../controllers/costumerQueries.controller'
import { useCostumerByClientId, useCostumerByServerId } from '../store/costumer.selectors'
import { CostumerDetailContextProvider } from './CostumerDetailContext'

type CostumerDetailPayload = {
  clientId?: string
  serverId?: number
  mode?: 'view' | 'edit'
}

export const CostumerDetailProvider = ({
  payload,
  onClose,
  children,
}: PropsWithChildren<{
  payload?: CostumerDetailPayload
  onClose?: () => void
}>) => {
  const actions = useCostumerDetailActions({ onClose })
  const { queryCostumerByServerId } = useCostumerQueries()

  const clientId = payload?.clientId ?? null
  const serverId = payload?.serverId ?? null

  const costumerByClient = useCostumerByClientId(clientId)
  const costumerByServer = useCostumerByServerId(serverId)
  const costumer = costumerByClient ?? costumerByServer ?? null

  useEffect(() => {
    if (costumer) return
    if (typeof serverId !== 'number') return
    void queryCostumerByServerId(serverId)
  }, [costumer, queryCostumerByServerId, serverId])

  const value = useMemo(
    () => ({
      costumer,
      closeCostumerDetail: actions.closeCostumerDetail,
      openCostumerEditForm: actions.openCostumerEditForm,
      openOrderFormCreateForCostumer: actions.openOrderFormCreateForCostumer,
      openOrderDetail: actions.openOrderDetail,
    }),
    [actions, costumer],
  )

  return <CostumerDetailContextProvider value={value}>{children}</CostumerDetailContextProvider>
}

