import type { address } from '@/types/address'
import type { ServiceTime } from '@/features/local-delivery-orders/types/serviceTime'

import { useLocalDeliveryEditFormWarnings } from './LocalDeliveryEditForm.warnings'
import { useLocalDeliveryEditFormActions } from './localDeliveryEditForm.actions'
import type { useLocalDeliveryEditFormSetters } from './localDeliveryEditForm.setters'

export type PopupPayload = {
  localDeliveryPlanId?: number
  route_group_id?: number
}

export type LocalDeliveryEditFormState = {
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
    stops_service_time: ServiceTime | null
    route_end_strategy: 'round_trip' | 'custom_end_address' | 'end_at_last_stop'
    driver_id: number | null
    vehicle_id: number | null
    created_at?: string | null
    is_optimized?: string | null
  }
  create_variant_on_save: boolean
}

export type LocalDeliveryEditFormWarnings = ReturnType<typeof useLocalDeliveryEditFormWarnings>

export type LocalDeliveryEditFormActions = ReturnType<typeof useLocalDeliveryEditFormActions>

export type PropsLocalDeliveryEditFormContext = {
  formState: LocalDeliveryEditFormState
  formWarnings: LocalDeliveryEditFormWarnings
  hasMultipleVariants: boolean
  hasUnsavedChanges: boolean
  formSetters: ReturnType<typeof useLocalDeliveryEditFormSetters>
  actions: LocalDeliveryEditFormActions
}
