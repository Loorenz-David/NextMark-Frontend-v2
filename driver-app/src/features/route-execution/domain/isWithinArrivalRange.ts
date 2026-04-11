import type { Coordinates } from '@/shared/map'
import { calculateDistanceMeters } from './calculateDistanceMeters'

export function isWithinArrivalRange(
  currentLocation: Coordinates,
  stopLocation: Coordinates,
  rangeMeters: number,
) {
  return calculateDistanceMeters(currentLocation, stopLocation) <= rangeMeters
}
