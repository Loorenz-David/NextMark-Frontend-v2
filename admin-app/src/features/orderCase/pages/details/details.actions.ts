import { useCallback, useState } from 'react'

import { useSectionManager } from '@/shared/resource-manager/useResourceManager'
import { useOrderForCase } from '@/features/order'

import { useDetailsControllers } from '../../controllers/details.controllers'
import type { OrderCaseState } from '../../types'
import { useOrderCaseByClientId } from '../../store/orderCaseStore'

export const useDetailsActions = (
  orderCaseClientId: string,
  { onClose }: { onClose?: () => void } = {},
) => {
  const orderCase = useOrderCaseByClientId(orderCaseClientId)
  const [message, setMessage] = useState('')
  const { updateState, sendChat, loadCaseDetails } = useDetailsControllers()
  const { changeOrderOpenCasesCount } = useOrderForCase()
  const sectionManager = useSectionManager()

  const closeCaseDetails = useCallback(() => {
    if (onClose) {
      onClose()
      return
    }
    sectionManager.close()
  }, [onClose, sectionManager])

  const changeState = async (nextState: OrderCaseState) => {
    if (!orderCase?.id) return

    const orderId = orderCase?.order_id
    const isNextResolved = nextState === 'Resolved'

    if (isNextResolved) {
      changeOrderOpenCasesCount(orderId, -1)
      closeCaseDetails()
    }

    const success = await updateState(orderCase.id, nextState)

    if (!success && isNextResolved) {
      changeOrderOpenCasesCount(orderId, 1)
    }
  }

  const addChat = async () => {
    if (!orderCase?.id) return
    const previousMessage = message
    setMessage('')

    const success = await sendChat(orderCase.id, message)

    if (!success) {
      setMessage((prev) => previousMessage + '\t' + prev)
    }
  }

  return {
    closeCaseDetails,
    changeState,
    addChat,
    refreshCaseDetails: async (orderCaseId: number) => {
      await loadCaseDetails(orderCaseId)
    },
    setMessage,
    message,
  }
}
