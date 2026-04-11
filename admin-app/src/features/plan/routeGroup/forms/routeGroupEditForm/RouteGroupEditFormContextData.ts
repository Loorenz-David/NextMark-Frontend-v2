import { useMemo } from 'react'

import { useRouteGroupByServerId } from '@/features/plan/routeGroup/store/useRouteGroup.selector'
import { useRoutePlanByServerId } from '@/features/plan/store/useRoutePlan.selector'
import {
  useRouteSolutionsByRouteGroupId,
  useSelectedRouteSolutionByRouteGroupId,
} from '@/features/plan/routeGroup/store/useRouteSolution.selector'
import { useRouteSolutionPreviewStore } from '@/features/plan/routeGroup/store/routeSolutionPreview.store'

import type { PopupPayload } from './RouteGroupEditForm.types'

export const useRouteGroupEditFormContextData = (entryPayload?: PopupPayload) => {
  const rawRouteGroupId =
    entryPayload?.routeGroupId ?? entryPayload?.route_group_id ?? null
  const parsedRouteGroupId =
    typeof rawRouteGroupId === 'string'
      ? Number(rawRouteGroupId)
      : rawRouteGroupId
  const routeGroupId =
    typeof parsedRouteGroupId === 'number' && Number.isNaN(parsedRouteGroupId)
      ? null
      : parsedRouteGroupId

  const routeGroup = useRouteGroupByServerId(routeGroupId)
  const plan = useRoutePlanByServerId(routeGroup?.route_plan_id)
  const routeSolutions = useRouteSolutionsByRouteGroupId(routeGroupId)
  const previewedSolutionId = useRouteSolutionPreviewStore(
    (state) => state.previewedIdByGroupId[routeGroupId ?? -1] ?? null,
  )
  const storedSelectedRouteSolution = useSelectedRouteSolutionByRouteGroupId(routeGroupId)
  const selectedRouteSolution = useMemo(() => {
    if (previewedSolutionId != null) {
      const previewedSolution =
        routeSolutions.find((routeSolution) => routeSolution.id === previewedSolutionId) ?? null
      if (previewedSolution) {
        return previewedSolution
      }
    }

    return storedSelectedRouteSolution ?? routeSolutions[0] ?? null
  }, [previewedSolutionId, routeSolutions, storedSelectedRouteSolution])

  return {
    routeGroupId,
    routeGroup,
    plan,
    selectedRouteSolution,
    routeSolutions,
  }
}
