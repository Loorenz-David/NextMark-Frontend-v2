import type { address } from '@/types/address'
import { CURRENT_LOCATION_STORAGE_KEY } from '../constants/location.constants'

const isBrowser = typeof window !== 'undefined'

const isValidAddress = (value: unknown): value is address => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  if (typeof candidate.street_address !== 'string') return false
  if (!candidate.coordinates || typeof candidate.coordinates !== 'object') return false
  const coordinates = candidate.coordinates as Record<string, unknown>
  return (
    typeof coordinates.lat === 'number' &&
    Number.isFinite(coordinates.lat) &&
    typeof coordinates.lng === 'number' &&
    Number.isFinite(coordinates.lng)
  )
}

export function clearStoredCurrentLocation(): void {
  if (!isBrowser) return
  try {
    window.localStorage.removeItem(CURRENT_LOCATION_STORAGE_KEY)
  } catch {
    // Ignore storage remove failures.
  }
}

export function saveCurrentLocation(value: address): void {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(CURRENT_LOCATION_STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Ignore storage write failures.
  }
}

export function getStoredCurrentLocation(): address | null {
  if (!isBrowser) return null
  try {
    const raw = window.localStorage.getItem(CURRENT_LOCATION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!isValidAddress(parsed)) {
      clearStoredCurrentLocation()
      return null
    }
    return parsed
  } catch {
    clearStoredCurrentLocation()
    return null
  }
}
