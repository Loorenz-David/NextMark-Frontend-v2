import type { EntityTable } from './StoreFactory'

export const selectAll = <T extends { client_id: string }>() =>
  (state: EntityTable<T>): T[] =>
    state.allIds.map((id) => state.byClientId[id])

export const selectByClientId = <T extends { client_id: string }>(client_id: string | null | undefined) =>
  (state: EntityTable<T>): T | null => {
    if (client_id == null) return null
    return state.byClientId[client_id] ?? null
  }

export const selectByServerId = <T extends { id?: number, client_id: string }>(id: number | null | undefined) =>
  (state: EntityTable<T>): T | null => {
    if (id == null) return null

    const client_id = state.idIndex[id]
    if (!client_id) return null

    return state.byClientId[client_id]
  }

export const selectVisible = <T extends { client_id: string }>() =>
  (state: EntityTable<T>): T[] => {
    if (state.visibleIds == null) return state.allIds.map((id) => state.byClientId[id])
    return state.visibleIds.map((id) => state.byClientId[id]).filter(Boolean) as T[]
  }
