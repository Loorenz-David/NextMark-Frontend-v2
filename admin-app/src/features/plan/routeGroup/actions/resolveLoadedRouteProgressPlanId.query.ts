import {
  selectRouteGroupByServerId,
  useRouteGroupStore,
} from '@/features/plan/routeGroup/store/routeGroup.slice'
import {
  selectRouteSolutionByServerId,
  useRouteSolutionStore,
} from '@/features/plan/routeGroup/store/routeSolution.store'
import {
  selectRouteSolutionStopByServerId,
  useRouteSolutionStopStore,
} from '@/features/plan/routeGroup/store/routeSolutionStop.store'

type RouteProgressEventName =
  | 'route_solution.updated'
  | 'route_solution_stop.updated'

type ResolveLoadedRouteProgressPlanIdParams = {
  eventName: RouteProgressEventName
  entityId: number | null
  payloadRouteSolutionId: number | null
}

export const resolveLoadedRouteProgressPlanId = ({
  eventName,
  entityId,
  payloadRouteSolutionId,
}: ResolveLoadedRouteProgressPlanIdParams): number | null => {
  let routeSolutionId = payloadRouteSolutionId

  if (routeSolutionId == null && eventName === 'route_solution.updated') {
    routeSolutionId = entityId
  }

  if (routeSolutionId == null && eventName === 'route_solution_stop.updated') {
    const stop = selectRouteSolutionStopByServerId(entityId)(
      useRouteSolutionStopStore.getState(),
    )
    routeSolutionId = stop?.route_solution_id ?? null
  }

  const solution = selectRouteSolutionByServerId(routeSolutionId)(
    useRouteSolutionStore.getState(),
  )
  if (solution?.route_group_id == null) {
    return null
  }

  const routeGroup = selectRouteGroupByServerId(solution.route_group_id)(
    useRouteGroupStore.getState(),
  )

  return routeGroup?.route_plan_id ?? null
}
