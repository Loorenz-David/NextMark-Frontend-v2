import type { Coordinates } from '@/shared/map'

const EARTH_RADIUS_METERS = 6371000

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

export function calculateDistanceMeters(from: Coordinates, to: Coordinates) {
  const deltaLat = toRadians(to.lat - from.lat)
  const deltaLng = toRadians(to.lng - from.lng)
  const fromLat = toRadians(from.lat)
  const toLat = toRadians(to.lat)

  const a = (
    Math.sin(deltaLat / 2) ** 2
    + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) ** 2
  )

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_METERS * c
}
