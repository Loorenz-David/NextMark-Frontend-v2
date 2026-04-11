type EnumOption<TValue extends string> = {
  label: string
  value: TValue
}

export const zoneVehicleCapabilityOptions = [
  { label: 'Cold Chain', value: 'cold_chain' },
  { label: 'Fragile', value: 'fragile' },
  { label: 'Heavy Load', value: 'heavy_load' },
  { label: 'Returns', value: 'returns' },
  { label: 'Oversized', value: 'oversized' },
] as const satisfies ReadonlyArray<
  EnumOption<'cold_chain' | 'fragile' | 'heavy_load' | 'returns' | 'oversized'>
>

export const zoneRouteEndStrategyOptions = [
  { label: 'Round Trip', value: 'round_trip' },
  { label: 'Custom End Address', value: 'custom_end_address' },
  { label: 'End At Last Stop', value: 'end_at_last_stop' },
  { label: 'Last Stop', value: 'last_stop' },
] as const satisfies ReadonlyArray<
  EnumOption<'round_trip' | 'custom_end_address' | 'end_at_last_stop' | 'last_stop'>
>

export type ZoneVehicleCapability =
  (typeof zoneVehicleCapabilityOptions)[number]['value']

export type ZoneRouteEndStrategy =
  (typeof zoneRouteEndStrategyOptions)[number]['value']

const buildValueSet = <TValue extends string>(options: ReadonlyArray<{ value: TValue }>) =>
  new Set(options.map((option) => option.value))

export const zoneVehicleCapabilityValueSet = buildValueSet(zoneVehicleCapabilityOptions)
export const zoneRouteEndStrategyValueSet = buildValueSet(zoneRouteEndStrategyOptions)
