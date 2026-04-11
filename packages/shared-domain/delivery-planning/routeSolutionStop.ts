import type { ISODateTime } from '../types'
import type { ServiceTime } from './serviceTime'

export type RouteSolutionStop = {
  id?: number
  client_id: string
  order_id?: number | null
  route_solution_id?: number | null
  service_duration?: string | null
  service_time?: ServiceTime | null
  stop_order?: number | null
  eta_status?: string | null
  in_range?: boolean | null
  reason_was_skipped?: string | null
  expected_arrival_time?: ISODateTime | null
  expected_departure_time?: ISODateTime | null
  expected_service_duration_seconds?: number | null
  actual_arrival_time?: ISODateTime | null
  actual_departure_time?: ISODateTime | null
  to_next_polyline?: string | null
  has_constraint_violation?: boolean
  constraint_warnings?: Array<Record<string, unknown>> | null
  updated_at?: ISODateTime | null
}

export type RouteSolutionStopMap = {
  byClientId: Record<string, RouteSolutionStop>
  allIds: string[]
}
