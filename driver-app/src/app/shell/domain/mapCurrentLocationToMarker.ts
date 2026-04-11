import type { Coordinates, MapMarker } from '@/shared/map'

export function mapCurrentLocationToMarker(coordinates: Coordinates): MapMarker {
  return {
    id: 'driver-current-location',
    coordinates,
    markerColor: '#2563eb',
    interactionVariant: 'current-location',
    className: 'driver-current-location-marker',
  }
}
