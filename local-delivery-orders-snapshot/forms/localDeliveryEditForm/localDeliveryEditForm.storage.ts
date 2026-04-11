import { sessionStorage } from '@/features/auth/login/store/sessionStorage'
import type { ServiceTime } from '@/features/local-delivery-orders/types/serviceTime'
import type { address } from '@/types/address'

export type RouteEndStrategy = 'round_trip' | 'custom_end_address' | 'end_at_last_stop'

export type LocalDeliveryEditFormPreferences = {
  set_start_time: string | null
  set_end_time: string | null
  eta_tolerance_minutes: number
  route_end_strategy: RouteEndStrategy
  start_location: address | null
  end_location: address | null
  driver_id: number | null
  vehicle_id: number | null
  stops_service_time: ServiceTime | null
}

const STORAGE_NAMESPACE = 'plan.localDelivery.editForm.preferences.v1'
const GLOBAL_SCOPE = 'global'

const DEFAULT_PREFERENCES: LocalDeliveryEditFormPreferences = {
  set_start_time: null,
  set_end_time: null,
  eta_tolerance_minutes: 0,
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

const isValidTime = (value: unknown): value is string => {
  if (typeof value !== 'string') return false
  const match = value.match(/^(\d{2}):(\d{2})$/)
  if (!match) return false
  const hours = Number(match[1])
  const minutes = Number(match[2])
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
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

const sanitizePreferences = (raw: unknown): LocalDeliveryEditFormPreferences => {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_PREFERENCES
  }

  const candidate = raw as Record<string, unknown>

  return {
    set_start_time: isValidTime(candidate.set_start_time) ? candidate.set_start_time : null,
    set_end_time: isValidTime(candidate.set_end_time) ? candidate.set_end_time : null,
    eta_tolerance_minutes: normalizeEtaToleranceMinutes(candidate.eta_tolerance_minutes),
    route_end_strategy: normalizeStrategy(candidate.route_end_strategy),
    start_location: isValidAddress(candidate.start_location) ? candidate.start_location : null,
    end_location: isValidAddress(candidate.end_location) ? candidate.end_location : null,
    driver_id: normalizeDriverId(candidate.driver_id),
    vehicle_id: normalizeVehicleId(candidate.vehicle_id),
    stops_service_time: normalizeServiceTime(candidate.stops_service_time),
  }
}

const readStoredPreferences = (): LocalDeliveryEditFormPreferences => {
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

const writeStoredPreferences = (next: LocalDeliveryEditFormPreferences): void => {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(resolveStorageKey(), JSON.stringify(next))
  } catch {
    // Ignore storage write errors to keep form interactions responsive.
  }
}

const persistPreferences = (patch: Partial<LocalDeliveryEditFormPreferences>): void => {
  const current = readStoredPreferences()
  writeStoredPreferences({
    ...current,
    ...patch,
  })
}

export const loadLocalDeliveryEditFormPreferences = (): LocalDeliveryEditFormPreferences => {
  return readStoredPreferences()
}

export const saveStartTimePreference = (value: string | null): void => {
  persistPreferences({
    set_start_time: isValidTime(value) ? value : null,
  })
}

export const saveEndTimePreference = (value: string | null): void => {
  persistPreferences({
    set_end_time: isValidTime(value) ? value : null,
  })
}

export const saveEtaToleranceMinutesPreference = (value: number): void => {
  persistPreferences({
    eta_tolerance_minutes: normalizeEtaToleranceMinutes(value),
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

export const clearInvalidLocalDeliveryEditFormPreferences = (): void => {
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
