import type { Item } from '@/features/order/item/types'
import type { Order } from '@/features/order/types/order'
import type { OrderStats } from '@/features/order/types/orderMeta'
import type { OrderState } from '@/features/order/types/orderState'
import type { RouteGroup } from '@/features/plan/routeGroup/types/routeGroup'
import type { RouteSolution } from '@/features/plan/routeGroup/types/routeSolution'
import type { RouteSolutionStop } from '@/features/plan/routeGroup/types/routeSolutionStop'
import type { PlanStats } from '@/features/plan/types/planMeta'
import type { DeliveryPlan } from '@/features/plan/types/plan'
import type { DeliveryPlanState } from '@/features/plan/types/planState'

export type RouteOperationsFixtureScenario = {
  routePlans: DeliveryPlan[]
  routePlanStates: DeliveryPlanState[]
  routeGroups: RouteGroup[]
  routeSolutions: RouteSolution[]
  routeSolutionStops: RouteSolutionStop[]
  orders: Order[]
  items: Item[]
  orderStates: OrderState[]
  visibleRoutePlanClientIds?: string[]
  visibleOrderClientIds?: string[]
  planStats: PlanStats
  orderStats: OrderStats
}
