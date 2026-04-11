import { useCallback } from "react"
import type { CaseChat, OrderCaseState } from "../types"
import { apiClient, ApiError } from "@/lib/api/ApiClient"
import { useCreateCaseChat, useMarkOrderCaseChatsRead, useUpdateOrderCaseState } from "../api/orderCase.api"
import { useMessageHandler } from "@shared-message-handler"
import { useOrderCaseFlow } from "../flows/orderCase.flow"
import { appendChatToCase, selectOrderCaseById, updateCaseState, updateUnseenCount, useOrderCaseStore } from "../store/orderCaseStore"
import { buildClientId } from "@/lib/utils/clientId"
import { useCaseDetailsValidation } from "../domain/details.validation"


export const useDetailsControllers = ()=>{
    const updateOrderCaseStateApi = useUpdateOrderCaseState()
    const createCaseChatApi = useCreateCaseChat()
    const markOrderCaseChatsReadApi = useMarkOrderCaseChatsRead()
    const validation = useCaseDetailsValidation()
    const { loadCaseDetails } = useOrderCaseFlow()
    const { showMessage } = useMessageHandler()

    const updateState = useCallback(
        async (orderCaseId: number, nextState: OrderCaseState) => {
          const current = selectOrderCaseById(orderCaseId)(useOrderCaseStore.getState())
          
          if (!current  ) return false
    
          const isAllowed = validation.validateStateTransition(current.state, nextState)
          if (!isAllowed) {
            showMessage({ status: 400, message: 'Invalid state transition.' })
            return false
          }
    
          const previousState = current.state
          updateCaseState(orderCaseId, nextState)
    
          try {
            await updateOrderCaseStateApi(orderCaseId, { state: nextState })
            return true
          } catch (error) {
            updateCaseState(orderCaseId, previousState)
            const message = error instanceof ApiError ? error.message : 'Unable to update case state.'
            const status = error instanceof ApiError ? error.status : 500
            showMessage({ status, message })
            return false
          }
        },
        [showMessage, updateOrderCaseStateApi, validation],
    )

    const sendChat = useCallback(
          async (orderCaseId: number, message: string) => {
            const payload = { order_case_id: orderCaseId, message }
            const isValid = validation.validateChatMessage(payload)
      
            if (!isValid) {
              showMessage({ status: 400, message: 'Message cannot be empty.' })
              return false
            }
      
            const optimisticChat = toOptimisticChat(orderCaseId, message.trim())
            appendChatToCase(orderCaseId, optimisticChat)
      
            try {
              await createCaseChatApi(payload)
              await loadCaseDetails(orderCaseId)
              return true
            } catch (error) {
              await loadCaseDetails(orderCaseId)
              const messageText = error instanceof ApiError ? error.message : 'Unable to send case chat.'
              const status = error instanceof ApiError ? error.status : 500
              showMessage({ status, message: messageText })
              return false
            }
          },
          [createCaseChatApi, loadCaseDetails, showMessage, validation],
    )

    const markCaseChatsAsRead = useCallback(
        async (orderCaseId: number) => {
          const current = selectOrderCaseById(orderCaseId)(useOrderCaseStore.getState())
          if (!current || current.unseen_chats <= 0) return true
    
          const previousUnseenCount = current.unseen_chats
          updateUnseenCount(orderCaseId, 0)
    
          try {
            await markOrderCaseChatsReadApi(orderCaseId)
            await loadCaseDetails(orderCaseId)
            return true
          } catch (error) {
            updateUnseenCount(orderCaseId, previousUnseenCount)
            const message = error instanceof ApiError ? error.message : 'Unable to sync chat read status.'
            const status = error instanceof ApiError ? error.status : 500
            showMessage({ status, message })
            return false
          }
        },
        [loadCaseDetails, markOrderCaseChatsReadApi, showMessage],
    )



    return {
        updateState,
        sendChat,
        markCaseChatsAsRead,
        loadCaseDetails,
    }
}


const toOptimisticChat = (orderCaseId: number, message: string): CaseChat => ({
  id: -Math.floor(Date.now() / 1000),
  client_id: buildClientId('case-chat-temp'),
  message,
  creation_date: new Date().toISOString(),
  user_id: (() => {
    const userId = apiClient.getSessionUserId()
    return typeof userId === 'number' ? userId : null
  })(),
  user_name: (() => {
    const user = apiClient.getSessionUser()
    if (typeof user?.username === 'string' && user.username.trim()) {
      return user.username.trim()
    }
    if (typeof user?.email === 'string' && user.email.trim()) {
      return user.email.trim()
    }
    return null
  })(),
  order_case_id: orderCaseId,
})
