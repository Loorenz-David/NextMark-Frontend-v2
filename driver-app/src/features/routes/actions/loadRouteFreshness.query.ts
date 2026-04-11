import { getRouteFreshnessApi } from '../api'

export type RouteFreshnessQueryResult = {
  routeId: number
  deliveryPlanId: number | null
  routeFreshnessUpdatedAt: string | null
}

export async function loadRouteFreshnessQuery(routeId: number): Promise<RouteFreshnessQueryResult> {
  const response = await getRouteFreshnessApi(routeId)
  const dto = response.data

  const routeSolutionId = dto?.route_solution_id ?? dto?.route_id

  if (!dto || typeof routeSolutionId !== 'number') {
    throw new Error('Route freshness response did not include route data.')
  }

  return {
    routeId: routeSolutionId,
    deliveryPlanId: dto.delivery_plan_id ?? null,
    routeFreshnessUpdatedAt: dto.route_freshness_updated_at ?? null,
  }
}
