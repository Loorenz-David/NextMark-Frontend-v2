import { create } from 'zustand'

type RouteGroupSelectionState = {
  isSelectionMode: boolean
  selectedClientIds: string[]
  selectedServerIds: number[]
  enableSelectionMode: () => void
  disableSelectionMode: () => void
  setSelectedOrders: (selection: { clientIds: string[]; serverIds: number[] }) => void
  clearSelection: () => void
}

export const useRouteGroupSelectionStore = create<RouteGroupSelectionState>((set) => ({
  isSelectionMode: false,
  selectedClientIds: [],
  selectedServerIds: [],
  enableSelectionMode: () =>
    set((state) => {
      if (state.isSelectionMode) return state
      return { ...state, isSelectionMode: true }
    }),
  disableSelectionMode: () =>
    set((state) => {
      if (!state.isSelectionMode && state.selectedClientIds.length === 0 && state.selectedServerIds.length === 0) {
        return state
      }
      return { ...state, isSelectionMode: false, selectedClientIds: [], selectedServerIds: [] }
    }),
  setSelectedOrders: ({ clientIds, serverIds }) =>
    set((state) => {
      const dedupedClientIds = Array.from(new Set(clientIds))
      const dedupedServerIds = Array.from(new Set(serverIds)).filter((id) => Number.isFinite(id))

      if (
        dedupedClientIds.length === state.selectedClientIds.length &&
        dedupedServerIds.length === state.selectedServerIds.length &&
        dedupedClientIds.every((id, index) => state.selectedClientIds[index] === id) &&
        dedupedServerIds.every((id, index) => state.selectedServerIds[index] === id)
      ) {
        return state
      }

      return {
        ...state,
        selectedClientIds: dedupedClientIds,
        selectedServerIds: dedupedServerIds,
      }
    }),
  clearSelection: () =>
    set((state) => {
      if (state.selectedClientIds.length === 0 && state.selectedServerIds.length === 0) return state
      return { ...state, selectedClientIds: [], selectedServerIds: [] }
    }),
}))

