import { createContext, useContext } from 'react'

import type { useGoogleAutoComplete } from './hooks/useGoogleAutoComplete'
import type { useControllers } from './hooks/useController'

import type { PlaceSuggestion  } from './types'

export type AddressAutocompleteContextValue =
  & ReturnType<typeof useGoogleAutoComplete>
  & ReturnType<typeof useControllers>
  & {
    isLoading: boolean
    suggestions: PlaceSuggestion []
    enableCurrentLocation: boolean
    enableSavedLocations: boolean
    intentKey?: string
  }

export const AddressAutocompleteContext = createContext<AddressAutocompleteContextValue | null>(null)

export const useAddressAutocompleteContext = () => {
  const ctx = useContext(AddressAutocompleteContext)
  if (!ctx) {
    throw new Error('AddressAutocomplete context is missing. Wrap with AddressAutocompleteProvider.')
  }
  return ctx
}
