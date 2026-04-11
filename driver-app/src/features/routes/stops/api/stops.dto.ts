import type { ClientIdCollection } from '../../domain'

export type RouteStopDto = {
  client_id: string
  route_solution_id: number
  order_id: number | null
  service_duration: string | null
  service_time: Record<string, unknown> | null
  in_range: boolean | null
  stop_order: number | null
  reason_was_skipped: string | null
  has_constraint_violation: boolean | null
  constraint_warnings: unknown
  eta_status: string | null
  expected_arrival_time: string | null
  expected_departure_time: string | null
  expected_service_duration_seconds: number | null
  actual_arrival_time: string | null
  actual_departure_time: string | null
  to_next_polyline: unknown
}

export type RouteStopsDto = {
  stops: ClientIdCollection<RouteStopDto>
}
