import type { RouteDto, RoutePlanDto } from '../api/routes.dto'
import type { DriverRoutePlanRecord, DriverRouteRecord } from './routes.types'

function mapRoutePlanDtoToRecord(plan: RoutePlanDto | null | undefined): DriverRoutePlanRecord | null {
  if (!plan) {
    return null
  }

  return {
    id: plan.id,
    client_id: plan.client_id,
    label: plan.label ?? null,
    plan_type: plan.plan_type ?? null,
    start_date: plan.start_date ?? null,
    end_date: plan.end_date ?? null,
    created_at: plan.created_at ?? null,
    updated_at: plan.updated_at ?? null,
    state_id: plan.state_id ?? null,
  }
}

export function mapRouteDtoToRouteRecord(dto: RouteDto): DriverRouteRecord {
  const routeSolutionId = dto.route_solution_id ?? dto.id
  const routePlan = dto.route_plan ?? dto.delivery_plan ?? null

  return {
    id: routeSolutionId,
    route_solution_id: routeSolutionId,
    route_group_id: dto.route_group_id ?? null,
    client_id: dto.client_id,
    _representation: dto._representation,
    label: dto.label ?? null,
    version: dto.version ?? null,
    algorithm: dto.algorithm ?? null,
    score: dto.score ?? null,
    total_distance_meters: dto.total_distance_meters ?? null,
    total_travel_time_seconds: dto.total_travel_time_seconds ?? null,
    start_leg_polyline: dto.start_leg_polyline,
    end_leg_polyline: dto.end_leg_polyline,
    has_route_warnings: dto.has_route_warnings ?? null,
    route_warnings: dto.route_warnings,
    start_location: dto.start_location ?? null,
    end_location: dto.end_location ?? null,
    expected_start_time: dto.expected_start_time ?? null,
    expected_end_time: dto.expected_end_time ?? null,
    actual_start_time: dto.actual_start_time ?? null,
    actual_end_time: dto.actual_end_time ?? null,
    set_start_time: dto.set_start_time ?? null,
    set_end_time: dto.set_end_time ?? null,
    eta_tolerance_seconds: dto.eta_tolerance_seconds ?? null,
    stops_service_time: dto.stops_service_time ?? null,
    is_selected: dto.is_selected,
    is_optimized: dto.is_optimized ?? null,
    driver_id: dto.driver_id ?? null,
    route_end_strategy: dto.route_end_strategy ?? null,
    local_delivery_plan_id: dto.local_delivery_plan_id,
    created_at: dto.created_at ?? null,
    updated_at: dto.updated_at ?? null,
    delivery_plan: mapRoutePlanDtoToRecord(routePlan),
    local_delivery_plan: dto.local_delivery_plan ?? null,
  }
}
