import { clearRouteGroups } from '@/features/plan/routeGroup/store/routeGroup.slice'
import { clearRouteSolutions } from '@/features/plan/routeGroup/store/routeSolution.store'
import { clearRouteSolutionStops } from '@/features/plan/routeGroup/store/routeSolutionStop.store'
import { clearRoutePlanList } from '@/features/plan/store/routePlanList.store'
import { useRoutePlanPaginationStore } from '@/features/plan/store/routePlanPagination.store'
import { clearRoutePlans } from '@/features/plan/store/routePlan.slice'
import { clearRoutePlanStates } from '@/features/plan/store/routePlanState.store'

const FIXTURE_QUERY_KEY = 'route-operations-fixtures'

export const resetRouteOperationsPlanFixtures = () => {
  clearRoutePlans()
  clearRoutePlanStates()
  clearRouteGroups()
  clearRouteSolutions()
  clearRouteSolutionStops()
  clearRoutePlanList()
  useRoutePlanPaginationStore.getState().reset(FIXTURE_QUERY_KEY)
}
