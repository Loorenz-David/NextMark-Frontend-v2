import { useCallback } from 'react'

import type { Order } from '../types/order'
import type { OrderStats, OrderQueryFilters } from '../types/orderMeta'
import { useOrderSelectionStore } from '../store/orderSelection.store'
import { useOrderSelectionActions } from '../store/orderSelectionHooks.store'
import {
  buildOrderSelectionSnapshotKey,
  buildOrderSelectionSnapshotQuery,
} from '../domain/orderSelectionSnapshot'

type UseOrderSelectionListActionsParams = {
  query: {
    q: string
    filters: OrderQueryFilters
  }
  orderStats?: OrderStats
  visibleOrders: Order[]
}

export const useOrderSelectionListActions = ({
  query,
  orderStats,
  visibleOrders,
}: UseOrderSelectionListActionsParams) => {
  const {
    enableSelectionMode,
    disableSelectionMode,
    toggleManualOrder,
    addSelectAllSnapshot,
    toggleExcludedServerId,
    clearSelection,
    setResolvedSelection,
  } = useOrderSelectionActions()

  const handleEnterSelectionMode = useCallback(() => {
    enableSelectionMode()
  }, [enableSelectionMode])

  const handleExitSelectionMode = useCallback(() => {
    disableSelectionMode()
  }, [disableSelectionMode])

  const handleClearSelection = useCallback(() => {
    clearSelection()
  }, [clearSelection])

  const handleSelectAllFiltered = useCallback(() => {
    const snapshotQuery = buildOrderSelectionSnapshotQuery(query)
    const snapshotKey = buildOrderSelectionSnapshotKey(snapshotQuery)
    const estimatedCount = Math.max(orderStats?.orders?.total ?? 0, visibleOrders.length)
    const loadedServerIds = visibleOrders
      .map((order) => order.id)
      .filter((id): id is number => Number.isFinite(id))

    addSelectAllSnapshot(
      {
        key: snapshotKey,
        query: snapshotQuery,
        estimatedCount,
      },
      loadedServerIds,
    )

    setResolvedSelection({
      isLoading: true,
    })
  }, [addSelectAllSnapshot, orderStats?.orders?.total, query, setResolvedSelection, visibleOrders])

  const handleToggleOrderSelection = useCallback(
    (order: Order) => {
      const state = useOrderSelectionStore.getState()
      const serverId = order.id
      const hasSnapshots = state.selectAllSnapshots.length > 0
      const isManualSelected = typeof serverId === 'number'
        ? state.manualSelectedServerIds.includes(serverId)
        : state.manualSelectedClientIds.includes(order.client_id)
      const isExcluded = typeof serverId === 'number'
        ? state.excludedServerIds.includes(serverId)
        : false
      const isSelectedFromSnapshot = typeof serverId === 'number'
        ? state.loadedSelectionIds.includes(serverId)
        : false

      if (typeof serverId === 'number' && hasSnapshots && (isSelectedFromSnapshot || isManualSelected || isExcluded)) {
        if (isManualSelected) {
          toggleManualOrder({ clientId: order.client_id, serverId })
          return
        }

        toggleExcludedServerId(serverId)
        return
      }

      toggleManualOrder({ clientId: order.client_id, serverId })
    },
    [toggleExcludedServerId, toggleManualOrder],
  )

  return {
    handleEnterSelectionMode,
    handleExitSelectionMode,
    handleClearSelection,
    handleSelectAllFiltered,
    handleToggleOrderSelection,
  }
}
