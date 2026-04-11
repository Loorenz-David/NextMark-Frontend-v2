import type {
  VehicleCapability,
  VehicleFuelType,
  VehicleStatus,
  VehicleTravelMode,
} from '../../domain/infrastructureEnums'

export type {
  VehicleCapability,
  VehicleFuelType,
  VehicleStatus,
  VehicleTravelMode,
}

export type Vehicle = {
  id?: number
  client_id: string
  registration_number: string
  label?: string | null
  fuel_type?: VehicleFuelType | null
  travel_mode?: VehicleTravelMode | null
  max_volume_load_cm3?: number | null
  max_weight_load_g?: number | null
  max_speed_kmh?: number | null
  cost_per_km?: number | null
  cost_per_hour?: number | null
  travel_distance_limit_km?: number | null
  travel_duration_limit_minutes?: number | null
  home_facility_id?: number | null
  status?: VehicleStatus | null
  is_active?: boolean
  capabilities?: VehicleCapability[] | null
  loading_time_per_stop_seconds?: number | null
  unloading_time_per_stop_seconds?: number | null
  fixed_cost?: number | null
  is_system?: boolean
  team_id?: number | null
}

export type VehicleMap = {
  byClientId: Record<string, Vehicle>
  allIds: string[]
}

export type VehicleInput = Omit<Vehicle, 'id'>

export type VehicleUpdateFields = Partial<Omit<VehicleInput, 'client_id'>>

export type VehicleUpdatePayload = {
  target_id: number | string
  fields: VehicleUpdateFields
}
