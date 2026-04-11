import type { PropsWithChildren } from 'react'

import { useOrderCasesByOrderFlow } from '../../flows/orderCasePages.flow'
import { useCaseOrderActions } from '../../pages/order/order.actions'
import { useOrderCaseChatRealtime } from '../../realtime/useOrderCaseChatRealtime'
import { CaseOrderContext } from './caseOrder.context'

type CaseOrderProviderProps = PropsWithChildren<{
  orderId: number
  onClose?: () => void
}>

export const CaseOrderProvider = ({ children, orderId, onClose }: CaseOrderProviderProps) => {
  const { cases, casesStats, refreshCases } = useOrderCasesByOrderFlow(orderId)
  const caseOrderActions = useCaseOrderActions({ onClose })

  useOrderCaseChatRealtime({
    orderId,
    onMessageCreated: () => {
      if (typeof orderId === 'number') {
        void refreshCases(orderId)
      }
    },
  })

  const value = {
    cases,
    casesStats,
    caseOrderActions,
  }

  return <CaseOrderContext.Provider value={value}>{children}</CaseOrderContext.Provider>
}
