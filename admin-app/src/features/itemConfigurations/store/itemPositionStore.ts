import type { EntityTable } from "@shared-store"
import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

import type { ItemPosition } from '../types/itemPosition'

export const useItemPositionStore = createEntityStore<ItemPosition>()

export const selectAllItemPositions = (state: EntityTable<ItemPosition>) =>
  selectAll<ItemPosition>()(state)

export const selectItemPositionByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<ItemPosition>) =>
    selectByClientId<ItemPosition>(clientId)(state)

export const selectItemPositionByServerId = (id: number | null | undefined) =>
  (state: EntityTable<ItemPosition>) =>
    selectByServerId<ItemPosition>(id)(state)

export const insertItemPositions = (table: { byClientId: Record<string, ItemPosition>; allIds: string[] }) =>
  useItemPositionStore.getState().insertMany(table)

export const upsertItemPosition = (item: ItemPosition) => {
  const state = useItemPositionStore.getState()
  if (state.byClientId[item.client_id]) {
    state.update(item.client_id, (existing) => ({ ...existing, ...item }))
    return
  }
  state.insert(item)
}

export const removeItemPosition = (clientId: string) =>
  useItemPositionStore.getState().remove(clientId)
