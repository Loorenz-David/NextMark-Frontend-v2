import type { EntityTable } from '@shared-store'
import { createEntityStore, selectAll, selectByClientId, selectByServerId } from '@shared-store'

import type { Facility, FacilityMap } from '../types/facility'

export const useFacilityStore = createEntityStore<Facility>()

export const selectAllFacilities = (state: EntityTable<Facility>) => selectAll<Facility>()(state)

export const selectFacilityByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<Facility>) =>
    selectByClientId<Facility>(clientId)(state)

export const selectFacilityByServerId = (id: number | null | undefined) =>
  (state: EntityTable<Facility>) =>
    selectByServerId<Facility>(id)(state)

export const insertFacilities = (table: FacilityMap) =>
  useFacilityStore.getState().insertMany(table)

export const upsertFacility = (item: Facility) => {
  const state = useFacilityStore.getState()
  if (state.byClientId[item.client_id]) {
    state.update(item.client_id, (existing) => ({ ...existing, ...item }))
    return
  }
  state.insert(item)
}

export const removeFacility = (clientId: string) =>
  useFacilityStore.getState().remove(clientId)
