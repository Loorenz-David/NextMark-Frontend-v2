import type { EntityTable } from '@shared-store'
import { createEntityStore, selectAll, selectByClientId, selectByServerId } from '@shared-store'

import type { ClientFormMedia, ClientFormMediaMap } from '../types/clientFormMedia'

export const useClientFormMediaStore = createEntityStore<ClientFormMedia>()

export const selectAllClientFormMedia = (state: EntityTable<ClientFormMedia>) =>
  selectAll<ClientFormMedia>()(state)

export const selectClientFormMediaByClientId =
  (clientId: string | null | undefined) => (state: EntityTable<ClientFormMedia>) =>
    selectByClientId<ClientFormMedia>(clientId)(state)

export const selectClientFormMediaByServerId =
  (id: number | null | undefined) => (state: EntityTable<ClientFormMedia>) =>
    selectByServerId<ClientFormMedia>(id)(state)

export const insertClientFormMedia = (table: ClientFormMediaMap) =>
  useClientFormMediaStore.getState().insertMany(table)

export const upsertClientFormMediaItem = (media: ClientFormMedia) => {
  const state = useClientFormMediaStore.getState()
  if (state.byClientId[media.client_id]) {
    state.update(media.client_id, (existing) => ({ ...existing, ...media }))
    return
  }
  state.insert(media)
}

export const removeClientFormMediaItem = (clientId: string) =>
  useClientFormMediaStore.getState().remove(clientId)

export const replaceClientFormMedia = (table: ClientFormMediaMap) => {
  const state = useClientFormMediaStore.getState()
  state.clear()
  state.insertMany(table)
}

export const readClientFormMedia = () => {
  const state = useClientFormMediaStore.getState()
  return state.allIds.map((clientId) => state.byClientId[clientId])
}
