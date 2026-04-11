export type AutocompletePrediction = {
  description: string
  place_id: string
  structured_formatting?: {
    main_text?: string
    secondary_text?: string
  }
}

export type ComponentRestrictions = {
  country?: string | string[]
}

export type PlaceResult = {
  formatted_address?: string
  address_components?: Array<{ long_name: string; short_name: string; types: string[] }>
  geometry?: {
    location?: {
      lat: () => number
      lng: () => number
    }
  }
}

export type PlacesServiceStatus =
  | 'OK'
  | 'ZERO_RESULTS'
  | 'INVALID_REQUEST'
  | 'OVER_QUERY_LIMIT'
  | 'REQUEST_DENIED'
  | 'UNKNOWN_ERROR'
  | 'idle'

export type PlaceSuggestion = {
  description: string
  placeId: string
  mainText?: string
  secondaryText?: string
}

export type PredictionsState = {
  suggestions: PlaceSuggestion[]
  status: PlacesServiceStatus
  isLoading: boolean
  error?: string
}

export type PlaceAddressComponent = {
  longText?: string
  shortText?: string
  types?: string[]
}

export type LatLngLiteralLike = {
  lat: number
  lng: number
}

export type LatLngLike = {
  lat: () => number
  lng: () => number
}

export type PlaceLocation = LatLngLiteralLike | LatLngLike | null | undefined

export type PlaceInstance = {
  formattedAddress?: string
  addressComponents?: PlaceAddressComponent[]
  location?: PlaceLocation
  fetchFields: (args: { fields: string[] }) => Promise<void>
}
