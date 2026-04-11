import { loadGoogleMaps } from './loadGoogleMaps'
import type { AddressPayload } from './types'

const getAddressComponent = (
  components: Array<{ long_name: string; types: string[] }> | undefined,
  types: string[],
): string | undefined => {
  const component = components?.find((item) => types.some((type) => item.types.includes(type)))
  return component?.long_name
}

let geocoder:
  | {
      geocode: (request: { location: { lat: number; lng: number } }) => Promise<{
        results?: Array<{
          formatted_address?: string
          address_components?: Array<{ long_name: string; types: string[] }>
        }>
      }>
    }
  | null = null

export async function reverseGeocodeQuery(lat: number, lng: number): Promise<AddressPayload> {
  const googleMaps = await loadGoogleMaps()

  if (!geocoder) {
    if (!googleMaps.maps.Geocoder) {
      throw new Error('Reverse geocoder unavailable')
    }

    geocoder = new googleMaps.maps.Geocoder()
  }

  const result = await geocoder.geocode({
    location: { lat, lng },
  })

  const first = result.results?.[0]
  if (!first) {
    throw new Error('Reverse geocode failed')
  }

  return {
    raw_address: first.formatted_address ?? '',
    city: getAddressComponent(first.address_components, [
      'locality',
      'administrative_area_level_2',
      'administrative_area_level_1',
    ]),
    postal_code: getAddressComponent(first.address_components, ['postal_code']),
    country: getAddressComponent(first.address_components, ['country']),
    coordinates: { lat, lng },
  }
}
