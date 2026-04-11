import type { address } from '@/types/address'

import type { FacilityType, OperatingDay } from '../../domain/infrastructureEnums'

export type FacilityOperatingHour = {
  day: OperatingDay
  open: string
  close: string
}

export type Facility = {
  id?: number
  client_id: string
  name: string
  facility_type: FacilityType
  property_location?: address | Record<string, unknown> | null
  can_dispatch?: boolean
  can_receive_returns?: boolean
  operating_hours?: FacilityOperatingHour[] | null
  default_loading_time_seconds?: number | null
  default_unloading_time_seconds?: number | null
  max_orders_per_day?: number | null
  external_refs?: Record<string, unknown> | null
  team_id?: number | null
}

export type FacilityMap = {
  byClientId: Record<string, Facility>
  allIds: string[]
}

export type FacilityInput = {
  client_id: string
  name: string
  facility_type: FacilityType
  property_location?: address | Record<string, unknown> | null
  can_dispatch?: boolean
  can_receive_returns?: boolean
  operating_hours?: FacilityOperatingHour[] | null
  default_loading_time_seconds?: number | null
  default_unloading_time_seconds?: number | null
  max_orders_per_day?: number | null
  external_refs?: Record<string, unknown> | null
}

export type FacilityUpdateFields = Partial<Omit<FacilityInput, 'client_id'>>

export type FacilityUpdatePayload = {
  target_id: number | string
  fields: FacilityUpdateFields
}
