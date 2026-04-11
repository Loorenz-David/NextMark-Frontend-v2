import { useMemo } from 'react'
import { useOrderCaseMainContext } from '../providers'

export function useOrderCaseChatPageController() {
  const main = useOrderCaseMainContext()

  return useMemo(() => ({
    chats: main.chatController.chats,
    currentUserId: main.chatController.currentUserId,
    draft: main.chatController.draft,
    isLoading: main.chatController.isLoading,
    isSending: main.chatController.isSending,
    isUpdatingState: main.chatController.isUpdatingState,
    loadError: main.chatController.loadError,
    onBack: main.closeCaseChat,
    onClose: main.closeOverlay,
    onSelectState: async (state: Parameters<typeof main.chatController.selectState>[0]) => {
      const didSucceed = await main.chatController.selectState(state)
      if (didSucceed) {
        main.closeOverlay()
      }
    },
    orderCase: main.chatController.orderCase,
    orderCaseId: main.selectedCase?.orderCaseId ?? -1,
    sendError: main.chatController.sendError,
    sendMessage: () => {
      void main.chatController.sendMessage()
    },
    setDraft: main.chatController.setDraft,
    stateError: main.chatController.stateError,
  }), [main])
}
