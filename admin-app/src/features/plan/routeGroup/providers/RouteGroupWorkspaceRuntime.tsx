import { useRouteGroupCircleSelectionFlow } from '../flows/routeGroupCircleSelection.flow'
import { useRouteGroupMapFlow } from '../flows/routeGroupMap.flow'
import { useActiveRouteGroupResourcesController } from '../controllers/useActiveRouteGroupResources.controller'

type RouteGroupWorkspaceRuntimeProps = {
  planId: number | null
  isActive: boolean
}

export const RouteGroupWorkspaceRuntime = ({
  planId,
  isActive,
}: RouteGroupWorkspaceRuntimeProps) => {
  const {
    orders,
    stopByOrderId,
    selectedRouteSolution,
    boundaryLocations,
  } = useActiveRouteGroupResourcesController(planId)

  useRouteGroupMapFlow({
    orders,
    stopByOrderId,
    selectedRouteSolution,
    isActive,
    boundaryLocations,
  })
  useRouteGroupCircleSelectionFlow(isActive)

  return null
}
