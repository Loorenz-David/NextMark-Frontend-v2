import type { RouteOptimizationPayload } from '@/features/local-delivery-orders/api/routeOptimization.api'
import type { LocalDeliveryPlan } from '@/features/local-delivery-orders/types/localDeliveryPlan'
import type { RouteSolution } from '@/features/local-delivery-orders/types/routeSolution'
import type { DeliveryPlan } from '@/features/plan/types/plan'

type Params = {
  plan: DeliveryPlan | null | undefined
  localDeliveryPlan: LocalDeliveryPlan | null | undefined
  selectedRouteSolution: RouteSolution | null
}

export function buildRouteOptimizationPayload({
  plan,
  localDeliveryPlan,
  selectedRouteSolution,
}: Params): RouteOptimizationPayload | null {
  const localDeliveryPlanId = localDeliveryPlan?.id
  if (!localDeliveryPlanId) return null
  void plan
  void selectedRouteSolution

  return {
    route_group_id: localDeliveryPlanId,
  }
}
