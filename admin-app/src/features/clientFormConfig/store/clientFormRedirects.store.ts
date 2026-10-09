import type { EntityTable } from '@shared-store'
import { createEntityStore, selectAll, selectByClientId } from '@shared-store'

import type { ClientFormRedirect, ClientFormRedirectMap } from '../types/clientFormRedirect'

export const useClientFormRedirectStore = createEntityStore<ClientFormRedirect>()

export const selectAllClientFormRedirects = (state: EntityTable<ClientFormRedirect>) =>
  selectAll<ClientFormRedirect>()(state)

export const selectClientFormRedirectByClientId =
  (clientId: string | null | undefined) => (state: EntityTable<ClientFormRedirect>) =>
    selectByClientId<ClientFormRedirect>(clientId)(state)

export const upsertClientFormRedirect = (redirect: ClientFormRedirect) => {
  const state = useClientFormRedirectStore.getState()
  if (state.byClientId[redirect.client_id]) {
    state.update(redirect.client_id, (existing) => ({ ...existing, ...redirect }))
    return
  }
  state.insert(redirect)
}

export const removeClientFormRedirect = (clientId: string) =>
  useClientFormRedirectStore.getState().remove(clientId)

export const replaceClientFormRedirects = (table: ClientFormRedirectMap) => {
  const state = useClientFormRedirectStore.getState()
  state.clear()
  state.insertMany(table)
}

export const readClientFormRedirects = () => {
  const state = useClientFormRedirectStore.getState()
  return state.allIds.map((clientId) => state.byClientId[clientId])
}

/** Mirrors the backend rule: activating one row clears every other. */
export const setActiveClientFormRedirect = (clientId: string | null) => {
  const state = useClientFormRedirectStore.getState()
  state.allIds.forEach((id) => {
    const isActive = id === clientId
    if (state.byClientId[id]?.is_active !== isActive) {
      state.update(id, (existing) => ({ ...existing, is_active: isActive }))
    }
  })
}
