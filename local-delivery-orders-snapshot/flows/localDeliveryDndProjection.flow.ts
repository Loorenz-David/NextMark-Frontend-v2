import { useMemo } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import type { RouteReorderPreview } from '@/features/plan/dnd/controller/resolveDropIntent'

type SortEntry = {
  stop: {
    client_id: string
  }
}

export const useLocalDeliveryDndProjectionFlow = (
  sortedEntries: SortEntry[],
  routeReorderPreview: RouteReorderPreview | null,
  currentRouteSolutionId?: number | null,
) => {
  const projectedOrderedStopClientIds = useMemo(() => {
    if (!routeReorderPreview) {
      return null
    }

    if (
      typeof currentRouteSolutionId === 'number'
      && routeReorderPreview.routeSolutionId !== currentRouteSolutionId
    ) {
      return null
    }

    const baseOrder = routeReorderPreview.orderedStopClientIds.length
      ? routeReorderPreview.orderedStopClientIds
      : sortedEntries.map((entry) => entry.stop.client_id)

    if (!baseOrder.length) {
      return null
    }

    if (routeReorderPreview.kind === 'MOVE_ROUTE_STOP') {
      const fromIndex = baseOrder.findIndex((clientId) => clientId === routeReorderPreview.fromStopClientId)
      const toIndex = baseOrder.findIndex((clientId) => clientId === routeReorderPreview.toStopClientId)
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
        return null
      }
      return arrayMove(baseOrder, fromIndex, toIndex)
    }

    const movingSet = new Set(routeReorderPreview.movingStopClientIds)
    const movingInOrder = baseOrder.filter((clientId) => movingSet.has(clientId))
    if (!movingInOrder.length) {
      return null
    }

    const remaining = baseOrder.filter((clientId) => !movingSet.has(clientId))
    const maxPosition = remaining.length + 1
    if (routeReorderPreview.position < 1 || routeReorderPreview.position > maxPosition) {
      return null
    }

    const insertIndex = routeReorderPreview.position - 1
    return [
      ...remaining.slice(0, insertIndex),
      ...movingInOrder,
      ...remaining.slice(insertIndex),
    ]
  }, [currentRouteSolutionId, routeReorderPreview, sortedEntries])

  const projectedStopOrderByClientId = useMemo(() => {
    if (!projectedOrderedStopClientIds) {
      return null
    }

    const nextOrderMap = new Map<string, number>()
    projectedOrderedStopClientIds.forEach((clientId, index) => {
      nextOrderMap.set(clientId, index + 1)
    })
    return nextOrderMap
  }, [projectedOrderedStopClientIds])

  return {
    projectedStopOrderByClientId,
    projectedOrderedStopClientIds,
  }
}
