import type { EntityTable } from "@shared-store"
import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

import type { ItemProperty } from '../types/itemProperty'

export const useItemPropertyStore = createEntityStore<ItemProperty>()

export const selectAllItemProperties = (state: EntityTable<ItemProperty>) =>
  selectAll<ItemProperty>()(state)

export const selectItemPropertyByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<ItemProperty>) =>
    selectByClientId<ItemProperty>(clientId)(state)

export const selectItemPropertyByServerId = (id: number | null | undefined) =>
  (state: EntityTable<ItemProperty>) =>
    selectByServerId<ItemProperty>(id)(state)

export const insertItemProperties = (table: { byClientId: Record<string, ItemProperty>; allIds: string[] }) =>
  useItemPropertyStore.getState().insertMany(table)

export const upsertItemProperty = (item: ItemProperty) => {
  const state = useItemPropertyStore.getState()
  if (state.byClientId[item.client_id]) {
    state.update(item.client_id, (existing) => ({ ...existing, ...item }))
    return
  }
  state.insert(item)
}

export const removeItemProperty = (clientId: string) =>
  useItemPropertyStore.getState().remove(clientId)
