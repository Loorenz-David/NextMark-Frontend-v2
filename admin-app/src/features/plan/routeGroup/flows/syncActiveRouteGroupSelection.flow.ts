import { useEffect } from 'react'

import type { RouteGroup } from '../types/routeGroup'
import { clearActiveRouteGroupSelection } from '../store/activeRouteGroup.store'

type SyncActiveRouteGroupSelectionParams = {
  planId: number | null
  routeGroups: RouteGroup[]
  activeRouteGroupId: number | null
}

export const useSyncActiveRouteGroupSelectionFlow = ({
  planId,
  routeGroups,
  activeRouteGroupId,
}: SyncActiveRouteGroupSelectionParams) => {
  useEffect(() => {
    if (planId == null) {
      clearActiveRouteGroupSelection()
      return
    }

    if (routeGroups.length === 0) {
      clearActiveRouteGroupSelection()
      return
    }

    const isActiveRouteGroupValid = activeRouteGroupId != null
      && routeGroups.some((routeGroup) => routeGroup.id === activeRouteGroupId)

    if (isActiveRouteGroupValid) {
      return
    }

    clearActiveRouteGroupSelection()
  }, [activeRouteGroupId, planId, routeGroups])
}
