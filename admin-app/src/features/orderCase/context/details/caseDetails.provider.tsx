import { useMemo, type PropsWithChildren } from 'react'

import { apiClient } from '@/lib/api/ApiClient'

import { useOrderCaseDetailsFlow } from '../../flows/orderCasePages.flow'
import { useDetailsActions } from '../../pages/details/details.actions'
import { useOrderCaseChatRealtime } from '../../realtime/useOrderCaseChatRealtime'
import { DetailsCaseContext } from './caseDetails.context'

type CaseDetailsPageProviderProps = PropsWithChildren<{
  orderCaseClientId: string | null
  orderCaseId: number | null
  freshAfter?: string | null
  onClose?: () => void
}>

export const CaseDetailsPageProvider = ({
  children,
  orderCaseClientId,
  orderCaseId,
  freshAfter,
  onClose,
}: CaseDetailsPageProviderProps) => {
  const { orderCase, isRefreshing } = useOrderCaseDetailsFlow(orderCaseClientId, orderCaseId, freshAfter)

  const detailsActions = useDetailsActions(orderCaseClientId ?? '', { onClose })

  useOrderCaseChatRealtime({
    orderId: orderCase?.order_id,
    onMessageCreated: () => {
      if (typeof orderCase?.id === 'number') {
        void detailsActions.refreshCaseDetails(orderCase.id)
      }
    },
  })

  const currentUserId = useMemo(() => {
    const userId = apiClient.getSessionUserId()
    if (typeof userId !== 'number') return null
    return userId
  }, [])

  const value = {
    orderCase,
    detailsActions,
    currentUserId,
    isRefreshing,
  }

  return <DetailsCaseContext.Provider value={value}>{children}</DetailsCaseContext.Provider>
}
