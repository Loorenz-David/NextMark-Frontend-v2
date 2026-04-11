import { useShallow } from 'zustand/react/shallow'

import { useSmsMessageStore, selectAllSmsMessages, selectSmsMessageByClientId, selectSmsMessageByServerId } from '../store/smsMessageStore'

export const useSmsMessages = () => useSmsMessageStore(useShallow(selectAllSmsMessages))

export const useSmsMessageByClientId = (clientId: string | null | undefined) =>
  useSmsMessageStore(useShallow(selectSmsMessageByClientId(clientId)))

export const useSmsMessageByServerId = (id: number | null | undefined) =>
  useSmsMessageStore(useShallow(selectSmsMessageByServerId(id)))
