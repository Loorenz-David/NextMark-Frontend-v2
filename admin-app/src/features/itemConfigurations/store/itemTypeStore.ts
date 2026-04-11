import type { EntityTable } from "@shared-store"
import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

import type { ItemType } from '../types/itemType'

export const useItemTypeStore = createEntityStore<ItemType>()

export const selectAllItemTypes = (state: EntityTable<ItemType>) =>
  selectAll<ItemType>()(state)

export const selectItemTypeByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<ItemType>) =>
    selectByClientId<ItemType>(clientId)(state)

export const selectItemTypeByServerId = (id: number | null | undefined) =>
  (state: EntityTable<ItemType>) =>
    selectByServerId<ItemType>(id)(state)

export const insertItemTypes = (table: { byClientId: Record<string, ItemType>; allIds: string[] }) =>
  useItemTypeStore.getState().insertMany(table)

export const upsertItemType = (item: ItemType) => {
  const state = useItemTypeStore.getState()
  if (state.byClientId[item.client_id]) {
    state.update(item.client_id, (existing) => ({ ...existing, ...item }))
    return
  }
  state.insert(item)
}

export const removeItemType = (clientId: string) =>
  useItemTypeStore.getState().remove(clientId)
