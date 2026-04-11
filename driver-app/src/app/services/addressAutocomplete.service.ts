import type { address } from '@shared-domain'
import {
  createGooglePlacesServiceAccess,
  getPlaceDetailsQuery,
  getPlacePredictionsQuery,
} from '@shared-google-maps'
import type { PlaceSuggestion } from '@shared-google-maps'

const placesAccess = createGooglePlacesServiceAccess()

function mapAddressPayloadToAddress(payload: Awaited<ReturnType<typeof getPlaceDetailsQuery>>): address {
  return {
    street_address: payload.raw_address,
    city: payload.city,
    country: payload.country,
    postal_code: payload.postal_code,
    coordinates: payload.coordinates,
  }
}

export const addressAutocompleteService = {
  async getSuggestions(query: string): Promise<PlaceSuggestion[]> {
    const result = await getPlacePredictionsQuery(placesAccess, { input: query })
    return result.suggestions
  },

  async resolveAddress(placeId: string): Promise<address> {
    const payload = await getPlaceDetailsQuery(placesAccess, placeId)
    return mapAddressPayloadToAddress(payload)
  },
}
