import type { RouteGroup } from '@/features/plan/routeGroup/types/routeGroup'
import type { RouteSolution } from '@/features/plan/routeGroup/types/routeSolution'
import type { RouteSolutionStop } from '@/features/plan/routeGroup/types/routeSolutionStop'
import type { PlanStats } from '@/features/plan/types/planMeta'
import type { DeliveryPlan } from '@/features/plan/types/plan'
import type { DeliveryPlanState } from '@/features/plan/types/planState'

import { insertRouteGroups } from '@/features/plan/routeGroup/store/routeGroup.slice'
import { insertRouteSolutions, setSelectedRouteSolution } from '@/features/plan/routeGroup/store/routeSolution.store'
import { insertRouteSolutionStops } from '@/features/plan/routeGroup/store/routeSolutionStop.store'
import { setRoutePlanListResult } from '@/features/plan/store/routePlanList.store'
import { useRoutePlanPaginationStore } from '@/features/plan/store/routePlanPagination.store'
import { insertRoutePlans, setVisibleRoutePlans } from '@/features/plan/store/routePlan.slice'
import { insertRoutePlanStates } from '@/features/plan/store/routePlanState.store'

import { toEntityTable } from './tables/toEntityTable'

const FIXTURE_QUERY_KEY = 'route-operations-fixtures'

type SeedRouteOperationsPlanFixturesPayload = {
  routePlans: DeliveryPlan[]
  routePlanStates: DeliveryPlanState[]
  routeGroups: RouteGroup[]
  routeSolutions: RouteSolution[]
  routeSolutionStops: RouteSolutionStop[]
  visibleRoutePlanClientIds?: string[]
  planStats?: PlanStats
}

export const seedRouteOperationsPlanFixtures = ({
  routePlans,
  routePlanStates,
  routeGroups,
  routeSolutions,
  routeSolutionStops,
  visibleRoutePlanClientIds,
  planStats,
}: SeedRouteOperationsPlanFixturesPayload) => {
  insertRoutePlanStates(toEntityTable(routePlanStates))
  insertRoutePlans(toEntityTable(routePlans))
  setVisibleRoutePlans(visibleRoutePlanClientIds ?? routePlans.map((routePlan) => routePlan.client_id))
  insertRouteGroups(toEntityTable(routeGroups))
  insertRouteSolutions(toEntityTable(routeSolutions))
  insertRouteSolutionStops(toEntityTable(routeSolutionStops))

  routeGroups.forEach((routeGroup) => {
    const selected = routeSolutions.find(
      (routeSolution) => routeSolution.route_group_id === routeGroup.id && routeSolution.is_selected,
    )

    if (selected?.id != null && routeGroup.id != null) {
      setSelectedRouteSolution(selected.id, routeGroup.id)
    }
  })

  setRoutePlanListResult({
    queryKey: FIXTURE_QUERY_KEY,
    query: {
      limit: 25,
    },
    stats: planStats,
    pagination: {
      has_more: false,
      next_cursor: null,
      prev_cursor: null,
    },
  })

  useRoutePlanPaginationStore.getState().reset(FIXTURE_QUERY_KEY)
  useRoutePlanPaginationStore.getState().applyPageResult({
    queryKey: FIXTURE_QUERY_KEY,
    nextCursor: null,
    hasMore: false,
    append: false,
  })
}
