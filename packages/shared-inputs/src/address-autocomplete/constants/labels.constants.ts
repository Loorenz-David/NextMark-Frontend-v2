import { CURRENT_LOCATION_SUGGESTION } from './currentLocationSuggestion'
import { CURRENT_LOCATION_INPUT_LABEL } from './location.constants'

/**
 * The field's own wording. A surface that serves another language passes its
 * own through the `labels` prop; anything it leaves out keeps these.
 */
export type AddressAutocompleteLabels = {
  /** Shown in the input once the device's location has been chosen. */
  currentLocation: string
  /** The suggestion row that resolves the device's location. */
  useCurrentLocation: string
  searching: string
  noMatches: string
}

export const DEFAULT_ADDRESS_AUTOCOMPLETE_LABELS: AddressAutocompleteLabels = {
  currentLocation: CURRENT_LOCATION_INPUT_LABEL,
  useCurrentLocation: CURRENT_LOCATION_SUGGESTION.label,
  searching: 'Searching…',
  noMatches: 'No matches. Try refining your search.',
}
