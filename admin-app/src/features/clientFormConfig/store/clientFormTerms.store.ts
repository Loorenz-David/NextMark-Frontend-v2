import type { EntityTable } from '@shared-store'
import { createEntityStore, selectAll, selectByClientId } from '@shared-store'

import type { ClientFormTermsVersion, ClientFormTermsVersionMap } from '../types/clientFormTerms'

/** Keyed by the stringified server id — terms rows have no `client_id` column. */
export const useClientFormTermsStore = createEntityStore<ClientFormTermsVersion>()

export const selectAllClientFormTermsVersions = (state: EntityTable<ClientFormTermsVersion>) =>
  selectAll<ClientFormTermsVersion>()(state)

export const selectClientFormTermsVersionByClientId =
  (clientId: string | null | undefined) => (state: EntityTable<ClientFormTermsVersion>) =>
    selectByClientId<ClientFormTermsVersion>(clientId)(state)

export const selectActiveClientFormTermsVersion = (
  state: EntityTable<ClientFormTermsVersion>,
): ClientFormTermsVersion | null => {
  for (const clientId of state.allIds) {
    const version = state.byClientId[clientId]
    if (version?.is_active) {
      return version
    }
  }
  return null
}

/** History is append-only and ordered by the server, so a load always replaces it wholesale. */
export const replaceClientFormTermsVersions = (table: ClientFormTermsVersionMap) => {
  const state = useClientFormTermsStore.getState()
  state.clear()
  state.insertMany(table)
}
