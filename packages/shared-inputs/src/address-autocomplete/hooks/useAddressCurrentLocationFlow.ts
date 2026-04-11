import { useCallback, useRef } from 'react'

import { reverseGeocodeQuery } from '@shared-google-maps'
import type { address } from '@shared-domain/core/address'
import { saveCurrentLocation } from '../utils/currentLocationStorage'
import { getStoredCurrentLocation } from '../utils/currentLocationStorage'
import { CURRENT_LOCATION_COORD_TOLERANCE } from '../constants/location.constants'

const mapGeolocationError = (error: GeolocationPositionError) => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return new Error('Geolocation permission denied')
    case error.POSITION_UNAVAILABLE:
      return new Error('Geolocation position unavailable')
    case error.TIMEOUT:
      return new Error('Geolocation timeout')
    default:
      return new Error(error.message || 'Geolocation failed')
  }
}

export const useAddressCurrentLocationFlow = () => {
  const pendingPromiseRef = useRef<Promise<address> | null>(null)

  const getCurrentLocationAddress = useCallback(async (storageNamespace?: string): Promise<address> => {
    if (pendingPromiseRef.current) {
      return pendingPromiseRef.current
    }

    const pending = new Promise<address>((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = position.coords.latitude
            const lng = position.coords.longitude
            const stored = getStoredCurrentLocation(storageNamespace)

            if (stored) {
              const latDiff = Math.abs(lat - stored.coordinates.lat)
              const lngDiff = Math.abs(lng - stored.coordinates.lng)
              if (latDiff < CURRENT_LOCATION_COORD_TOLERANCE && lngDiff < CURRENT_LOCATION_COORD_TOLERANCE) {
                resolve(stored)
                return
              }
            }

            const payload = await reverseGeocodeQuery(lat, lng)
            const address: address = {
              street_address: payload.raw_address,
              city: payload.city,
              postal_code: payload.postal_code,
              country: payload.country,
              coordinates: payload.coordinates,
            }
            saveCurrentLocation(address, storageNamespace)
            resolve(address)
          } catch (error) {
            reject(error)
          }
        },
        (error) => {
          reject(mapGeolocationError(error))
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
      )
    }).finally(() => {
      pendingPromiseRef.current = null
    })

    pendingPromiseRef.current = pending
    return pending
  }, [])

  return {
    getCurrentLocationAddress,
  }
}
