type EnumOption<TValue extends string> = {
  label: string
  value: TValue
}

export const vehicleFuelTypeOptions = [
  { label: 'Bensine', value: 'bensine' },
  { label: 'Diesel', value: 'diesel' },
  { label: 'Electric', value: 'electric' },
] as const satisfies ReadonlyArray<EnumOption<'bensine' | 'diesel' | 'electric'>>

export const vehicleTravelModeOptions = [
  { label: 'Driving', value: 'DRIVING' },
  { label: 'Two Wheeler', value: 'TWO_WHEELER' },
  { label: 'Bicycling', value: 'BICYCLING' },
  { label: 'Walking', value: 'WALKING' },
] as const satisfies ReadonlyArray<
  EnumOption<'DRIVING' | 'TWO_WHEELER' | 'BICYCLING' | 'WALKING'>
>

export const vehicleStatusOptions = [
  { label: 'Idle', value: 'idle' },
  { label: 'In Route', value: 'in_route' },
  { label: 'Loading', value: 'loading' },
  { label: 'Offline', value: 'offline' },
  { label: 'Maintenance', value: 'maintenance' },
] as const satisfies ReadonlyArray<
  EnumOption<'idle' | 'in_route' | 'loading' | 'offline' | 'maintenance'>
>

export const vehicleCapabilityOptions = [
  { label: 'Cold Chain', value: 'cold_chain' },
  { label: 'Fragile', value: 'fragile' },
  { label: 'Heavy Load', value: 'heavy_load' },
  { label: 'Returns', value: 'returns' },
  { label: 'Oversized', value: 'oversized' },
] as const satisfies ReadonlyArray<
  EnumOption<'cold_chain' | 'fragile' | 'heavy_load' | 'returns' | 'oversized'>
>

export const facilityTypeOptions = [
  { label: 'Warehouse', value: 'warehouse' },
  { label: 'Depot', value: 'depot' },
  { label: 'Hub', value: 'hub' },
  { label: 'Pickup Point', value: 'pickup_point' },
] as const satisfies ReadonlyArray<
  EnumOption<'warehouse' | 'depot' | 'hub' | 'pickup_point'>
>

export const operatingDayOptions = [
  { label: 'Monday', value: 'mon' },
  { label: 'Tuesday', value: 'tue' },
  { label: 'Wednesday', value: 'wed' },
  { label: 'Thursday', value: 'thu' },
  { label: 'Friday', value: 'fri' },
  { label: 'Saturday', value: 'sat' },
  { label: 'Sunday', value: 'sun' },
] as const satisfies ReadonlyArray<
  EnumOption<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'>
>

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

const buildValueSet = <TValue extends string>(options: ReadonlyArray<{ value: TValue }>) =>
  new Set(options.map((option) => option.value))

export const facilityTypeValueSet = buildValueSet(facilityTypeOptions)
export const operatingDayValueSet = buildValueSet(operatingDayOptions)
export const vehicleFuelTypeValueSet = buildValueSet(vehicleFuelTypeOptions)
export const vehicleTravelModeValueSet = buildValueSet(vehicleTravelModeOptions)
export const vehicleStatusValueSet = buildValueSet(vehicleStatusOptions)
export const vehicleCapabilityValueSet = buildValueSet(vehicleCapabilityOptions)
