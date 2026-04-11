import { optimisticTransaction } from '@shared-optimistic'
import { sendCaseChatAction } from '../actions'
import { buildCaseChatClientId, buildOptimisticCaseChat } from '../domain'
import {
  patchCaseChatByClientId,
  removeCaseChatByClientId,
  selectCaseChatByClientId,
  upsertCaseChat,
  useCaseChatsStore,
} from '../stores'

function resolveCreatedChatId(payload: unknown): number | null {
  if (!payload || typeof payload !== 'object' || !('case_chat' in payload)) {
    return null
  }

  const caseChatPayload = (payload as { case_chat?: unknown }).case_chat
  if (!caseChatPayload || typeof caseChatPayload !== 'object') {
    return null
  }

  for (const [key, value] of Object.entries(caseChatPayload as Record<string, unknown>)) {
    if (key === 'ids_without_match') {
      continue
    }

    if (typeof value === 'number') {
      return value
    }

    if (value && typeof value === 'object' && typeof (value as { id?: unknown }).id === 'number') {
      return (value as { id: number }).id
    }
  }

  return null
}

type SendOrderCaseChatFlowOptions = {
  orderCaseId: number
  message: string
  currentUserId?: number | null
  currentUserName?: string | null
}

export async function sendOrderCaseChatFlow({
  orderCaseId,
  message,
  currentUserId,
  currentUserName,
}: SendOrderCaseChatFlowOptions) {
  const trimmedMessage = message.trim()
  if (!trimmedMessage) {
    return false
  }

  const clientId = buildCaseChatClientId()

  return optimisticTransaction({
    snapshot: () => selectCaseChatByClientId(clientId)(useCaseChatsStore.getState()),
    mutate: () => {
      upsertCaseChat({
        ...buildOptimisticCaseChat(orderCaseId, clientId, trimmedMessage, currentUserName),
        user_id: currentUserId ?? null,
        user_name: currentUserName ?? null,
      })
    },
    request: () =>
      sendCaseChatAction({
        client_id: clientId,
        order_case_id: orderCaseId,
        message: trimmedMessage,
      }),
    commit: (result) => {
      const serverId = resolveCreatedChatId(result)
      if (typeof serverId === 'number') {
        patchCaseChatByClientId(clientId, { id: serverId })
      }
    },
    rollback: () => {
      removeCaseChatByClientId(clientId)
    },
    onError: (error) => {
      console.error('Failed to send order case chat', error)
    },
  })
}
