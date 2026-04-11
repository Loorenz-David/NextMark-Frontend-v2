import type { CaseChat, CaseChatMap } from '../domain'
import { useCaseChatsStore } from './caseChats.store'

export const setCaseChats = (table: CaseChatMap) => useCaseChatsStore.getState().insertMany(table)

export const upsertCaseChat = (chat: CaseChat) => {
  const state = useCaseChatsStore.getState()

  if (state.byClientId[chat.client_id]) {
    state.update(chat.client_id, (existing) => ({ ...existing, ...chat }))
    return
  }

  state.insert(chat)
}

export const upsertCaseChats = (table: CaseChatMap) => {
  table.allIds.forEach((clientId) => {
    const chat = table.byClientId[clientId]
    if (!chat) {
      return
    }

    upsertCaseChat(chat)
  })
}

export const clearCaseChats = () => useCaseChatsStore.getState().clear()

export const patchCaseChatByClientId = (clientId: string, partial: Partial<CaseChat>) =>
  useCaseChatsStore.getState().patch(clientId, partial)

export const removeCaseChatByClientId = (clientId: string) => useCaseChatsStore.getState().remove(clientId)
