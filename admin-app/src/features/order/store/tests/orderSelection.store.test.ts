import type { Order } from '../../types/order'

import { buildBatchSelectionPayload, buildSelectedOrdersSummary } from '../orderSelectionHooks.store'
import { useOrderSelectionStore } from '../orderSelection.store'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runOrderSelectionStoreTests = () => {
  useOrderSelectionStore.setState({
    isSelectionMode: false,
    selectedClientIds: [],
    selectedServerIds: [],
    manualSelectedClientIds: [],
    manualSelectedServerIds: [],
    selectAllSnapshots: [],
    excludedServerIds: [],
    loadedSelectionIds: [],
    resolvedSelection: { count: 0, signature: null, isLoading: false },
    enableSelectionMode: useOrderSelectionStore.getState().enableSelectionMode,
    disableSelectionMode: useOrderSelectionStore.getState().disableSelectionMode,
    setSelectedOrders: useOrderSelectionStore.getState().setSelectedOrders,
    toggleManualOrder: useOrderSelectionStore.getState().toggleManualOrder,
    addSelectAllSnapshot: useOrderSelectionStore.getState().addSelectAllSnapshot,
    removeSelectAllSnapshot: useOrderSelectionStore.getState().removeSelectAllSnapshot,
    setLoadedSelectionIds: useOrderSelectionStore.getState().setLoadedSelectionIds,
    toggleExcludedServerId: useOrderSelectionStore.getState().toggleExcludedServerId,
    setResolvedSelection: useOrderSelectionStore.getState().setResolvedSelection,
    clearResolvedSelection: useOrderSelectionStore.getState().clearResolvedSelection,
    clearSelection: useOrderSelectionStore.getState().clearSelection,
  })

  const actions = useOrderSelectionStore.getState()

  actions.enableSelectionMode()
  assert(useOrderSelectionStore.getState().isSelectionMode, 'enableSelectionMode should set mode true')

  actions.setSelectedOrders({ clientIds: ['a', 'b', 'a'], serverIds: [1, 2, 1] })
  assert(
    useOrderSelectionStore.getState().selectedClientIds.length === 2,
    'setSelectedOrders should deduplicate client ids',
  )
  assert(
    useOrderSelectionStore.getState().selectedServerIds.length === 2,
    'setSelectedOrders should deduplicate server ids',
  )

  actions.clearSelection()
  assert(useOrderSelectionStore.getState().selectedClientIds.length === 0, 'clearSelection should empty client ids')
  assert(useOrderSelectionStore.getState().selectedServerIds.length === 0, 'clearSelection should empty server ids')

  actions.setSelectedOrders({ clientIds: ['x'], serverIds: [10] })
  actions.disableSelectionMode()
  assert(!useOrderSelectionStore.getState().isSelectionMode, 'disableSelectionMode should set mode false')
  assert(
    useOrderSelectionStore.getState().selectedClientIds.length === 0,
    'disableSelectionMode should clear selected client ids',
  )
  assert(
    useOrderSelectionStore.getState().selectedServerIds.length === 0,
    'disableSelectionMode should clear selected server ids',
  )

  const byClientId: Record<string, Order> = {
    a: { client_id: 'a', total_weight: 4, total_items: 2, total_volume: 8 },
    b: { client_id: 'b', total_weight: null, total_items: undefined, total_volume: null },
  }

  const summary = buildSelectedOrdersSummary(['a', 'b', 'missing'], byClientId)
  assert(summary.count === 2, 'summary should count only existing selected orders')
  assert(summary.totalWeight === 4, 'summary totalWeight should fallback null/undefined to zero')
  assert(summary.totalItems === 2, 'summary totalItems should fallback null/undefined to zero')
  assert(summary.totalVolume === 8, 'summary totalVolume should fallback null/undefined to zero')

  actions.addSelectAllSnapshot(
    {
      key: 'snapshot-a',
      query: { q: 'a' },
      estimatedCount: 20,
    },
    [1, 2, 3],
  )
  actions.toggleExcludedServerId(2)
  const selectionPayload = buildBatchSelectionPayload(useOrderSelectionStore.getState())
  assert(selectionPayload.select_all_snapshots.length === 1, 'selection payload should include snapshots')
  assert(selectionPayload.excluded_order_ids.length === 1, 'selection payload should include exclusions')
}
