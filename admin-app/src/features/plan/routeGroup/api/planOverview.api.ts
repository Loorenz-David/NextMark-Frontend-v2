import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { OrderMap } from '@/features/order/types/order'
import type { RouteGroupMap } from '@/features/plan/routeGroup/types/routeGroup'
import type { RouteSolutionMap } from '@/features/plan/routeGroup/types/routeSolution'
import type { RouteSolutionStopMap } from '@/features/plan/routeGroup/types/routeSolutionStop'

export type RouteGroupOverviewResponse = {
  order: OrderMap
  route_group: RouteGroupMap
  route_solution: RouteSolutionMap
  route_solution_stop: RouteSolutionStopMap
}

export const planOverviewApi = {
  getRouteGroupOverview: (
    planId: number | string,
  ): Promise<ApiResult<RouteGroupOverviewResponse>> =>
    apiClient.request<RouteGroupOverviewResponse>({
      path: `/route_plan_overviews/${planId}/route_group/`,
      method: 'GET',
    }),
}
