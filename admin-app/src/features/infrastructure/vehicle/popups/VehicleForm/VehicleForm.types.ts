export type VehicleFormMode = 'create' | 'edit'

export type VehicleFormPayload = {
  mode: VehicleFormMode
  clientId?: string
}

export type VehicleFormState = {
  registration_number: string
  label: string
  fuel_type: string
  travel_mode: string
  max_volume_load_m3: number | null
  max_weight_load_kg: number | null
  max_speed_kmh: number | null
  cost_per_km: number | null
  cost_per_hour: number | null
  travel_distance_limit_km: number | null
  travel_duration_limit_minutes: number | null
  home_facility_id: string
  status: string
  is_active: boolean
  capabilities_csv: string
  loading_time_per_stop_minutes: number | null
  unloading_time_per_stop_minutes: number | null
  fixed_cost: number | null
}
