import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'
import type { address } from '@/types/address'
import type { ServiceTime } from '@/features/local-delivery-orders/types/serviceTime'

import type { RouteSolution, RouteSolutionMap } from '@/features/local-delivery-orders/types/routeSolution'
import type { RouteSolutionStop, RouteSolutionStopMap } from '@/features/local-delivery-orders/types/routeSolutionStop'

export type LocalDeliveryPlanSettingsPayload = {
  route_group_id: number
  delivery_plan?: {
    id?: number 
    label?: string
    start_date?: string | null
    end_date?: string | null
  }
  local_delivery_plan?: {
    driver_id?: number | null
    actual_start_time?: string | null
    actual_end_time?: string | null
  }
  route_solution?: {
    id?: number 
    route_solution_id?: number | null
    start_location?: address | null
    end_location?: address | null
    set_start_time?: string | null
    set_end_time?: string | null
    eta_tolerance_minutes?: number
    stops_service_time?: ServiceTime | null
    route_end_strategy?: 'round_trip' | 'custom_end_address' | 'end_at_last_stop'
    driver_id?: number | null
    vehicle_id?: number | null
  }
  create_variant_on_save?: boolean
}

export type LocalDeliveryPlanSettingsResponse = {
  route_solution?: RouteSolution | RouteSolutionMap
  route_solution_stops?: RouteSolutionStop[] | RouteSolutionStopMap
}

export const localDeliveryPlanSettingsApi = {
  updateLocalDeliverySettings: (
    payload: LocalDeliveryPlanSettingsPayload,
  ): Promise<ApiResult<LocalDeliveryPlanSettingsResponse>> =>
    apiClient.request<LocalDeliveryPlanSettingsResponse>({
      path: '/route_groups/settings',
      method: 'PATCH',
      data: payload,
    }),
}
