import type {
  AddressPayload,
  EnsureGooglePlacesServicesResult,
  LatLngLike,
  LatLngLiteralLike,
  PlaceInstance,
  PlaceLocation,
} from './types'

type GetPlaceDetailsDependencies = {
  ensureServices: () => Promise<EnsureGooglePlacesServicesResult>
  resetSessionToken?: () => void
}

export async function getPlaceDetailsQuery(
  dependencies: GetPlaceDetailsDependencies,
  placeId: string,
): Promise<AddressPayload> {
  const { placeCtor, placesService, sessionToken } = await dependencies.ensureServices()

  if (placeCtor) {
    const place = new placeCtor({ id: placeId })
    await place.fetchFields({
      fields: ['formattedAddress', 'addressComponents', 'location'],
    })

    const location = place.location
    if (!location) {
      throw new Error('Failed to fetch place details.')
    }

    dependencies.resetSessionToken?.()
    return mapPlaceInstanceToAddressPayload(place, location)
  }

  if (!placesService) {
    throw new Error('Places service is unavailable in this environment.')
  }

  return new Promise<AddressPayload>((resolve, reject) => {
    placesService.getDetails(
      {
        placeId,
        sessionToken: sessionToken ?? undefined,
        fields: ['formatted_address', 'geometry.location', 'address_components'],
      },
      (result, status) => {
        if (status !== 'OK' || !result?.geometry?.location) {
          reject(new Error('Failed to fetch place details.'))
          return
        }

        const getAddressComponent = (types: string[]) =>
          result.address_components?.find((component) => types.some((type) => component.types.includes(type)))
            ?.long_name

        dependencies.resetSessionToken?.()

        resolve({
          raw_address: result.formatted_address ?? '',
          country: getAddressComponent(['country']),
          city: getAddressComponent(['locality', 'administrative_area_level_2', 'administrative_area_level_1']),
          postal_code: getAddressComponent(['postal_code']),
          coordinates: {
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
          },
        })
      },
    )
  })
}

function mapPlaceInstanceToAddressPayload(place: PlaceInstance, location: PlaceLocation): AddressPayload {
  const coordinates = extractCoordinates(location)
  if (!coordinates) {
    throw new Error('Missing coordinates for place result.')
  }

  const getComponent = (types: string[]) => {
    const component = place.addressComponents?.find((item) => {
      if (!item.types?.length) {
        return false
      }

      return types.some((type) => item.types?.includes(type))
    })

    return component?.longText ?? component?.shortText
  }

  return {
    raw_address: place.formattedAddress ?? '',
    country: getComponent(['country']),
    city: getComponent(['locality', 'administrative_area_level_2', 'administrative_area_level_1']),
    postal_code: getComponent(['postal_code']),
    coordinates,
  }
}

function extractCoordinates(location: PlaceLocation) {
  if (!location) {
    return null
  }

  if (isLatLngLiteral(location)) {
    return { lat: location.lat, lng: location.lng }
  }

  if (isLatLng(location)) {
    return { lat: location.lat(), lng: location.lng() }
  }

  return null
}

function isLatLngLiteral(location: PlaceLocation): location is LatLngLiteralLike {
  return Boolean(location && typeof (location as LatLngLiteralLike).lat === 'number')
}

function isLatLng(location: PlaceLocation): location is LatLngLike {
  return Boolean(location && typeof (location as LatLngLike).lat === 'function')
}
