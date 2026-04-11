import type { address } from '@/types/address'

import {
  facilityTypeValueSet,
  operatingDayValueSet,
  operatingDayOptions,
} from '../../domain/infrastructureEnums'
import type { FacilityInput, FacilityOperatingHour, FacilityUpdateFields } from '../types/facility'

export type FacilityFormDraft = {
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

type ParseResult<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; error: string }

const HH_MM_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/
const SECONDS_PER_MINUTE = 60
const DEFAULT_OPERATING_OPEN_TIME = '09:00'
const DEFAULT_OPERATING_CLOSE_TIME = '17:00'

export type FacilityOperatingHoursEditorEntry = {
  day: FacilityOperatingHour['day']
  open: string
  close: string
}

export const minutesToSeconds = (value: number | null | undefined) =>
  value === null || value === undefined ? null : Math.round(value * SECONDS_PER_MINUTE)

export const secondsToMinutes = (value: number | null | undefined) =>
  value === null || value === undefined ? null : Math.round((value / SECONDS_PER_MINUTE) * 100) / 100

export const facilityOperatingHoursDayOptions = operatingDayOptions.map((option) => ({
  key: option.value,
  label: option.label,
}))

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

const parseOperatingHours = (value: string): ParseResult<FacilityOperatingHour[] | null> => {
  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return { ok: true, value: null }
  }

  try {
    const parsedValue = JSON.parse(trimmedValue)
    if (!Array.isArray(parsedValue)) {
      return { ok: false, error: 'Operating hours must be a JSON array.' }
    }

    const seenDays = new Set<string>()
    const hours = parsedValue.map((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        throw new Error(`Operating hours row ${index + 1} must be an object.`)
      }

      const day = String((entry as Record<string, unknown>).day ?? '').trim()
      const open = String((entry as Record<string, unknown>).open ?? '').trim()
      const close = String((entry as Record<string, unknown>).close ?? '').trim()

      if (!operatingDayValueSet.has(day as FacilityOperatingHour['day'])) {
        throw new Error(`Operating hours row ${index + 1} uses an invalid day value.`)
      }

      if (seenDays.has(day)) {
        throw new Error(`Operating hours contains duplicate day "${day}".`)
      }

      if (!HH_MM_PATTERN.test(open) || !HH_MM_PATTERN.test(close)) {
        throw new Error(`Operating hours row ${index + 1} must use HH:MM values.`)
      }

      if (open >= close) {
        throw new Error(`Operating hours row ${index + 1} must close after it opens.`)
      }

      seenDays.add(day)

      return { day, open, close } as FacilityOperatingHour
    })

    return { ok: true, value: hours }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unable to parse operating hours.',
    }
  }
}

export const normalizeFacilityOperatingHoursForEditor = (
  value: string,
): FacilityOperatingHoursEditorEntry[] => {
  const parsed = parseOperatingHours(value)
  if (!parsed.ok || !parsed.value) {
    return []
  }

  return parsed.value.map((entry) => ({
    day: entry.day,
    open: entry.open,
    close: entry.close,
  }))
}

export const serializeFacilityOperatingHoursEditor = (
  entries: FacilityOperatingHoursEditorEntry[],
) => {
  if (!entries.length) {
    return ''
  }

  const normalizedEntries = [...entries]
    .filter((entry) => operatingDayValueSet.has(entry.day))
    .sort(
      (left, right) =>
        facilityOperatingHoursDayOptions.findIndex((option) => option.key === left.day) -
        facilityOperatingHoursDayOptions.findIndex((option) => option.key === right.day),
    )
    .map((entry) => ({
      day: entry.day,
      open: entry.open || DEFAULT_OPERATING_OPEN_TIME,
      close: entry.close || DEFAULT_OPERATING_CLOSE_TIME,
    }))

  return JSON.stringify(normalizedEntries, null, 2)
}

export const toggleFacilityOperatingHoursDay = ({
  entries,
  day,
}: {
  entries: FacilityOperatingHoursEditorEntry[]
  day: FacilityOperatingHour['day']
}) => {
  const existing = entries.find((entry) => entry.day === day)
  if (existing) {
    return entries.filter((entry) => entry.day !== day)
  }

  return [...entries, { day, open: DEFAULT_OPERATING_OPEN_TIME, close: DEFAULT_OPERATING_CLOSE_TIME }]
}

export const setFacilityOperatingHoursOpenTime = ({
  entries,
  day,
  value,
}: {
  entries: FacilityOperatingHoursEditorEntry[]
  day: FacilityOperatingHour['day']
  value: string | null
}) =>
  entries.map((entry) =>
    entry.day === day ? { ...entry, open: value ?? DEFAULT_OPERATING_OPEN_TIME } : entry,
  )

export const setFacilityOperatingHoursCloseTime = ({
  entries,
  day,
  value,
}: {
  entries: FacilityOperatingHoursEditorEntry[]
  day: FacilityOperatingHour['day']
  value: string | null
}) =>
  entries.map((entry) =>
    entry.day === day ? { ...entry, close: value ?? DEFAULT_OPERATING_CLOSE_TIME } : entry,
  )

const parseExternalRefs = (value: string): ParseResult<Record<string, unknown> | null> => {
  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return { ok: true, value: null }
  }

  try {
    const parsedValue = JSON.parse(trimmedValue)
    if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
      return { ok: false, error: 'External refs must be a JSON object.' }
    }

    return { ok: true, value: parsedValue as Record<string, unknown> }
  } catch {
    return { ok: false, error: 'External refs must be valid JSON.' }
  }
}

const validateFacilityType = (value: string): ParseResult<FacilityInput['facility_type']> => {
  const trimmedValue = value.trim()
  if (!facilityTypeValueSet.has(trimmedValue as FacilityInput['facility_type'])) {
    return { ok: false, error: 'Facility type must match the backend enum values.' }
  }

  return { ok: true, value: trimmedValue as FacilityInput['facility_type'] }
}

export const buildFacilityCreateInput = (
  clientId: string,
  draft: FacilityFormDraft,
): ParseResult<FacilityInput> => {
  const facilityTypeResult = validateFacilityType(draft.facility_type)
  if (!facilityTypeResult.ok) {
    return facilityTypeResult
  }

  const operatingHoursResult = parseOperatingHours(draft.operating_hours_json)
  if (!operatingHoursResult.ok) {
    return operatingHoursResult
  }

  const externalRefsResult = parseExternalRefs(draft.external_refs_json)
  if (!externalRefsResult.ok) {
    return externalRefsResult
  }

  const defaultLoadingTimeSeconds = minutesToSeconds(toNullableNumber(draft.default_loading_time_minutes))
  const defaultUnloadingTimeSeconds = minutesToSeconds(toNullableNumber(draft.default_unloading_time_minutes))
  const maxOrdersPerDay = toNullableNumber(draft.max_orders_per_day)

  if ([defaultLoadingTimeSeconds, defaultUnloadingTimeSeconds, maxOrdersPerDay].some(Number.isNaN)) {
    return { ok: false, error: 'Facility numeric fields must contain valid numbers.' }
  }

  return {
    ok: true,
    value: {
      client_id: clientId,
      name: draft.name.trim(),
      facility_type: facilityTypeResult.value,
      property_location: draft.property_location ?? null,
      can_dispatch: draft.can_dispatch,
      can_receive_returns: draft.can_receive_returns,
      operating_hours: operatingHoursResult.value,
      default_loading_time_seconds: defaultLoadingTimeSeconds,
      default_unloading_time_seconds: defaultUnloadingTimeSeconds,
      max_orders_per_day: maxOrdersPerDay,
      external_refs: externalRefsResult.value,
    },
  }
}

export const buildFacilityUpdateFields = (
  draft: Partial<FacilityFormDraft>,
): ParseResult<FacilityUpdateFields> => {
  const fields: FacilityUpdateFields = {}

  if ('name' in draft && draft.name !== undefined) {
    fields.name = draft.name.trim()
  }

  if ('facility_type' in draft && draft.facility_type !== undefined) {
    const facilityTypeResult = validateFacilityType(draft.facility_type)
    if (!facilityTypeResult.ok) {
      return facilityTypeResult
    }
    fields.facility_type = facilityTypeResult.value
  }

  if ('property_location' in draft) {
    fields.property_location = draft.property_location ?? null
  }

  if ('can_dispatch' in draft && typeof draft.can_dispatch === 'boolean') {
    fields.can_dispatch = draft.can_dispatch
  }

  if ('can_receive_returns' in draft && typeof draft.can_receive_returns === 'boolean') {
    fields.can_receive_returns = draft.can_receive_returns
  }

  if ('operating_hours_json' in draft && draft.operating_hours_json !== undefined) {
    const operatingHoursResult = parseOperatingHours(draft.operating_hours_json)
    if (!operatingHoursResult.ok) {
      return operatingHoursResult
    }
    fields.operating_hours = operatingHoursResult.value
  }

  if ('default_loading_time_minutes' in draft && draft.default_loading_time_minutes !== undefined) {
    const numericValue = toNullableNumber(draft.default_loading_time_minutes)
    if (Number.isNaN(numericValue)) {
      return { ok: false, error: 'Default loading time must be a valid number.' }
    }
    fields.default_loading_time_seconds = minutesToSeconds(numericValue)
  }

  if ('default_unloading_time_minutes' in draft && draft.default_unloading_time_minutes !== undefined) {
    const numericValue = toNullableNumber(draft.default_unloading_time_minutes)
    if (Number.isNaN(numericValue)) {
      return { ok: false, error: 'Default unloading time must be a valid number.' }
    }
    fields.default_unloading_time_seconds = minutesToSeconds(numericValue)
  }

  if ('max_orders_per_day' in draft && draft.max_orders_per_day !== undefined) {
    const numericValue = toNullableNumber(draft.max_orders_per_day)
    if (Number.isNaN(numericValue)) {
      return { ok: false, error: 'Max orders per day must be a valid number.' }
    }
    fields.max_orders_per_day = numericValue
  }

  if ('external_refs_json' in draft && draft.external_refs_json !== undefined) {
    const externalRefsResult = parseExternalRefs(draft.external_refs_json)
    if (!externalRefsResult.ok) {
      return externalRefsResult
    }
    fields.external_refs = externalRefsResult.value
  }

  return { ok: true, value: fields }
}
