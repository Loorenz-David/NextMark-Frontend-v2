import { create } from 'zustand'
import type { OrderSelectAllSnapshot } from '../types/orderBatchSelection'

type ResolvedSelectionState = {
  count: number
  signature: string | null
  isLoading: boolean
}

type OrderSelectionState = {
  isSelectionMode: boolean

  // Compatibility fields used by existing map selection summary hooks.
  selectedClientIds: string[]
  selectedServerIds: number[]

  manualSelectedClientIds: string[]
  manualSelectedServerIds: number[]
  selectAllSnapshots: OrderSelectAllSnapshot[]
  excludedServerIds: number[]
  loadedSelectionIds: number[]
  resolvedSelection: ResolvedSelectionState

  enableSelectionMode: () => void
  disableSelectionMode: () => void
  setSelectedOrders: (selection: { clientIds: string[]; serverIds: number[] }) => void
  toggleManualOrder: (selection: { clientId: string; serverId?: number | null }) => void
  addSelectAllSnapshot: (
    snapshot: OrderSelectAllSnapshot,
    loadedServerIds?: number[],
  ) => void
  removeSelectAllSnapshot: (snapshotKey: string) => void
  setLoadedSelectionIds: (serverIds: number[]) => void
  toggleExcludedServerId: (serverId: number) => void
  setResolvedSelection: (next: Partial<ResolvedSelectionState>) => void
  clearResolvedSelection: () => void
  clearSelection: () => void
}

const INITIAL_RESOLVED_SELECTION: ResolvedSelectionState = {
  count: 0,
  signature: null,
  isLoading: false,
}

const dedupePositiveIds = (ids: Array<number | null | undefined>) =>
  Array.from(
    new Set(
      ids.filter((id): id is number => Number.isFinite(id) && (id ?? 0) > 0),
    ),
  )

const mergeIds = (base: number[], incoming: number[]) =>
  Array.from(new Set([...base, ...incoming]))

const areSameNumberArray = (left: number[], right: number[]) => (
  left.length === right.length
  && left.every((value, index) => value === right[index])
)

const isSameResolvedSelection = (
  left: ResolvedSelectionState,
  right: ResolvedSelectionState,
) => (
  left.count === right.count
  && left.signature === right.signature
  && left.isLoading === right.isLoading
)

export const useOrderSelectionStore = create<OrderSelectionState>((set) => ({
  isSelectionMode: false,
  selectedClientIds: [],
  selectedServerIds: [],
  manualSelectedClientIds: [],
  manualSelectedServerIds: [],
  selectAllSnapshots: [],
  excludedServerIds: [],
  loadedSelectionIds: [],
  resolvedSelection: INITIAL_RESOLVED_SELECTION,
  enableSelectionMode: () =>
    set((state) => {
      if (state.isSelectionMode) return state
      return { ...state, isSelectionMode: true }
    }),
  disableSelectionMode: () =>
    set((state) => {
      if (
        !state.isSelectionMode
        && state.selectedClientIds.length === 0
        && state.selectedServerIds.length === 0
        && state.manualSelectedClientIds.length === 0
        && state.manualSelectedServerIds.length === 0
        && state.selectAllSnapshots.length === 0
        && state.excludedServerIds.length === 0
        && state.loadedSelectionIds.length === 0
      ) {
        return state
      }
      return {
        ...state,
        isSelectionMode: false,
        selectedClientIds: [],
        selectedServerIds: [],
        manualSelectedClientIds: [],
        manualSelectedServerIds: [],
        selectAllSnapshots: [],
        excludedServerIds: [],
        loadedSelectionIds: [],
        resolvedSelection: INITIAL_RESOLVED_SELECTION,
      }
    }),
  setSelectedOrders: ({ clientIds, serverIds }) =>
    set((state) => {
      const dedupedClientIds = Array.from(new Set(clientIds))
      const dedupedServerIds = dedupePositiveIds(serverIds)
      if (
        dedupedClientIds.length === state.manualSelectedClientIds.length &&
        dedupedServerIds.length === state.manualSelectedServerIds.length &&
        dedupedClientIds.every((id, index) => state.manualSelectedClientIds[index] === id) &&
        dedupedServerIds.every((id, index) => state.manualSelectedServerIds[index] === id)
      ) {
        return state
      }
      return {
        ...state,
        selectedClientIds: dedupedClientIds,
        selectedServerIds: dedupedServerIds,
        manualSelectedClientIds: dedupedClientIds,
        manualSelectedServerIds: dedupedServerIds,
        loadedSelectionIds: mergeIds(state.loadedSelectionIds, dedupedServerIds),
      }
    }),
  toggleManualOrder: ({ clientId, serverId }) =>
    set((state) => {
      if (!clientId) return state
      const hasClient = state.manualSelectedClientIds.includes(clientId)
      const normalizedServerId = Number.isFinite(serverId) && (serverId ?? 0) > 0 ? Number(serverId) : null

      if (hasClient) {
        return {
          ...state,
          selectedClientIds: state.selectedClientIds.filter((id) => id !== clientId),
          manualSelectedClientIds: state.manualSelectedClientIds.filter((id) => id !== clientId),
          selectedServerIds: normalizedServerId == null
            ? state.selectedServerIds
            : state.selectedServerIds.filter((id) => id !== normalizedServerId),
          manualSelectedServerIds: normalizedServerId == null
            ? state.manualSelectedServerIds
            : state.manualSelectedServerIds.filter((id) => id !== normalizedServerId),
          loadedSelectionIds: normalizedServerId == null
            ? state.loadedSelectionIds
            : state.loadedSelectionIds.filter((id) => id !== normalizedServerId),
        }
      }

      const nextSelectedClientIds = [...state.selectedClientIds, clientId]
      const nextManualClientIds = [...state.manualSelectedClientIds, clientId]
      const nextSelectedServerIds = normalizedServerId == null
        ? state.selectedServerIds
        : mergeIds(state.selectedServerIds, [normalizedServerId])
      const nextManualServerIds = normalizedServerId == null
        ? state.manualSelectedServerIds
        : mergeIds(state.manualSelectedServerIds, [normalizedServerId])
      const nextLoadedSelectionIds = normalizedServerId == null
        ? state.loadedSelectionIds
        : mergeIds(state.loadedSelectionIds, [normalizedServerId])

      return {
        ...state,
        selectedClientIds: nextSelectedClientIds,
        selectedServerIds: nextSelectedServerIds,
        manualSelectedClientIds: nextManualClientIds,
        manualSelectedServerIds: nextManualServerIds,
        loadedSelectionIds: nextLoadedSelectionIds,
        excludedServerIds: normalizedServerId == null
          ? state.excludedServerIds
          : state.excludedServerIds.filter((id) => id !== normalizedServerId),
      }
    }),
  addSelectAllSnapshot: (snapshot, loadedServerIds = []) =>
    set((state) => {
      const existingIndex = state.selectAllSnapshots.findIndex((item) => item.key === snapshot.key)
      const nextSnapshots = existingIndex >= 0
        ? state.selectAllSnapshots
        : [...state.selectAllSnapshots, snapshot]

      const dedupedLoadedIds = dedupePositiveIds(loadedServerIds)
      const filteredLoadedIds = dedupedLoadedIds.filter((id) => !state.excludedServerIds.includes(id))
      const nextLoadedSelectionIds = mergeIds(state.loadedSelectionIds, filteredLoadedIds)

      if (
        nextSnapshots === state.selectAllSnapshots
        && areSameNumberArray(nextLoadedSelectionIds, state.loadedSelectionIds)
      ) {
        return state
      }

      return {
        ...state,
        selectAllSnapshots: nextSnapshots,
        loadedSelectionIds: nextLoadedSelectionIds,
      }
    }),
  removeSelectAllSnapshot: (snapshotKey) =>
    set((state) => {
      const nextSnapshots = state.selectAllSnapshots.filter((snapshot) => snapshot.key !== snapshotKey)
      if (nextSnapshots.length === state.selectAllSnapshots.length) {
        return state
      }
      return {
        ...state,
        selectAllSnapshots: nextSnapshots,
      }
    }),
  setLoadedSelectionIds: (serverIds) =>
    set((state) => {
      const nextLoadedSelectionIds = dedupePositiveIds(serverIds)
      if (areSameNumberArray(nextLoadedSelectionIds, state.loadedSelectionIds)) {
        return state
      }
      return {
        ...state,
        loadedSelectionIds: nextLoadedSelectionIds,
      }
    }),
  toggleExcludedServerId: (serverId) =>
    set((state) => {
      if (!Number.isFinite(serverId) || serverId <= 0) return state
      const isExcluded = state.excludedServerIds.includes(serverId)
      if (isExcluded) {
        return {
          ...state,
          excludedServerIds: state.excludedServerIds.filter((id) => id !== serverId),
        }
      }

      return {
        ...state,
        excludedServerIds: [...state.excludedServerIds, serverId],
        selectedServerIds: state.selectedServerIds.filter((id) => id !== serverId),
        manualSelectedServerIds: state.manualSelectedServerIds.filter((id) => id !== serverId),
        loadedSelectionIds: state.loadedSelectionIds.filter((id) => id !== serverId),
      }
    }),
  setResolvedSelection: (next) =>
    set((state) => {
      const merged = {
        ...state.resolvedSelection,
        ...next,
      }
      if (isSameResolvedSelection(state.resolvedSelection, merged)) {
        return state
      }
      return {
        ...state,
        resolvedSelection: merged,
      }
    }),
  clearResolvedSelection: () =>
    set((state) => {
      if (isSameResolvedSelection(state.resolvedSelection, INITIAL_RESOLVED_SELECTION)) {
        return state
      }
      return {
        ...state,
        resolvedSelection: INITIAL_RESOLVED_SELECTION,
      }
    }),
  clearSelection: () =>
    set((state) => {
      if (
        state.selectedClientIds.length === 0
        && state.selectedServerIds.length === 0
        && state.manualSelectedClientIds.length === 0
        && state.manualSelectedServerIds.length === 0
        && state.selectAllSnapshots.length === 0
        && state.excludedServerIds.length === 0
        && state.loadedSelectionIds.length === 0
      ) {
        return state
      }
      return {
        ...state,
        selectedClientIds: [],
        selectedServerIds: [],
        manualSelectedClientIds: [],
        manualSelectedServerIds: [],
        selectAllSnapshots: [],
        excludedServerIds: [],
        loadedSelectionIds: [],
        resolvedSelection: INITIAL_RESOLVED_SELECTION,
      }
    }),
}))
