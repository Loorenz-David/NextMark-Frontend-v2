import {
  clearRouteGroups,
  insertRouteGroup,
} from '@/features/plan/routeGroup/store/routeGroup.slice'
import {
  clearRouteSolutions,
  insertRouteSolution,
} from '@/features/plan/routeGroup/store/routeSolution.store'
import {
  clearRouteSolutionStops,
  insertRouteSolutionStop,
} from '@/features/plan/routeGroup/store/routeSolutionStop.store'

import { resolveLoadedRouteProgressPlanId } from '../resolveLoadedRouteProgressPlanId.query'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runResolveLoadedRouteProgressPlanIdTests = () => {
  clearRouteGroups()
  clearRouteSolutions()
  clearRouteSolutionStops()

  try {
    insertRouteGroup({
      id: 20,
      client_id: 'group-20',
      route_plan_id: 10,
    })
    insertRouteSolution({
      id: 30,
      client_id: 'solution-30',
      route_group_id: 20,
      route_end_strategy: 'round_trip',
    })
    insertRouteSolutionStop({
      id: 40,
      client_id: 'stop-40',
      route_solution_id: 30,
    })

    assert(
      resolveLoadedRouteProgressPlanId({
        eventName: 'route_solution.updated',
        entityId: 30,
        payloadRouteSolutionId: null,
      }) === 10,
      'a loaded route-solution update should resolve its plan',
    )

    assert(
      resolveLoadedRouteProgressPlanId({
        eventName: 'route_solution_stop.updated',
        entityId: 40,
        payloadRouteSolutionId: null,
      }) === 10,
      'a loaded route-stop update should resolve its route and plan',
    )

    assert(
      resolveLoadedRouteProgressPlanId({
        eventName: 'route_solution.updated',
        entityId: 999,
        payloadRouteSolutionId: null,
      }) === null,
      'unloaded routes should not trigger background route-group refreshes',
    )
  } finally {
    clearRouteGroups()
    clearRouteSolutions()
    clearRouteSolutionStops()
  }
}
