import type { Coordinates } from '@/shared/map'

export const browserLocationService = {
  getCurrentCoordinates(): Promise<Coordinates> {
    if (!navigator.geolocation) {
      return Promise.reject(new Error('Geolocation is not available in this browser.'))
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          reject(new Error(error.message || 'Unable to resolve current location.'))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        },
      )
    })
  },

  watchCoordinates(
    onSuccess: (coords: Coordinates) => void,
    onError?: (error: Error) => void,
  ): () => void {
    if (!navigator.geolocation) {
      onError?.(new Error('Geolocation is not available in this browser.'))
      return () => undefined
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        onSuccess({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        onError?.(new Error(error.message || 'Unable to watch current location.'))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000,
      },
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  },
}
