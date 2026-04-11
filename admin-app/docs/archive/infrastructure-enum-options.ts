export const vehicleFuelTypeOptions = [
  { label: 'Bensine', value: 'bensine' },
  { label: 'Diesel', value: 'diesel' },
  { label: 'Electric', value: 'electric' },
] as const

export const vehicleTravelModeOptions = [
  { label: 'Driving', value: 'DRIVING' },
  { label: 'Two Wheeler', value: 'TWO_WHEELER' },
  { label: 'Bicycling', value: 'BICYCLING' },
  { label: 'Walking', value: 'WALKING' },
] as const

export const vehicleStatusOptions = [
  { label: 'Idle', value: 'idle' },
  { label: 'In Route', value: 'in_route' },
  { label: 'Loading', value: 'loading' },
  { label: 'Offline', value: 'offline' },
  { label: 'Maintenance', value: 'maintenance' },
] as const

export const vehicleCapabilityOptions = [
  { label: 'Cold Chain', value: 'cold_chain' },
  { label: 'Fragile', value: 'fragile' },
  { label: 'Heavy Load', value: 'heavy_load' },
  { label: 'Returns', value: 'returns' },
  { label: 'Oversized', value: 'oversized' },
] as const

export const facilityTypeOptions = [
  { label: 'Warehouse', value: 'warehouse' },
  { label: 'Depot', value: 'depot' },
  { label: 'Hub', value: 'hub' },
  { label: 'Pickup Point', value: 'pickup_point' },
] as const

export const operatingDayOptions = [
  { label: 'Monday', value: 'mon' },
  { label: 'Tuesday', value: 'tue' },
  { label: 'Wednesday', value: 'wed' },
  { label: 'Thursday', value: 'thu' },
  { label: 'Friday', value: 'fri' },
  { label: 'Saturday', value: 'sat' },
  { label: 'Sunday', value: 'sun' },
] as const

export type VehicleFuelType = (typeof vehicleFuelTypeOptions)[number]['value']
export type VehicleTravelMode = (typeof vehicleTravelModeOptions)[number]['value']
export type VehicleStatus = (typeof vehicleStatusOptions)[number]['value']
export type VehicleCapability = (typeof vehicleCapabilityOptions)[number]['value']
export type FacilityType = (typeof facilityTypeOptions)[number]['value']
export type OperatingDay = (typeof operatingDayOptions)[number]['value']

export const infrastructureEnumMaps = {
  vehicleFuelTypes: vehicleFuelTypeOptions,
  vehicleTravelModes: vehicleTravelModeOptions,
  vehicleStatuses: vehicleStatusOptions,
  vehicleCapabilities: vehicleCapabilityOptions,
  facilityTypes: facilityTypeOptions,
  operatingDays: operatingDayOptions,
} as const
