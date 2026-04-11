import type { address } from '@shared-domain/core/address'
import { CURRENT_LOCATION_COORD_TOLERANCE } from '../constants/location.constants'
import { getStoredCurrentLocation } from './currentLocationStorage'

const normalize = (value: number): number => Number(value.toFixed(6))

export function isAddressCurrentLocation(addr: address, storageNamespace?: string): boolean {
  const stored = getStoredCurrentLocation(storageNamespace)
  if (!stored) return false

  const latDiff = Math.abs(normalize(addr.coordinates.lat) - normalize(stored.coordinates.lat))
  const lngDiff = Math.abs(normalize(addr.coordinates.lng) - normalize(stored.coordinates.lng))

  return latDiff < CURRENT_LOCATION_COORD_TOLERANCE && lngDiff < CURRENT_LOCATION_COORD_TOLERANCE
}
