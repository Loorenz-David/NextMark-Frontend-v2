import { create } from 'zustand'

export type EntityTable<T extends { client_id: string, id?: number | null }> = {
  byClientId: Record<string, T>
  idIndex: Record<number, string>
  allIds: string[]
  visibleIds: string[] | null
  insert: (item: T) => void
  insertMany: (table: { byClientId: Record<string, T>; allIds: string[] }) => void
  update: (client_id: string, updater: (item: T) => T) => void
  patch: (client_id: string, partial: Partial<T>) => void
  updateMany: (client_ids: string[], updater: (items: T[]) => T[]) => void
  patchMany: (client_ids: string[], partial: Partial<T>) => void
  remove: (client_id: string) => void
  clear: () => void
  setVisibleIds: (ids: string[] | null) => void
}

export const createEntityStore = <T extends { client_id: string, id?: number | null }>() =>
  create<EntityTable<T>>((set) => ({
    byClientId: {},
    idIndex: {},
    allIds: [],
    visibleIds: null,

    insert: (item) =>
      set((state) => {
        if (state.byClientId[item.client_id]) return state

        const nextIdIndex = { ...state.idIndex }
        if (item.id !== null && item.id !== undefined) {
          nextIdIndex[item.id] = item.client_id
        }

        return {
          byClientId: { ...state.byClientId, [item.client_id]: item },
          allIds: [...state.allIds, item.client_id],
          idIndex: nextIdIndex,
        }
      }),

    insertMany: (table) =>
      set((state) => {
        const mergedByClientId = { ...state.byClientId, ...table.byClientId }
        const currentIds = new Set(state.allIds)
        const incomingIds = table.allIds.filter((client_id) => !currentIds.has(client_id))
        const mergedAllIds = [...state.allIds, ...incomingIds]
        const mergedIdIndex: Record<number, string> = {}

        for (const client_id of mergedAllIds) {
          const item = mergedByClientId[client_id]
          if (item?.id !== null && item?.id !== undefined) {
            mergedIdIndex[item.id] = item.client_id
          }
        }

        return { byClientId: mergedByClientId, idIndex: mergedIdIndex, allIds: mergedAllIds }
      }),

    update: (client_id, updater) =>
      set((state) => {
        const existing = state.byClientId[client_id]
        if (!existing) {
          return state
        }

        const updated = updater(existing)
        const nextIdIndex = { ...state.idIndex }

        if (updated.id !== null && updated.id !== undefined) {
          nextIdIndex[updated.id] = updated.client_id
        }

        return {
          byClientId: {
            ...state.byClientId,
            [client_id]: updated,
          },
          idIndex: nextIdIndex,
        }
      }),

    updateMany: (client_ids, updater) =>
      set((state) => {
        const existingList = client_ids
          .map((client_id) => state.byClientId[client_id])
          .filter((item): item is T => item !== undefined)
        const updatedList = updater(existingList)
        const nextIdIndex = { ...state.idIndex }

        const mappedUpdatedIdIndex = updatedList.reduce<Record<number, string>>((acc, item) => {
          if (item.id !== null && item.id !== undefined) {
            acc[item.id] = item.client_id
          }
          return acc
        }, {})

        const mappedUpdatedList = updatedList.reduce<Record<string, T>>((acc, item) => {
          acc[item.client_id] = item
          return acc
        }, {})

        return {
          byClientId: {
            ...state.byClientId,
            ...mappedUpdatedList,
          },
          idIndex: { ...nextIdIndex, ...mappedUpdatedIdIndex },
        }
      }),

    patchMany: (client_ids, partial) =>
      set((state) => {
        const nextByClientId = { ...state.byClientId }
        const nextIdIndex = { ...state.idIndex }

        for (const client_id of client_ids) {
          const existing = state.byClientId[client_id]
          if (!existing) continue

          const updated = { ...existing, ...partial }
          nextByClientId[client_id] = updated

          if (updated.id !== null && updated.id !== undefined) {
            nextIdIndex[updated.id] = updated.client_id
          }
        }

        return {
          byClientId: nextByClientId,
          idIndex: nextIdIndex,
        }
      }),

    patch: (client_id, partial) =>
      set((state) => {
        const existing = state.byClientId[client_id]
        if (!existing) return state

        const updated = { ...existing, ...partial }
        const nextIdIndex = { ...state.idIndex }

        if (updated.id !== null && updated.id !== undefined) {
          nextIdIndex[updated.id] = updated.client_id
        }

        return {
          byClientId: {
            ...state.byClientId,
            [client_id]: updated,
          },
          idIndex: nextIdIndex,
        }
      }),

    remove: (client_id) =>
      set((state) => {
        const existing = state.byClientId[client_id]
        if (!existing) {
          return state
        }

        const { [client_id]: _removed, ...rest } = state.byClientId
        const nextIdIndex = { ...state.idIndex }
        if (existing.id !== null && existing.id !== undefined) {
          delete nextIdIndex[existing.id]
        }

        return {
          byClientId: rest,
          allIds: state.allIds.filter((value) => value !== client_id),
          idIndex: nextIdIndex,
        }
      }),

    setVisibleIds: (ids) =>
      set(() => ({ visibleIds: ids })),

    clear: () =>
      set(() => ({
        byClientId: {},
        allIds: [],
        idIndex: {},
      })),
  }))
