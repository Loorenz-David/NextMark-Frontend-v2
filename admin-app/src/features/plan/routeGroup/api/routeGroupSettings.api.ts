import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'
import type { address } from '@/types/address'
import type { ServiceTime } from '@/features/plan/routeGroup/types/serviceTime'

import type { RouteSolution, RouteSolutionMap } from '@/features/plan/routeGroup/types/routeSolution'
import type { RouteSolutionStop, RouteSolutionStopMap } from '@/features/plan/routeGroup/types/routeSolutionStop'

export type RouteGroupSettingsPayload = {
  route_group_id: number
  route_plan?: {
    id?: number 
    label?: string
    start_date?: string | null
    end_date?: string | null
  }
  route_solution?: {
    id?: number 
    route_solution_id?: number | null
    start_location?: address | null
    end_location?: address | null
    set_start_time?: string | null
    set_end_time?: string | null
    eta_tolerance_minutes?: number
    eta_message_tolerance?: number | null
    stops_service_time?: ServiceTime | null
    route_end_strategy?: 'round_trip' | 'custom_end_address' | 'end_at_last_stop'
    driver_id?: number | null
    vehicle_id?: number | null
  }
  create_variant_on_save?: boolean
}

export type RouteGroupSettingsResponse = {
  route_solution?: RouteSolution | RouteSolutionMap
  route_solution_stops?: RouteSolutionStop[] | RouteSolutionStopMap
}

export const routeGroupSettingsApi = {
  updateRouteGroupSettings: (
    payload: RouteGroupSettingsPayload,
  ): Promise<ApiResult<RouteGroupSettingsResponse>> =>
    apiClient.request<RouteGroupSettingsResponse>({
      path: '/route_groups/settings',
      method: 'PATCH',
      data: payload,
    }),
}
