import type { address } from '../core'
import type { ISODateTime } from '../types'
import type { ServiceTime } from './serviceTime'

export type RouteSolutionWarningBase = {
  type?: string
  severity?: string
  message?: string
}

export type RouteEndTimeExceededWarning = RouteSolutionWarningBase & {
  type: 'route_end_time_exceeded'
  route_expected_end?: ISODateTime
  route_allowed_end?: ISODateTime
}

export type VehicleMaxVolumeExceededWarning = RouteSolutionWarningBase & {
  type: 'vehicle_max_volume_exceeded'
  total_volume_cm3?: number
  max_volume_cm3?: number
}

export type VehicleMaxWeightExceededWarning = RouteSolutionWarningBase & {
  type: 'vehicle_max_weight_exceeded'
  total_weight_g?: number
  max_weight_g?: number
}

export type VehicleMaxDistanceExceededWarning = RouteSolutionWarningBase & {
  type: 'vehicle_max_distance_exceeded'
  total_distance_km?: number
  max_distance_km?: number
}

export type VehicleMaxDurationExceededWarning = RouteSolutionWarningBase & {
  type: 'vehicle_max_duration_exceeded'
  total_duration_minutes?: number
  max_duration_minutes?: number
}

export type RouteSolutionWarning =
  | RouteEndTimeExceededWarning
  | VehicleMaxVolumeExceededWarning
  | VehicleMaxWeightExceededWarning
  | VehicleMaxDistanceExceededWarning
  | VehicleMaxDurationExceededWarning
  | RouteSolutionWarningBase

export type RouteEndStrategy = 'round_trip' | 'custom_end_address' | 'end_at_last_stop'

export type RouteSolutionRepresentation = 'partial' | 'full' | 'summary'

export type RouteSolution = {
  id?: number
  client_id: string
  _representation?: RouteSolutionRepresentation
  score?: number | null
  label?: string | null
  is_selected?: boolean
  is_optimized?: string | null
  stop_count?: number | null
  start_leg_polyline?: string | null
  end_leg_polyline?: string | null
  total_distance_meters?: number | null
  total_travel_time_seconds?: number | null
  expected_start_time?: ISODateTime | null
  expected_end_time?: ISODateTime | null
  actual_start_time?: ISODateTime | null
  actual_end_time?: ISODateTime | null
  created_at?: ISODateTime | null
  start_location?: address | null
  end_location?: address | null
  route_end_strategy: RouteEndStrategy
  set_start_time?: ISODateTime | null
  set_end_time?: ISODateTime | null
  eta_tolerance_seconds?: number | null
  eta_message_tolerance?: number | null
  stops_service_time?: ServiceTime | null
  driver_id?: number | null
  vehicle_id?: number | null
  route_group_id?: number | null
  has_route_warnings?: boolean
  route_warnings?: RouteSolutionWarning[] | null
  updated_at?: ISODateTime | null
}

export type RouteSolutionMap = {
  byClientId: Record<string, RouteSolution>
  allIds: string[]
}
