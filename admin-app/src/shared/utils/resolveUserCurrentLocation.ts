import type { address } from '@/types/address'
import { reverseGeocodeQuery } from '@shared-google-maps'
import { getBrowserCurrentCoordinates } from './browserGeolocation'
import {
  getStoredCurrentLocation,
  saveCurrentLocation,
} from '@/shared/inputs/address-autocomplete/utils/currentLocationStorage'
import { CURRENT_LOCATION_COORD_TOLERANCE } from '@/shared/inputs/address-autocomplete/constants/location.constants'

export const resolveUserCurrentLocation = async (): Promise<address | null> => {
  try {
    const { lat, lng } = await getBrowserCurrentCoordinates()

    const stored = getStoredCurrentLocation()
    if (stored) {
      const latDiff = Math.abs(lat - stored.coordinates.lat)
      const lngDiff = Math.abs(lng - stored.coordinates.lng)
      if (latDiff < CURRENT_LOCATION_COORD_TOLERANCE && lngDiff < CURRENT_LOCATION_COORD_TOLERANCE) {
        return stored
      }
    }

    const payload = await reverseGeocodeQuery(lat, lng)
    const resolved: address = {
      street_address: payload.raw_address,
      city: payload.city,
      postal_code: payload.postal_code,
      country: payload.country,
      coordinates: payload.coordinates,
    }
    saveCurrentLocation(resolved)
    return resolved
  } catch {
    return null
  }
}
