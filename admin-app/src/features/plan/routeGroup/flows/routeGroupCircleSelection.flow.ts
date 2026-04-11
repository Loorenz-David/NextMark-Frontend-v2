import { useEffect, useRef } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { MAP_MARKER_LAYERS } from '@/shared/map'
import { useMapManager } from '@/shared/resource-manager/useResourceManager'
import { useOrderStore } from '@/features/order/store/order.store'
import type { Order } from '@/features/order/types/order'
import type { RouteGroupMarkerGroupLookup } from '@/features/plan/routeGroup/store/routeGroupMapInteraction.store'
import { useRouteGroupMapInteractionStore } from '@/features/plan/routeGroup/store/routeGroupMapInteraction.store'

import {
  useRouteGroupSelectionActions,
  useRouteGroupSelectionMode,
} from '../store/routeGroupSelectionHooks.store'

type SelectionFromClientIds = {
  clientIds: string[]
  serverIds: number[]
  unsyncedCount: number
}

const isRouteGroupOrderMarkerId = (markerId: string) =>
  !markerId.startsWith('route-start-') && !markerId.startsWith('route-end-')

export const expandRouteGroupClientIdsFromMarkerSelection = (
  markerIds: string[],
  lookup: RouteGroupMarkerGroupLookup,
): string[] => {
  const expandedClientIds: string[] = []

  markerIds
    .filter(isRouteGroupOrderMarkerId)
    .forEach((markerId) => {
      const groupedClientIds = lookup.markerOrderClientIdsByMarkerId[markerId]
      if (groupedClientIds && groupedClientIds.length > 0) {
        expandedClientIds.push(...groupedClientIds)
        return
      }
      expandedClientIds.push(markerId)
    })

  return Array.from(new Set(expandedClientIds))
}

export const buildRouteGroupSelectionFromClientIds = (
  clientIds: string[],
  byClientId: Record<string, Order>,
): SelectionFromClientIds => {
  const uniqueClientIds = Array.from(new Set(clientIds)).filter(isRouteGroupOrderMarkerId)
  const selectedServerIds: number[] = []
  let unsyncedCount = 0
 
  uniqueClientIds.forEach((clientId) => {
    const order = byClientId[clientId]
    if (!order) return

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

export const useRouteGroupCircleSelectionFlow = (isActive: boolean) => {
  const mapManager = useMapManager()
  const { showMessage } = useMessageHandler()
  const isSelectionMode = useRouteGroupSelectionMode()
  const { setSelectedOrders, clearSelection, disableSelectionMode } = useRouteGroupSelectionActions()
  const unsyncedWarningKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isActive) {
      mapManager.disableCircleSelection()
      clearSelection()
      unsyncedWarningKeyRef.current = null
      disableSelectionMode()
      return
    }

    if (!isSelectionMode) {
      mapManager.disableCircleSelection()
      clearSelection()
      unsyncedWarningKeyRef.current = null
      return
    }

    mapManager.enableCircleSelection({
      layerId: MAP_MARKER_LAYERS.routeGroup,
      callback: (markerIds) => {
        const byClientId = useOrderStore.getState().byClientId
        const markerLookup = useRouteGroupMapInteractionStore.getState().markerLookup
        const expandedMarkerIds = mapManager.expandClusterIds(
          MAP_MARKER_LAYERS.routeGroup,
          markerIds,
        )
        const expandedClientIds = expandRouteGroupClientIdsFromMarkerSelection(
          expandedMarkerIds,
          markerLookup,
        )
        const {
          clientIds: resolvedClientIds,
          serverIds,
          unsyncedCount,
        } = buildRouteGroupSelectionFromClientIds(expandedClientIds, byClientId)

        setSelectedOrders({
          clientIds: resolvedClientIds,
          serverIds,
        })

        const warningKey = `${resolvedClientIds.join(',')}|${unsyncedCount}`
        if (unsyncedCount > 0 && unsyncedWarningKeyRef.current !== warningKey) {
          showMessage({
            status: 'warning',
            message: `${unsyncedCount} selected route group orders are unsynced and will be skipped.`,
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
  }, [clearSelection, disableSelectionMode, isActive, isSelectionMode, mapManager, setSelectedOrders, showMessage])

  useEffect(() => {
    return () => {
      disableSelectionMode()
    }
  }, [disableSelectionMode])
}
