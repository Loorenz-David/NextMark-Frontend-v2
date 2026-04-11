import type { address } from '@/types/address'

export type FacilityFormMode = 'create' | 'edit'

export type FacilityFormPayload = {
  mode: FacilityFormMode
  clientId?: string
}

export type FacilityFormState = {
  name: string
  facility_type: string
  property_location: address | null
  can_dispatch: boolean
  can_receive_returns: boolean
  operating_hours_json: string
  default_loading_time_minutes: number | null
  default_unloading_time_minutes: number | null
  max_orders_per_day: number | null
  external_refs_json: string
}
