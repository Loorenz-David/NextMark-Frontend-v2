import { useShallow } from 'zustand/react/shallow'

import { useEmailMessageStore, selectAllEmailMessages, selectEmailMessageByClientId, selectEmailMessageByServerId } from '../store/emailMessageStore'

export const useEmailMessages = () => useEmailMessageStore(useShallow(selectAllEmailMessages))

export const useEmailMessageByClientId = (clientId: string | null | undefined) =>
  useEmailMessageStore(useShallow(selectEmailMessageByClientId(clientId)))

export const useEmailMessageByServerId = (id: number | null | undefined) =>
  useEmailMessageStore(useShallow(selectEmailMessageByServerId(id)))
