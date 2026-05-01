import {
  vehicleCapabilityValueSet,
  vehicleFuelTypeValueSet,
  vehicleStatusValueSet,
  vehicleTravelModeValueSet,
} from '../../domain/infrastructureEnums'
import type {
  VehicleCapability,
  VehicleInput,
  VehicleUpdateFields,
} from '../types/vehicle'

export type VehicleFormDraft = {
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

type ParseResult<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; error: string }

const CUBIC_CENTIMETERS_PER_CUBIC_METER = 1_000_000
const GRAMS_PER_KILOGRAM = 1_000
const SECONDS_PER_MINUTE = 60

const roundToDecimals = (value: number, decimals: number) => {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export const cubicMetersToCubicCentimeters = (value: number | null | undefined) =>
  value === null || value === undefined ? null : Math.round(value * CUBIC_CENTIMETERS_PER_CUBIC_METER)

export const cubicCentimetersToCubicMeters = (value: number | null | undefined) =>
  value === null || value === undefined ? null : roundToDecimals(value / CUBIC_CENTIMETERS_PER_CUBIC_METER, 3)

export const kilogramsToGrams = (value: number | null | undefined) =>
  value === null || value === undefined ? null : Math.round(value * GRAMS_PER_KILOGRAM)

export const gramsToKilograms = (value: number | null | undefined) =>
  value === null || value === undefined ? null : roundToDecimals(value / GRAMS_PER_KILOGRAM, 3)

export const minutesToSeconds = (value: number | null | undefined) =>
  value === null || value === undefined ? null : Math.round(value * SECONDS_PER_MINUTE)

export const secondsToMinutes = (value: number | null | undefined) =>
  value === null || value === undefined ? null : roundToDecimals(value / SECONDS_PER_MINUTE, 2)

const toNullableNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : Number.NaN
  }

  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return null
  }

  const numericValue = Number(trimmedValue)
  return Number.isFinite(numericValue) ? numericValue : Number.NaN
}

const zeroToNull = (value: number | null): number | null =>
  value === 0 ? null : value

const toOptionalString = (value: string) => {
  const trimmedValue = value.trim()
  return trimmedValue ? trimmedValue : null
}

const parseCapabilities = (value: string): ParseResult<VehicleCapability[] | null> => {
  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return { ok: true, value: null }
  }

  const values = trimmedValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (values.some((item) => !vehicleCapabilityValueSet.has(item as VehicleCapability))) {
    return { ok: false, error: 'Capabilities must match the backend enum values.' }
  }

  return { ok: true, value: values as VehicleCapability[] }
}

const parseVehicleEnumValue = <TValue extends string>(
  value: string,
  allowedValues: Set<TValue>,
  fieldLabel: string,
): ParseResult<TValue | null> => {
  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return { ok: true, value: null }
  }

  if (!allowedValues.has(trimmedValue as TValue)) {
    return { ok: false, error: `${fieldLabel} must match the backend enum values.` }
  }

  return { ok: true, value: trimmedValue as TValue }
}

export const buildVehicleCreateInput = (
  clientId: string,
  draft: VehicleFormDraft,
): ParseResult<VehicleInput> => {
  const fuelTypeResult = parseVehicleEnumValue(draft.fuel_type, vehicleFuelTypeValueSet, 'Fuel type')
  if (!fuelTypeResult.ok) return fuelTypeResult

  const travelModeResult = parseVehicleEnumValue(draft.travel_mode, vehicleTravelModeValueSet, 'Travel mode')
  if (!travelModeResult.ok) return travelModeResult

  const statusResult = parseVehicleEnumValue(draft.status, vehicleStatusValueSet, 'Status')
  if (!statusResult.ok) return statusResult

  const capabilitiesResult = parseCapabilities(draft.capabilities_csv)
  if (!capabilitiesResult.ok) return capabilitiesResult

  const numericFields = {
    max_volume_load_cm3: zeroToNull(cubicMetersToCubicCentimeters(toNullableNumber(draft.max_volume_load_m3))),
    max_weight_load_g: zeroToNull(kilogramsToGrams(toNullableNumber(draft.max_weight_load_kg))),
    max_speed_kmh: zeroToNull(toNullableNumber(draft.max_speed_kmh)),
    cost_per_km: zeroToNull(toNullableNumber(draft.cost_per_km)),
    cost_per_hour: zeroToNull(toNullableNumber(draft.cost_per_hour)),
    travel_distance_limit_km: zeroToNull(toNullableNumber(draft.travel_distance_limit_km)),
    travel_duration_limit_minutes: zeroToNull(toNullableNumber(draft.travel_duration_limit_minutes)),
    home_facility_id: toNullableNumber(draft.home_facility_id),
    loading_time_per_stop_seconds: zeroToNull(minutesToSeconds(toNullableNumber(draft.loading_time_per_stop_minutes))),
    unloading_time_per_stop_seconds: zeroToNull(minutesToSeconds(toNullableNumber(draft.unloading_time_per_stop_minutes))),
    fixed_cost: zeroToNull(toNullableNumber(draft.fixed_cost)),
  }

  if (Object.values(numericFields).some(Number.isNaN)) {
    return { ok: false, error: 'Vehicle numeric fields must contain valid numbers.' }
  }

  return {
    ok: true,
    value: {
      client_id: clientId,
      registration_number: draft.registration_number.trim(),
      label: toOptionalString(draft.label),
      fuel_type: fuelTypeResult.value,
      travel_mode: travelModeResult.value,
      max_volume_load_cm3: numericFields.max_volume_load_cm3,
      max_weight_load_g: numericFields.max_weight_load_g,
      max_speed_kmh: numericFields.max_speed_kmh,
      cost_per_km: numericFields.cost_per_km,
      cost_per_hour: numericFields.cost_per_hour,
      travel_distance_limit_km: numericFields.travel_distance_limit_km,
      travel_duration_limit_minutes: numericFields.travel_duration_limit_minutes,
      home_facility_id: numericFields.home_facility_id,
      status: statusResult.value,
      is_active: draft.is_active,
      capabilities: capabilitiesResult.value,
      loading_time_per_stop_seconds: numericFields.loading_time_per_stop_seconds,
      unloading_time_per_stop_seconds: numericFields.unloading_time_per_stop_seconds,
      fixed_cost: numericFields.fixed_cost,
    },
  }
}

export const buildVehicleUpdateFields = (
  draft: Partial<VehicleFormDraft>,
): ParseResult<VehicleUpdateFields> => {
  const fields: VehicleUpdateFields = {}

  if ('registration_number' in draft && draft.registration_number !== undefined) {
    fields.registration_number = draft.registration_number.trim()
  }

  if ('label' in draft && draft.label !== undefined) {
    fields.label = toOptionalString(draft.label)
  }

  if ('fuel_type' in draft && draft.fuel_type !== undefined) {
    const result = parseVehicleEnumValue(draft.fuel_type, vehicleFuelTypeValueSet, 'Fuel type')
    if (!result.ok) return result
    fields.fuel_type = result.value
  }

  if ('travel_mode' in draft && draft.travel_mode !== undefined) {
    const result = parseVehicleEnumValue(draft.travel_mode, vehicleTravelModeValueSet, 'Travel mode')
    if (!result.ok) return result
    fields.travel_mode = result.value
  }

  if ('status' in draft && draft.status !== undefined) {
    const result = parseVehicleEnumValue(draft.status, vehicleStatusValueSet, 'Status')
    if (!result.ok) return result
    fields.status = result.value
  }

  if ('capabilities_csv' in draft && draft.capabilities_csv !== undefined) {
    const result = parseCapabilities(draft.capabilities_csv)
    if (!result.ok) return result
    fields.capabilities = result.value
  }

  const numericFieldMap: Array<[keyof VehicleUpdateFields, keyof VehicleFormDraft, string]> = [
    ['max_speed_kmh', 'max_speed_kmh', 'Max speed'],
    ['cost_per_km', 'cost_per_km', 'Cost per km'],
    ['cost_per_hour', 'cost_per_hour', 'Cost per hour'],
    ['travel_distance_limit_km', 'travel_distance_limit_km', 'Distance limit'],
    ['travel_duration_limit_minutes', 'travel_duration_limit_minutes', 'Duration limit'],
    ['home_facility_id', 'home_facility_id', 'Home facility'],
    ['fixed_cost', 'fixed_cost', 'Fixed cost'],
  ]

  if ('max_volume_load_m3' in draft && draft.max_volume_load_m3 !== undefined) {
    const numericValue = toNullableNumber(draft.max_volume_load_m3)
    if (Number.isNaN(numericValue)) {
      return { ok: false, error: 'Max volume must be a valid number.' }
    }
    fields.max_volume_load_cm3 = zeroToNull(cubicMetersToCubicCentimeters(numericValue))
  }

  if ('max_weight_load_kg' in draft && draft.max_weight_load_kg !== undefined) {
    const numericValue = toNullableNumber(draft.max_weight_load_kg)
    if (Number.isNaN(numericValue)) {
      return { ok: false, error: 'Max weight must be a valid number.' }
    }
    fields.max_weight_load_g = zeroToNull(kilogramsToGrams(numericValue))
  }

  if ('loading_time_per_stop_minutes' in draft && draft.loading_time_per_stop_minutes !== undefined) {
    const numericValue = toNullableNumber(draft.loading_time_per_stop_minutes)
    if (Number.isNaN(numericValue)) {
      return { ok: false, error: 'Loading time must be a valid number.' }
    }
    fields.loading_time_per_stop_seconds = zeroToNull(minutesToSeconds(numericValue))
  }

  if ('unloading_time_per_stop_minutes' in draft && draft.unloading_time_per_stop_minutes !== undefined) {
    const numericValue = toNullableNumber(draft.unloading_time_per_stop_minutes)
    if (Number.isNaN(numericValue)) {
      return { ok: false, error: 'Unloading time must be a valid number.' }
    }
    fields.unloading_time_per_stop_seconds = zeroToNull(minutesToSeconds(numericValue))
  }

  for (const [fieldKey, draftKey, label] of numericFieldMap) {
    if (draft[draftKey] === undefined) {
      continue
    }

    const numericValue = toNullableNumber(String(draft[draftKey] ?? ''))
    if (Number.isNaN(numericValue)) {
      return { ok: false, error: `${label} must be a valid number.` }
    }

    ;(fields as Record<string, unknown>)[fieldKey] = zeroToNull(numericValue)
  }

  if ('is_active' in draft && typeof draft.is_active === 'boolean') {
    fields.is_active = draft.is_active
  }

  return { ok: true, value: fields }
}
