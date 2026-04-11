import { useRouteSolutionWarningRegistry } from '../hooks/useRouteSolutionWarningRegistry'
import { useLoadingController } from './useLoadingController'
import { useActiveRouteGroupResourcesController } from './useActiveRouteGroupResources.controller'

export const useRouteGroupPageResourcesController = (planId: number | null) => {
  const resources = useActiveRouteGroupResourcesController(planId)
  const loadingController = useLoadingController({
    routeGroupClientId: resources.routeGroup?.client_id,
  })
  const routeSolutionWarningRegistry = useRouteSolutionWarningRegistry()

  return {
    ...resources,
    loadingController,
    routeSolutionWarningRegistry,
  }
}
