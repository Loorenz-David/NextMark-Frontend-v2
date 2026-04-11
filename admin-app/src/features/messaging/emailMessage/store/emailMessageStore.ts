import type { EntityTable } from "@shared-store"
import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

import type { EmailMessageTemplate } from '../types/emailMessage'

export const useEmailMessageStore = createEntityStore<EmailMessageTemplate>()

export const selectAllEmailMessages = (state: EntityTable<EmailMessageTemplate>) =>
  selectAll<EmailMessageTemplate>()(state)

export const selectEmailMessageByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<EmailMessageTemplate>) =>
    selectByClientId<EmailMessageTemplate>(clientId)(state)

export const selectEmailMessageByServerId = (id: number | null | undefined) =>
  (state: EntityTable<EmailMessageTemplate>) =>
    selectByServerId<EmailMessageTemplate>(id)(state)

export const insertEmailMessage = (message: EmailMessageTemplate) =>
  useEmailMessageStore.getState().insert(message)

export const insertEmailMessages = (table: { byClientId: Record<string, EmailMessageTemplate>; allIds: string[] }) =>
  useEmailMessageStore.getState().insertMany(table)

export const upsertEmailMessage = (message: EmailMessageTemplate) => {
  const state = useEmailMessageStore.getState()
  if (state.byClientId[message.client_id]) {
    state.update(message.client_id, (existing) => ({ ...existing, ...message }))
    return
  }
  state.insert(message)
}

export const upsertEmailMessages = (table: { byClientId: Record<string, EmailMessageTemplate>; allIds: string[] }) => {
  table.allIds.forEach((clientId) => {
    const message = table.byClientId[clientId]
    if (message) {
      upsertEmailMessage(message)
    }
  })
}

export const updateEmailMessage = (clientId: string, updater: (message: EmailMessageTemplate) => EmailMessageTemplate) =>
  useEmailMessageStore.getState().update(clientId, updater)

export const removeEmailMessage = (clientId: string) =>
  useEmailMessageStore.getState().remove(clientId)

export const clearEmailMessages = () =>
  useEmailMessageStore.getState().clear()
