import type { RouteOptimizationPayload } from '@/features/plan/routeGroup/api/routeOptimization.api'
import type { RouteGroup } from '@/features/plan/routeGroup/types/routeGroup'
import type { RouteSolution } from '@/features/plan/routeGroup/types/routeSolution'
import type { DeliveryPlan } from '@/features/plan/types/plan'

type Params = {
  plan: DeliveryPlan | null | undefined
  routeGroup: RouteGroup | null | undefined
  selectedRouteSolution: RouteSolution | null
}

export function buildRouteOptimizationPayload({
  plan,
  routeGroup,
  selectedRouteSolution,
}: Params): RouteOptimizationPayload | null {
  const routeGroupId = routeGroup?.id
  if (!routeGroupId) return null
  void plan
  void selectedRouteSolution

  return {
    route_group_id: routeGroupId,
  }
}
