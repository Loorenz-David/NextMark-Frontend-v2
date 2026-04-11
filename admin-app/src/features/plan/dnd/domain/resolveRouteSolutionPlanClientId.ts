import { selectRoutePlanByServerId, useRoutePlanStore } from '@/features/plan/store/routePlan.slice'
import {
  selectRouteGroupByServerId,
  useRouteGroupStore,
} from '@/features/plan/routeGroup/store/routeGroup.slice'
import {
  selectRouteSolutionByServerId,
  useRouteSolutionStore,
} from '@/features/plan/routeGroup/store/routeSolution.store'

export const resolveRouteSolutionPlanClientId = (routeSolutionId: number | null | undefined): string | null => {
  if (routeSolutionId == null) return null

  const routeSolution = selectRouteSolutionByServerId(routeSolutionId)(useRouteSolutionStore.getState())
  if (!routeSolution?.route_group_id) return null

  const routeGroup = selectRouteGroupByServerId(routeSolution.route_group_id)(
    useRouteGroupStore.getState(),
  )
  if (!routeGroup?.route_plan_id) return null

  const plan = selectRoutePlanByServerId(routeGroup.route_plan_id)(useRoutePlanStore.getState())
  return plan?.client_id ?? null
}
