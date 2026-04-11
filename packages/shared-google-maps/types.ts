export type PlacesServiceStatus =
  | 'OK'
  | 'ZERO_RESULTS'
  | 'INVALID_REQUEST'
  | 'OVER_QUERY_LIMIT'
  | 'REQUEST_DENIED'
  | 'UNKNOWN_ERROR'

export interface StructuredFormatting {
  main_text?: string
  secondary_text?: string
}

export interface AutocompletePrediction {
  description: string
  place_id: string
  structured_formatting?: StructuredFormatting
}

export interface PlaceSuggestion {
  description: string
  placeId: string
  mainText?: string
  secondaryText?: string
}

export interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

export interface PlaceResult {
  formatted_address?: string
  address_components?: AddressComponent[]
  geometry?: {
    location?: {
      lat(): number
      lng(): number
    }
  }
}

export type AddressPayload = {
  raw_address: string
  country?: string
  city?: string
  postal_code?: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface ComponentRestrictions {
  country?: string | string[]
}

export type AutocompleteSessionToken = {
  readonly __tokenBrand?: unique symbol
}

export interface AutocompleteService {
  getPlacePredictions(
    request: {
      input: string
      sessionToken?: AutocompleteSessionToken
      componentRestrictions?: ComponentRestrictions
    },
    callback: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void,
  ): void
}

export interface PlacesService {
  getDetails(
    request: { placeId: string; fields?: string[]; sessionToken?: AutocompleteSessionToken },
    callback: (result: PlaceResult | null, status: PlacesServiceStatus) => void,
  ): void
}

export interface PlaceAddressComponent {
  longText?: string
  shortText?: string
  types?: string[]
}

export interface LatLngLike {
  lat(): number
  lng(): number
}

export interface LatLngLiteralLike {
  lat: number
  lng: number
}

export type PlaceLocation = LatLngLike | LatLngLiteralLike | null | undefined

export interface PlaceFetchFieldsOptions {
  fields: string[]
}

export interface PlaceInstance {
  formattedAddress?: string
  addressComponents?: PlaceAddressComponent[]
  location?: PlaceLocation
  fetchFields(options: PlaceFetchFieldsOptions): Promise<void>
}

export interface PlaceConstructor {
  new (options: { id: string; requestedLanguage?: string; requestedRegion?: string }): PlaceInstance
}

export interface GoogleMapsPlacesLibrary {
  AutocompleteService: new () => AutocompleteService
  PlacesService: new (element: Element) => PlacesService
  AutocompleteSessionToken: new () => AutocompleteSessionToken
  Place?: PlaceConstructor
}

export type PlacesLibraryImport = GoogleMapsPlacesLibrary

export type ImportLibraryName = 'core' | 'maps' | 'marker' | 'places' | 'drawing'

export type ImportLibraryFn = (name: ImportLibraryName) => Promise<any>

export interface GoogleMapsClient {
  maps: {
    Map?: unknown
    Polyline?: unknown
    LatLngBounds?: unknown
    Geocoder?: new () => {
      geocode: (request: { location: { lat: number; lng: number } }) => Promise<{
        results?: Array<{
          formatted_address?: string
          address_components?: Array<{ long_name: string; types: string[] }>
        }>
      }>
    }
    marker?: {
      AdvancedMarkerElement?: unknown
    }
    places: GoogleMapsPlacesLibrary
    importLibrary?: ImportLibraryFn
  }
}

export type EnsureGooglePlacesServicesResult = {
  sessionToken: AutocompleteSessionToken | null
  autocompleteService: AutocompleteService | null
  placeCtor: PlaceConstructor | null
  placesService: PlacesService | null
  library: GoogleMapsPlacesLibrary | null
}

export type GooglePlacesServiceAccess = {
  ensureServices: () => Promise<EnsureGooglePlacesServicesResult>
  resetSessionToken: () => void
}

declare global {
  interface Window {
    google?: GoogleMapsClient
  }
}
