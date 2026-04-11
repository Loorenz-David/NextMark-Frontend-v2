import { useRef, useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'

import type { address } from '@shared-domain/core/address'
import type { PlaceSuggestion } from '../types'
import { recordSavedLocation } from '../utils/savedLocationsStorage'
import { CURRENT_LOCATION_INPUT_LABEL } from '../constants/location.constants'
import { isAddressCurrentLocation } from '../utils/isAddressCurrentLocation'

type PropsuseController = {
  resetPredictions: () => void
  fetchPredictions: (value: string) => void
  getPlaceDetails: (value: string) => Promise<address>
  getCurrentLocationAddress: (storageNamespace?: string) => Promise<address>
  onSelectedAddress: (value: address | null) => void
  selectedAddress: address | null | undefined
  enableSavedLocations?: boolean
  intentKey?: string
  onInputValueChange?: (value: string) => void
  storageNamespace?: string
  onCurrentLocationLoadingChange?: (isLoading: boolean) => void
}

export const useControllers = ({
  resetPredictions,
  fetchPredictions,
  getPlaceDetails,
  getCurrentLocationAddress,
  onSelectedAddress,
  selectedAddress,
  enableSavedLocations = false,
  intentKey,
  onInputValueChange,
  storageNamespace,
  onCurrentLocationLoadingChange,
}: PropsuseController) => {
  const debounceMs = 500
  const debounceTimeoutRef = useRef<number | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isWaitingForPredictions, setIsWaitingForPredictions] = useState(false)
  const [isResolvingCurrentLocation, setIsResolvingCurrentLocation] = useState(false)
  const [savedLocationsRevision, setSavedLocationsRevision] = useState(0)

  const maybeRecordSavedLocation = (value: address) => {
    if (!enableSavedLocations || !intentKey?.trim()) return
    recordSavedLocation(intentKey, value, storageNamespace)
    setSavedLocationsRevision((prev) => prev + 1)
  }

  const onQuery = (value: string) => {
    if (debounceTimeoutRef.current !== null) {
      window.clearTimeout(debounceTimeoutRef.current)
    }

    if (!value.trim()) {
      setIsWaitingForPredictions(false)
      resetPredictions()
      return
    }

    setIsWaitingForPredictions(true)

    debounceTimeoutRef.current = window.setTimeout(() => {
      setIsWaitingForPredictions(false)
      fetchPredictions(value)
      if (selectedAddress) {
        onSelectedAddress(null)
      }
    }, debounceMs)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, query = true) => {
    const value = event.target.value

    setInputValue(value)
    onInputValueChange?.(value)
    if (selectedAddress) {
      onSelectedAddress(null)
    }

    if (query) {
      onQuery(value)
    }
  }

  async function handleSelectionAddress(suggestion: PlaceSuggestion) {
    const addressDetails = await getPlaceDetails(suggestion.placeId)
    setInputValue(addressDetails.street_address)
    onInputValueChange?.(addressDetails.street_address)
    onSelectedAddress(addressDetails)
    maybeRecordSavedLocation(addressDetails)
  }

  async function handleUseCurrentLocation() {
    onCurrentLocationLoadingChange?.(true)
    setIsResolvingCurrentLocation(true)
    try {
      requestAnimationFrame(() => {
        (document.activeElement as HTMLElement | null)?.blur()
      })
      handleToogle({ value: false })
      const addressDetails = await getCurrentLocationAddress(storageNamespace)
      setInputValue(CURRENT_LOCATION_INPUT_LABEL)
      onInputValueChange?.(CURRENT_LOCATION_INPUT_LABEL)
      onSelectedAddress(addressDetails)
      maybeRecordSavedLocation(addressDetails)
    } catch {
      // Keep input usable when geolocation/reverse-geocode fails.
    } finally {
      onCurrentLocationLoadingChange?.(false)
      setIsResolvingCurrentLocation(false)
    }
  }

  const handleBeginManualEntryFromCurrentLocation = () => {
    if (!selectedAddress || !isAddressCurrentLocation(selectedAddress, storageNamespace)) return
    setInputValue('')
    onInputValueChange?.('')
    onSelectedAddress(null)
    resetPredictions()
  }

  const handleSelectSavedLocation = (value: address) => {
    setInputValue(value.street_address)
    onInputValueChange?.(value.street_address)
    onSelectedAddress(value)
    maybeRecordSavedLocation(value)
    handleToogle({ value: false })
  }

  const handleToogle = ({ value = null }: { value?: boolean | null }) => {
    if (!selectedAddress) {
      setInputValue('')
      resetPredictions()
    }

    if (typeof value === 'boolean') {
      setIsOpen(value)
      return
    }

    setIsOpen((prev) => !prev)
  }

  useEffect(() => {
    if (selectedAddress) {
      const firstLoadAddress = isAddressCurrentLocation(selectedAddress, storageNamespace)
        ? CURRENT_LOCATION_INPUT_LABEL
        : selectedAddress?.street_address ?? selectedAddress?.city ?? selectedAddress?.country

      setInputValue(firstLoadAddress ?? '')
    }

    return () => {
      if (debounceTimeoutRef.current !== null) {
        window.clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [selectedAddress, storageNamespace])

  return {
    inputValue,
    handleInputChange,
    handleSelectionAddress,
    handleUseCurrentLocation,
    handleSelectSavedLocation,
    handleBeginManualEntryFromCurrentLocation,
    onQuery,
    handleToogle,
    isOpen,
    isWaitingForPredictions,
    isResolvingCurrentLocation,
    savedLocationsRevision,
    selectedAddress,
    onSelectedAddress,
  }
}
