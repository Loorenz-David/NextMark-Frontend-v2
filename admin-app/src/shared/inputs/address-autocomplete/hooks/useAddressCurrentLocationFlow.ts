import { useCallback, useRef } from 'react'

import { reverseGeocodeQuery } from '@shared-google-maps'
import type { address } from '@/types/address'
import {
  getBrowserCurrentCoordinates,
  mapBrowserGeolocationError,
} from '@/shared/utils/browserGeolocation'
import { saveCurrentLocation } from '../utils/currentLocationStorage'
import { getStoredCurrentLocation } from '../utils/currentLocationStorage'
import { CURRENT_LOCATION_COORD_TOLERANCE } from '../constants/location.constants'

export const useAddressCurrentLocationFlow = () => {
  const pendingPromiseRef = useRef<Promise<address> | null>(null)

  const getCurrentLocationAddress = useCallback(async (): Promise<address> => {
    if (pendingPromiseRef.current) {
      return pendingPromiseRef.current
    }

    const pending = new Promise<address>((resolve, reject) => {
      getBrowserCurrentCoordinates()
        .then(async ({ lat, lng }) => {
          try {
            const stored = getStoredCurrentLocation()

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
            saveCurrentLocation(address)
            resolve(address)
          } catch (error) {
            reject(error)
          }
        })
        .catch((error) => {
          reject(mapBrowserGeolocationError(error))
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
