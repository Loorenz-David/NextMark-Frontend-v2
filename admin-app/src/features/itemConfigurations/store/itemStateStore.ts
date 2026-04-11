import type { EntityTable } from "@shared-store"
import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

import type { ItemState } from '../types/itemState'

export const useItemStateStore = createEntityStore<ItemState>()

export const selectAllItemStates = (state: EntityTable<ItemState>) =>
  selectAll<ItemState>()(state)

export const selectItemStateByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<ItemState>) =>
    selectByClientId<ItemState>(clientId)(state)

export const selectItemStateByServerId = (id: number | null | undefined) =>
  (state: EntityTable<ItemState>) =>
    selectByServerId<ItemState>(id)(state)

export const insertItemStates = (table: { byClientId: Record<string, ItemState>; allIds: string[] }) =>
  useItemStateStore.getState().insertMany(table)

export const upsertItemState = (item: ItemState) => {
  const state = useItemStateStore.getState()
  if (state.byClientId[item.client_id]) {
    state.update(item.client_id, (existing) => ({ ...existing, ...item }))
    return
  }
  state.insert(item)
}

export const removeItemState = (clientId: string) =>
  useItemStateStore.getState().remove(clientId)
