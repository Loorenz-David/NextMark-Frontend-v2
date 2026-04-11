import type { address } from '@/types/address'

const GEOLOCATION_TIMEOUT_MS = 5_000

export const resolveUserCurrentLocation = (): Promise<address | null> => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          street_address: 'Current Location',
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        })
      },
      () => resolve(null),
      {
        timeout: GEOLOCATION_TIMEOUT_MS,
        enableHighAccuracy: false,
      },
    )
  })
}
