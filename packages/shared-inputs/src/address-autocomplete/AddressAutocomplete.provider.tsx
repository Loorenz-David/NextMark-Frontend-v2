import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { address } from '@shared-domain/core/address'
import type { ComponentRestrictions } from '@shared-google-maps'
import { useGoogleAutoComplete } from './hooks/useGoogleAutoComplete'
import { useControllers } from './hooks/useController'
import { AddressAutocompleteContext } from './AddressAutocomplete.context'
import { recordSavedLocation } from './utils/savedLocationsStorage'

type AddressAutocompleteProviderProps = {
  children: ReactNode
  onSelectedAddress: (value: address | null) => void
  selectedAddress: address | null | undefined
  componentRestrictions?: ComponentRestrictions
  defaultToCurrentLocation?: boolean
  enableCurrentLocation?: boolean
  enableSavedLocations?: boolean
  intentKey?: string
  onInputValueChange?: (value: string) => void
  storageNamespace?: string
  onCurrentLocationLoadingChange?: (isLoading: boolean) => void
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
  onInputValueChange,
  storageNamespace,
  onCurrentLocationLoadingChange,
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
    onInputValueChange,
    storageNamespace,
    onCurrentLocationLoadingChange,
  })

  useEffect(() => {
    if (!defaultToCurrentLocation || initializedRef.current) return
    initializedRef.current = true

    googleAutoComplete
      .getCurrentLocationAddress(storageNamespace)
      .then((addressValue) => {
        onSelectedAddress(addressValue)
        if (enableSavedLocations && intentKey?.trim()) {
          recordSavedLocation(intentKey, addressValue, storageNamespace)
        }
      })
      .catch(() => {
        // Intentionally swallow init errors to keep field usable.
      })
  }, [defaultToCurrentLocation, enableSavedLocations, googleAutoComplete, intentKey, onSelectedAddress, storageNamespace])

  const value = {
    isLoading: controllers.isWaitingForPredictions || predictions.isLoading,
    suggestions: predictions.suggestions,
    enableCurrentLocation,
    enableSavedLocations,
    intentKey,
    storageNamespace,
    ...googleAutoComplete,
    ...controllers,
  }

  return (
    <AddressAutocompleteContext.Provider value={value}>
      {children}
    </AddressAutocompleteContext.Provider>
  )
}
