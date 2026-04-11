import { useEffect, useRef } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { MAP_MARKER_LAYERS } from '@/shared/map'
import { useMapManager } from '@/shared/resource-manager/useResourceManager'

import { useOrderSelectionActions, useOrderSelectionMode } from '../store/orderSelectionHooks.store'
import type { OrderMarkerGroupLookup } from '../store/orderMapInteraction.store'
import { useOrderMapInteractionStore } from '../store/orderMapInteraction.store'
import { useOrderStore } from '../store/order.store'
import type { Order } from '../types/order'

type SelectionFromClientIds = {
  clientIds: string[]
  serverIds: number[]
  unsyncedCount: number
}

export const buildOrderSelectionFromClientIds = (
  clientIds: string[],
  byClientId: Record<string, Order>,
): SelectionFromClientIds => {
  const uniqueClientIds = Array.from(new Set(clientIds))
  const selectedServerIds: number[] = []
  let unsyncedCount = 0

  uniqueClientIds.forEach((clientId) => {
    const order = byClientId[clientId]
    if (typeof order?.id === 'number') {
      selectedServerIds.push(order.id)
      return
    }
    unsyncedCount += 1
  })

  return {
    clientIds: uniqueClientIds,
    serverIds: Array.from(new Set(selectedServerIds)),
    unsyncedCount,
  }
}

export const expandOrderClientIdsFromMarkerSelection = (
  markerIds: string[],
  lookup: OrderMarkerGroupLookup,
): string[] => {
  const expandedClientIds: string[] = []

  markerIds.forEach((markerId) => {
    const groupedClientIds = lookup.markerOrderClientIdsByMarkerId[markerId]
    if (groupedClientIds && groupedClientIds.length > 0) {
      expandedClientIds.push(...groupedClientIds)
      return
    }
    expandedClientIds.push(markerId)
  })

  return Array.from(new Set(expandedClientIds))
}

export const useOrderCircleSelectionFlow = () => {
  const mapManager = useMapManager()
  const { showMessage } = useMessageHandler()
  const isSelectionMode = useOrderSelectionMode()
  const { setSelectedOrders, clearSelection, disableSelectionMode } = useOrderSelectionActions()
  const unsyncedWarningKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isSelectionMode) {
      mapManager.disableCircleSelection()
      clearSelection()
      unsyncedWarningKeyRef.current = null
      return
    }

    mapManager.enableCircleSelection({
      layerId: MAP_MARKER_LAYERS.orders,
      callback: (markerIds) => {
        const byClientId = useOrderStore.getState().byClientId
        const markerLookup = useOrderMapInteractionStore.getState().markerLookup
        const expandedMarkerIds = mapManager.expandClusterIds(
          MAP_MARKER_LAYERS.orders,
          markerIds,
        )
        const expandedClientIds = expandOrderClientIdsFromMarkerSelection(
          expandedMarkerIds,
          markerLookup,
        )
        const {
          clientIds: resolvedClientIds,
          serverIds,
          unsyncedCount,
        } = buildOrderSelectionFromClientIds(expandedClientIds, byClientId)

        setSelectedOrders({
          clientIds: resolvedClientIds,
          serverIds,
        })

        const warningKey = `${resolvedClientIds.join(',')}|${unsyncedCount}`
        if (unsyncedCount > 0 && unsyncedWarningKeyRef.current !== warningKey) {
          showMessage({
            status: 'warning',
            message: `${unsyncedCount} selected orders are unsynced and will be skipped.`,
          })
          unsyncedWarningKeyRef.current = warningKey
        }

        if (unsyncedCount === 0) {
          unsyncedWarningKeyRef.current = null
        }
      },
    })

    const handleEscapeKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      event.preventDefault()
      event.stopPropagation()
      disableSelectionMode()
    }

    window.addEventListener('keydown', handleEscapeKeyDown, true)

    return () => {
      window.removeEventListener('keydown', handleEscapeKeyDown, true)
      mapManager.disableCircleSelection()
    }
  }, [clearSelection, disableSelectionMode, isSelectionMode, mapManager, setSelectedOrders, showMessage])
}
