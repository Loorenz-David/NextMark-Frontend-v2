import { sessionStorage } from '@/features/auth/login/store/sessionStorage'
import type { ServiceTime } from '@/features/plan/routeGroup/types/serviceTime'
import type { address } from '@/types/address'

export type RouteEndStrategy = 'round_trip' | 'custom_end_address' | 'end_at_last_stop'

export type RouteGroupEditFormPreferences = {
  set_start_time: string | null
  set_end_time: string | null
  eta_tolerance_minutes: number
  eta_message_tolerance_minutes: number
  route_end_strategy: RouteEndStrategy
  start_location: address | null
  end_location: address | null
  driver_id: number | null
  vehicle_id: number | null
  stops_service_time: ServiceTime | null
}

const STORAGE_NAMESPACE = 'plan.routeGroup.editForm.preferences.v1'
const GLOBAL_SCOPE = 'global'

const DEFAULT_PREFERENCES: RouteGroupEditFormPreferences = {
  set_start_time: null,
  set_end_time: null,
  eta_tolerance_minutes: 0,
  eta_message_tolerance_minutes: 0,
  route_end_strategy: 'round_trip',
  start_location: null,
  end_location: null,
  driver_id: null,
  vehicle_id: null,
  stops_service_time: null,
}

const isBrowser = typeof window !== 'undefined'

const resolveTeamScope = (): string => {
  const teamId = sessionStorage.getSession()?.user?.teamId
  if (teamId === null || teamId === undefined) return GLOBAL_SCOPE
  const normalized = String(teamId).trim()
  return normalized ? normalized : GLOBAL_SCOPE
}

const resolveStorageKey = (): string => `${STORAGE_NAMESPACE}.team:${resolveTeamScope()}`

const normalizeTimeValue = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const match = value.trim().match(/^(\d{2}):(\d{2})(?::\d{2})?$/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null
  }

  return `${match[1]}:${match[2]}`
}

const normalizeStrategy = (value: unknown): RouteEndStrategy => {
  if (value === 'custom_end_address') return 'custom_end_address'
  if (value === 'end_at_last_stop') return 'end_at_last_stop'
  return 'round_trip'
}

const isValidAddress = (value: unknown): value is address => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  if (typeof candidate.street_address !== 'string' || !candidate.street_address.trim()) {
    return false
  }
  if (!candidate.coordinates || typeof candidate.coordinates !== 'object') return false
  const coordinates = candidate.coordinates as Record<string, unknown>
  return (
    typeof coordinates.lat === 'number' &&
    Number.isFinite(coordinates.lat) &&
    typeof coordinates.lng === 'number' &&
    Number.isFinite(coordinates.lng)
  )
}

const normalizeDriverId = (value: unknown): number | null => {
  if (typeof value !== 'number') return null
  if (!Number.isInteger(value)) return null
  return value > 0 ? value : null
}

const normalizeVehicleId = (value: unknown): number | null => {
  if (typeof value !== 'number') return null
  if (!Number.isInteger(value)) return null
  return value > 0 ? value : null
}

const normalizeEtaToleranceMinutes = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isInteger(value)) return 0
  return Math.max(0, Math.min(120, value))
}

const normalizeServiceTime = (value: unknown): ServiceTime | null => {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Record<string, unknown>
  const rawTime = candidate.time
  const rawPerItem = candidate.per_item
  if (typeof rawTime !== 'number' || !Number.isInteger(rawTime) || rawTime < 0) return null
  if (typeof rawPerItem !== 'number' || !Number.isInteger(rawPerItem) || rawPerItem < 0) return null
  return {
    time: rawTime,
    per_item: rawPerItem,
  }
}

const sanitizePreferences = (raw: unknown): RouteGroupEditFormPreferences => {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_PREFERENCES
  }

  const candidate = raw as Record<string, unknown>

  return {
    set_start_time: normalizeTimeValue(candidate.set_start_time),
    set_end_time: normalizeTimeValue(candidate.set_end_time),
    eta_tolerance_minutes: normalizeEtaToleranceMinutes(candidate.eta_tolerance_minutes),
    eta_message_tolerance_minutes: normalizeEtaToleranceMinutes(
      candidate.eta_message_tolerance_minutes,
    ),
    route_end_strategy: normalizeStrategy(candidate.route_end_strategy),
    start_location: isValidAddress(candidate.start_location) ? candidate.start_location : null,
    end_location: isValidAddress(candidate.end_location) ? candidate.end_location : null,
    driver_id: normalizeDriverId(candidate.driver_id),
    vehicle_id: normalizeVehicleId(candidate.vehicle_id),
    stops_service_time: normalizeServiceTime(candidate.stops_service_time),
  }
}

const readStoredPreferences = (): RouteGroupEditFormPreferences => {
  if (!isBrowser) return DEFAULT_PREFERENCES

  const key = resolveStorageKey()
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return DEFAULT_PREFERENCES
    return sanitizePreferences(JSON.parse(raw))
  } catch {
    window.localStorage.removeItem(key)
    return DEFAULT_PREFERENCES
  }
}

const writeStoredPreferences = (next: RouteGroupEditFormPreferences): void => {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(resolveStorageKey(), JSON.stringify(next))
  } catch {
    // Ignore storage write errors to keep form interactions responsive.
  }
}

const persistPreferences = (patch: Partial<RouteGroupEditFormPreferences>): void => {
  const current = readStoredPreferences()
  writeStoredPreferences({
    ...current,
    ...patch,
  })
}

export const loadRouteGroupEditFormPreferences = (): RouteGroupEditFormPreferences => {
  return readStoredPreferences()
}

export const saveStartTimePreference = (value: string | null): void => {
  persistPreferences({
    set_start_time: normalizeTimeValue(value),
  })
}

export const saveEndTimePreference = (value: string | null): void => {
  persistPreferences({
    set_end_time: normalizeTimeValue(value),
  })
}

export const saveEtaToleranceMinutesPreference = (value: number): void => {
  persistPreferences({
    eta_tolerance_minutes: normalizeEtaToleranceMinutes(value),
  })
}

export const saveEtaMessageToleranceMinutesPreference = (value: number): void => {
  persistPreferences({
    eta_message_tolerance_minutes: normalizeEtaToleranceMinutes(value),
  })
}

export const saveRouteEndStrategyPreference = (value: RouteEndStrategy): void => {
  persistPreferences({
    route_end_strategy: normalizeStrategy(value),
  })
}

export const saveStartLocationPreference = (value: address | null): void => {
  persistPreferences({
    start_location: isValidAddress(value) ? value : null,
  })
}

export const saveEndLocationPreference = (value: address | null): void => {
  persistPreferences({
    end_location: isValidAddress(value) ? value : null,
  })
}

export const saveDriverIdPreference = (value: number | null): void => {
  persistPreferences({
    driver_id: normalizeDriverId(value),
  })
}

export const saveVehicleIdPreference = (value: number | null): void => {
  persistPreferences({
    vehicle_id: normalizeVehicleId(value),
  })
}

export const clearInvalidRouteGroupEditFormPreferences = (): void => {
  if (!isBrowser) return
  try {
    window.localStorage.removeItem(resolveStorageKey())
  } catch {
    // Ignore storage removal errors.
  }
}

export const saveStopsServiceTimePreference = (value: ServiceTime | null): void => {
  persistPreferences({
    stops_service_time: normalizeServiceTime(value),
  })
}
