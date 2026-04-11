import type { address } from '@shared-domain/core/address'
import type { SavedLocation } from '../types'
import {
  CURRENT_LOCATION_COORD_TOLERANCE,
  SAVED_LOCATIONS_MAX,
  SAVED_LOCATIONS_WRITE_THROTTLE_MS,
  resolveSavedLocationsStorageKey,
} from '../constants/location.constants'

type SavedLocationsMap = Record<string, SavedLocation[]>

const isBrowser = typeof window !== 'undefined'

const normalize = (value: number): number => Number(value.toFixed(6))

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

const isValidSavedLocation = (value: unknown): value is SavedLocation => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    isValidAddress(candidate.address) &&
    typeof candidate.usageCount === 'number' &&
    Number.isFinite(candidate.usageCount) &&
    typeof candidate.lastUsedAt === 'number' &&
    Number.isFinite(candidate.lastUsedAt)
  )
}

const makeAddressId = (value: address): string =>
  `${normalize(value.coordinates.lat).toFixed(6)},${normalize(value.coordinates.lng).toFixed(6)}`

const readStore = (storageNamespace?: string): SavedLocationsMap => {
  if (!isBrowser) return {}
  try {
    const raw = window.localStorage.getItem(resolveSavedLocationsStorageKey(storageNamespace))
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    const next: SavedLocationsMap = {}
    for (const [intent, locations] of Object.entries(parsed as Record<string, unknown>)) {
      if (!Array.isArray(locations)) continue
      next[intent] = locations.filter(isValidSavedLocation)
    }
    return next
  } catch {
    return {}
  }
}

const writeStore = (value: SavedLocationsMap, storageNamespace?: string): void => {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(resolveSavedLocationsStorageKey(storageNamespace), JSON.stringify(value))
  } catch {
    // Ignore storage write failures.
  }
}

const areSameAddress = (left: address, right: address): boolean => {
  const latDiff = Math.abs(normalize(left.coordinates.lat) - normalize(right.coordinates.lat))
  const lngDiff = Math.abs(normalize(left.coordinates.lng) - normalize(right.coordinates.lng))
  return latDiff < CURRENT_LOCATION_COORD_TOLERANCE && lngDiff < CURRENT_LOCATION_COORD_TOLERANCE
}

export const getSavedLocations = (intentKey: string, storageNamespace?: string): SavedLocation[] => {
  if (!intentKey.trim()) return []
  const map = readStore(storageNamespace)
  return map[intentKey] ?? []
}

export const clearSavedLocations = (intentKey: string, storageNamespace?: string): void => {
  if (!intentKey.trim()) return
  const map = readStore(storageNamespace)
  if (!(intentKey in map)) return
  delete map[intentKey]
  writeStore(map, storageNamespace)
}

export const recordSavedLocation = (intentKey: string, value: address, storageNamespace?: string): void => {
  if (!intentKey.trim()) return

  const now = Date.now()
  const map = readStore(storageNamespace)
  const current = map[intentKey] ?? []

  const existingIndex = current.findIndex((item) => areSameAddress(item.address, value))
  if (existingIndex >= 0) {
    const existing = current[existingIndex]
    if (now - existing.lastUsedAt < SAVED_LOCATIONS_WRITE_THROTTLE_MS) {
      return
    }

    current[existingIndex] = {
      ...existing,
      id: makeAddressId(value),
      address: value,
      usageCount: existing.usageCount + 1,
      lastUsedAt: now,
      label: value.street_address,
    }
  } else {
    current.push({
      id: makeAddressId(value),
      label: value.street_address,
      address: value,
      usageCount: 1,
      lastUsedAt: now,
    })
  }

  current.sort((left, right) => {
    if (right.usageCount !== left.usageCount) {
      return right.usageCount - left.usageCount
    }
    return right.lastUsedAt - left.lastUsedAt
  })

  map[intentKey] = current.slice(0, SAVED_LOCATIONS_MAX)
  writeStore(map, storageNamespace)
}
