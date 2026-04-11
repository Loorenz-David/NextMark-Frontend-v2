import type { OrderDto, OrderDtoCollection } from '../orders/api/orders.dto'
import type { RouteStopsDto } from '../stops/api'

export type RouteDtoCollection<T> = {
  byClientId: Record<string, T>
  allIds: string[]
}

export type RoutePlanDto = {
  id: number
  client_id: string
  label: string | null
  plan_type: string | null
  start_date: string | null
  end_date: string | null
  created_at: string | null
  updated_at: string | null
  state_id: number | null
}

export type DeliveryPlanDto = RoutePlanDto

export type LocalDeliveryPlanDto = {
  id: number
  client_id: string
  actual_start_time: string | null
  actual_end_time: string | null
  driver_id: number | null
  delivery_plan_id: number
  updated_at: string | null
}

export type RouteDto = {
  id: number
  route_solution_id?: number | null
  route_group_id?: number | null
  client_id: string
  _representation: 'full' | 'partial' | 'summary'
  label?: string | null
  version?: number | null
  algorithm?: string | null
  score?: number | null
  total_distance_meters?: number | null
  total_travel_time_seconds?: number | null
  start_leg_polyline?: unknown
  end_leg_polyline?: unknown
  has_route_warnings?: boolean | null
  route_warnings?: unknown
  start_location?: Record<string, unknown> | null
  end_location?: Record<string, unknown> | null
  expected_start_time?: string | null
  expected_end_time?: string | null
  actual_start_time?: string | null
  actual_end_time?: string | null
  set_start_time?: string | null
  set_end_time?: string | null
  eta_tolerance_seconds?: number | null
  stops_service_time?: Record<string, unknown> | null
  is_selected: boolean
  is_optimized?: string | null
  driver_id: number | null
  route_end_strategy?: string | null
  local_delivery_plan_id: number
  created_at: string | null
  updated_at: string | null
  route_plan?: RoutePlanDto | null
  delivery_plan?: DeliveryPlanDto | null
  local_delivery_plan?: LocalDeliveryPlanDto | null
}

export type ActiveRoutesDto = {
  routes: RouteDtoCollection<RouteDto>
}

export type RouteSnapshotDto = RouteStopsDto & {
  route: RouteDto
  orders: OrderDtoCollection<OrderDto>
}

export type RouteFreshnessDto = {
  route_id: number
  route_solution_id?: number | null
  delivery_plan_id: number | null
  route_freshness_updated_at: string | null
}
