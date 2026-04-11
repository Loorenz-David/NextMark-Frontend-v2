import { useRouteGroupPageActions } from '../actions/useRouteGroupPageActions'

type Params = {
  routeGroupId: number | null
  planId: number | null
  plan: Parameters<typeof useRouteGroupPageActions>[0]['plan']
  routeGroup: Parameters<typeof useRouteGroupPageActions>[0]['routeGroup']
  selectedRouteSolution: Parameters<typeof useRouteGroupPageActions>[0]['selectedRouteSolution']
  isSelectedSolutionOptimized: boolean
  loadingController: Parameters<typeof useRouteGroupPageActions>[0]['loadingController']
}

export const useRouteGroupPageCommandsController = ({
  routeGroupId,
  planId,
  plan,
  routeGroup,
  selectedRouteSolution,
  isSelectedSolutionOptimized,
  loadingController,
}: Params) => {
  const routeGroupPageActions = useRouteGroupPageActions({
    routeGroupId,
    planId,
    plan,
    routeGroup,
    selectedRouteSolution,
    isSelectedSolutionOptimized,
    loadingController,
  })

  return {
    routeGroupPageActions,
    loadingController,
  }
}
