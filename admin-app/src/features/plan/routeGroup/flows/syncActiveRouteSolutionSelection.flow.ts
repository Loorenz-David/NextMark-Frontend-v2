import { useEffect } from 'react'

import type { RouteSolution } from '../types/routeSolution'
import { setSelectedRouteSolution } from '../store/routeSolution.store'
import { useRouteSolutionPreviewStore } from '../store/routeSolutionPreview.store'

type SyncActiveRouteSolutionSelectionParams = {
  routeGroupId: number | null
  routeSolutions: RouteSolution[]
  storedSelectedRouteSolutionId: number | null
  fallbackRouteSolutionId: number | null
}

export const useSyncActiveRouteSolutionSelectionFlow = ({
  routeGroupId,
  routeSolutions,
  storedSelectedRouteSolutionId,
  fallbackRouteSolutionId,
}: SyncActiveRouteSolutionSelectionParams) => {
  useEffect(() => {
    if (routeGroupId == null) return

    return () => {
      useRouteSolutionPreviewStore.getState().clearPreviewedId(routeGroupId)
    }
  }, [routeGroupId])

  useEffect(() => {
    if (routeGroupId == null || routeSolutions.length === 0) {
      return
    }

    const hasValidStoredSelection = storedSelectedRouteSolutionId != null
      && routeSolutions.some((routeSolution) => routeSolution.id === storedSelectedRouteSolutionId)

    if (hasValidStoredSelection || fallbackRouteSolutionId == null) {
      return
    }

    setSelectedRouteSolution(fallbackRouteSolutionId, routeGroupId)
  }, [fallbackRouteSolutionId, routeGroupId, routeSolutions, storedSelectedRouteSolutionId])
}
