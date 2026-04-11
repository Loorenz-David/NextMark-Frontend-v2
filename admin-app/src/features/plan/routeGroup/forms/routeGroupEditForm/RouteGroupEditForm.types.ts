import type { address } from '@/types/address'
import type { ServiceTime } from '@/features/plan/routeGroup/types/serviceTime'

import { useRouteGroupEditFormWarnings } from './RouteGroupEditForm.warnings'
import { useRouteGroupEditFormActions } from './routeGroupEditForm.actions'
import type { useRouteGroupEditFormSetters } from './routeGroupEditForm.setters'

export type PopupPayload = {
  routeGroupId?: number
  route_group_id?: number
}

export type RouteGroupEditFormState = {
  route_group_id: number | null
  delivery_plan: {
    id?: number 
    client_id?: string | null
    label: string
    start_date: string
    end_date: string
  }
  route_solution: {
    id?: number 
    client_id?: string | null
    label?: string | null
    start_location: address | null
    end_location: address | null
    set_start_time: string | null
    set_end_time: string | null
    eta_tolerance_minutes: number
    eta_message_tolerance_minutes: number
    stops_service_time: ServiceTime | null
    route_end_strategy: 'round_trip' | 'custom_end_address' | 'end_at_last_stop'
    driver_id: number | null
    vehicle_id: number | null
    created_at?: string | null
    is_optimized?: string | null
  }
  create_variant_on_save: boolean
}

export type RouteGroupEditFormWarnings = ReturnType<typeof useRouteGroupEditFormWarnings>

export type RouteGroupEditFormActions = ReturnType<typeof useRouteGroupEditFormActions>

export type PropsRouteGroupEditFormContext = {
  formState: RouteGroupEditFormState
  formWarnings: RouteGroupEditFormWarnings
  hasMultipleVariants: boolean
  hasUnsavedChanges: boolean
  formSetters: ReturnType<typeof useRouteGroupEditFormSetters>
  actions: RouteGroupEditFormActions
}
