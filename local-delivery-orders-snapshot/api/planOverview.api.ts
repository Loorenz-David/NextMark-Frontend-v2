import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { OrderMap } from '@/features/order/types/order'
import type { LocalDeliveryPlanMap } from '@/features/local-delivery-orders/types/localDeliveryPlan'
import type { RouteSolutionMap } from '@/features/local-delivery-orders/types/routeSolution'
import type { RouteSolutionStopMap } from '@/features/local-delivery-orders/types/routeSolutionStop'

export type LocalDeliveryOverviewResponse = {
  order: OrderMap
  route_group: LocalDeliveryPlanMap
  route_solution: RouteSolutionMap
  route_solution_stop: RouteSolutionStopMap
}

export const planOverviewApi = {
  getLocalDeliveryOverview: (
    planId: number | string,
  ): Promise<ApiResult<LocalDeliveryOverviewResponse>> =>
    apiClient.request<LocalDeliveryOverviewResponse>({
      path: `/route_plan_overviews/${planId}/route_group/`,
      method: 'GET',
    }),
}
