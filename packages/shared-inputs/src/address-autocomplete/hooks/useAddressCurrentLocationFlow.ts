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

const getBrowserPosition = (
  options: PositionOptions,
): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

const resolveCurrentPosition = async (): Promise<GeolocationPosition> => {
  try {
    return await getBrowserPosition({
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    })
  } catch (error) {
    if (!(error instanceof GeolocationPositionError)) {
      throw error
    }

    if (
      error.code !== error.POSITION_UNAVAILABLE &&
      error.code !== error.TIMEOUT
    ) {
      throw error
    }

    // CoreLocation can transiently fail on the first high-accuracy request.
    // Retry once with a less strict request before surfacing the failure.
    return getBrowserPosition({
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000,
    })
  }
}

export const useAddressCurrentLocationFlow = () => {
  const pendingPromiseRef = useRef<Promise<address> | null>(null)

  const getCurrentLocationAddress = useCallback(async (storageNamespace?: string): Promise<address> => {
    if (pendingPromiseRef.current) {
      return pendingPromiseRef.current
    }

    const pending = new Promise<address>((resolve, reject) => {
      resolveCurrentPosition()
        .then(async (position) => {
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
        })
        .catch((error) => {
          if (error instanceof GeolocationPositionError) {
            reject(mapGeolocationError(error))
            return
          }

          reject(error instanceof Error ? error : new Error('Geolocation failed'))
        })
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
