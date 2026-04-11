import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type{ address } from '@/types/address'
import type { ComponentRestrictions } from '@shared-google-maps'
import { useGoogleAutoComplete } from './hooks/useGoogleAutoComplete'
import { useControllers } from './hooks/useController'
import { AddressAutocompleteContext } from './AddressAutocomplete.context'
import { recordSavedLocation } from './utils/savedLocationsStorage'

type AddressAutocompleteProviderProps = {
  children: ReactNode
  onSelectedAddress: (value: address | null ) => void
  selectedAddress: address | null | undefined
  componentRestrictions?: ComponentRestrictions
  defaultToCurrentLocation?: boolean
  enableCurrentLocation?: boolean
  enableSavedLocations?: boolean
  intentKey?: string
}

export const AddressAutocompleteProvider = ({
  children,
  componentRestrictions,
  onSelectedAddress,
  selectedAddress,
  defaultToCurrentLocation = false,
  enableCurrentLocation = false,
  enableSavedLocations = false,
  intentKey,
}: AddressAutocompleteProviderProps) => {
  const initializedRef = useRef(false)

  const googleAutoComplete = useGoogleAutoComplete({ componentRestrictions })
  const predictions = googleAutoComplete.predictions
  const controllers = useControllers({
    fetchPredictions: googleAutoComplete.fetchPredictions,
    resetPredictions: googleAutoComplete.resetPredictions,
    getPlaceDetails: googleAutoComplete.getPlaceDetails,
    getCurrentLocationAddress: googleAutoComplete.getCurrentLocationAddress,
    onSelectedAddress: onSelectedAddress,
    selectedAddress: selectedAddress,
    enableSavedLocations,
    intentKey,
  })

  useEffect(() => {
    if (!defaultToCurrentLocation || initializedRef.current) return
    initializedRef.current = true

    googleAutoComplete
      .getCurrentLocationAddress()
      .then((addressValue) => {
        onSelectedAddress(addressValue)
        if (enableSavedLocations && intentKey?.trim()) {
          recordSavedLocation(intentKey, addressValue)
        }
      })
      .catch(() => {
        // Intentionally swallow init errors to keep field usable.
      })
  }, [defaultToCurrentLocation, enableSavedLocations, googleAutoComplete, intentKey, onSelectedAddress])

  const value = {
    isLoading: predictions.isLoading,
    suggestions: predictions.suggestions,
    enableCurrentLocation,
    enableSavedLocations,
    intentKey,
    ...googleAutoComplete,
    ...controllers,
  }

  return (
    <AddressAutocompleteContext.Provider value={value}>
      {children}
    </AddressAutocompleteContext.Provider>
  )
}
