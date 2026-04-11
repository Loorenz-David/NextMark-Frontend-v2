import { useAssignedRouteMapController } from './useAssignedRouteMapController.controller'
import { useSelectedAssignedRoute } from './useSelectedAssignedRoute.controller'

type UseRouteExecutionMapSurfaceControllerDependencies = {
  selectedStopClientId?: string | null
  onOpenStopDetail: (stopClientId: string) => void
}

export function useRouteExecutionMapSurfaceController(
  dependencies: UseRouteExecutionMapSurfaceControllerDependencies,
) {
  const route = useSelectedAssignedRoute()

  return useAssignedRouteMapController(route, dependencies)
}
