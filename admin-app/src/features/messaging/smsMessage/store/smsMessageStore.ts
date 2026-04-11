import type { EntityTable } from "@shared-store"
import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

import type { SmsMessageTemplate } from '../types/smsMessage'

export const useSmsMessageStore = createEntityStore<SmsMessageTemplate>()

export const selectAllSmsMessages = (state: EntityTable<SmsMessageTemplate>) =>
  selectAll<SmsMessageTemplate>()(state)

export const selectSmsMessageByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<SmsMessageTemplate>) =>
    selectByClientId<SmsMessageTemplate>(clientId)(state)

export const selectSmsMessageByServerId = (id: number | null | undefined) =>
  (state: EntityTable<SmsMessageTemplate>) =>
    selectByServerId<SmsMessageTemplate>(id)(state)

export const insertSmsMessage = (message: SmsMessageTemplate) =>
  useSmsMessageStore.getState().insert(message)

export const insertSmsMessages = (table: { byClientId: Record<string, SmsMessageTemplate>; allIds: string[] }) =>
  useSmsMessageStore.getState().insertMany(table)

export const upsertSmsMessage = (message: SmsMessageTemplate) => {
  const state = useSmsMessageStore.getState()
  if (state.byClientId[message.client_id]) {
    state.update(message.client_id, (existing) => ({ ...existing, ...message }))
    return
  }
  state.insert(message)
}

export const upsertSmsMessages = (table: { byClientId: Record<string, SmsMessageTemplate>; allIds: string[] }) => {
  table.allIds.forEach((clientId) => {
    const message = table.byClientId[clientId]
    if (message) {
      upsertSmsMessage(message)
    }
  })
}

export const updateSmsMessage = (clientId: string, updater: (message: SmsMessageTemplate) => SmsMessageTemplate) =>
  useSmsMessageStore.getState().update(clientId, updater)

export const removeSmsMessage = (clientId: string) =>
  useSmsMessageStore.getState().remove(clientId)

export const clearSmsMessages = () =>
  useSmsMessageStore.getState().clear()
