import { useMemo, useState } from 'react'
import { useOrderCaseListController } from './useOrderCaseList.controller'
import { useOrderCaseChatController } from './useOrderCaseChat.controller'

type UseOrderCaseMainControllerOptions = {
  orderId: number
  closeOverlay: () => void
  freshAfter?: string | null
  initialOrderCaseClientId?: string
  initialOrderCaseId?: number
}

export function useOrderCaseMainController({
  orderId,
  closeOverlay,
  freshAfter,
  initialOrderCaseClientId,
  initialOrderCaseId,
}: UseOrderCaseMainControllerOptions) {
  const [selectedOrderCaseId, setSelectedOrderCaseId] = useState<number | null>(initialOrderCaseId ?? null)
  const [selectedOrderCaseClientId, setSelectedOrderCaseClientId] = useState<string | null>(
    initialOrderCaseClientId ?? null,
  )
  const [direction, setDirection] = useState<1 | -1>(1)

  const listController = useOrderCaseListController({
    orderId,
    openCase: (orderCaseId, orderCaseClientId) => {
      setDirection(1)
      setSelectedOrderCaseId(orderCaseId)
      setSelectedOrderCaseClientId(orderCaseClientId)
    },
  })

  const chatController = useOrderCaseChatController({
    freshAfter,
    orderCaseClientId: selectedOrderCaseClientId ?? '',
    orderCaseId: selectedOrderCaseId ?? -1,
  })

  const closeCaseChat = () => {
    setDirection(-1)
    setSelectedOrderCaseId(null)
    setSelectedOrderCaseClientId(null)
  }

  const view = selectedOrderCaseId && selectedOrderCaseClientId ? 'chat' : 'list'

  return useMemo(() => ({
    view,
    direction,
    closeOverlay,
    openCase: (orderCaseId: number, orderCaseClientId: string) => {
      setDirection(1)
      setSelectedOrderCaseId(orderCaseId)
      setSelectedOrderCaseClientId(orderCaseClientId)
    },
    closeCaseChat,
    selectedCase: selectedOrderCaseId && selectedOrderCaseClientId
      ? {
          orderCaseId: selectedOrderCaseId,
          orderCaseClientId: selectedOrderCaseClientId,
        }
      : null,
    listController,
    chatController,
  }), [
    chatController,
    closeOverlay,
    direction,
    listController,
    selectedOrderCaseClientId,
    selectedOrderCaseId,
    view,
  ])
}
