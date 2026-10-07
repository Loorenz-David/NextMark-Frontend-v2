import { AddressAutocompleteProvider } from './AddressAutocomplete.provider'
import { AddressAutocompleteLayout } from './AddressAutocomplete.layout'
import type { CSSProperties } from 'react'
import type { address } from '@shared-domain/core/address'
import type { ComponentRestrictions } from '@shared-google-maps'
import {
  DEFAULT_ADDRESS_AUTOCOMPLETE_LABELS,
  type AddressAutocompleteLabels,
} from './constants/labels.constants'

type PropsAddressAutocomplete = {
  onSelectedAddress: (value: address | null) => void
  selectedAddress: address | null | undefined
  componentRestrictions?: ComponentRestrictions
  defaultToCurrentLocation?: boolean
  enableCurrentLocation?: boolean
  enableSavedLocations?: boolean
  intentKey?: string
  fieldClassName?: string
  inputClassName?: string
  containerClassName?: string
  inputStyle?: CSSProperties
  placeholder?: string
  onInputValueChange?: (value: string) => void
  renderInPortal?: boolean
  popoverClassName?: string
  currentLocationIconClassName?: string
  embedCurrentLocationIcon?: boolean
  storageNamespace?: string
  onCurrentLocationLoadingChange?: (isLoading: boolean) => void
  labels?: Partial<AddressAutocompleteLabels>
}

export const AddressAutocomplete = ({
  onSelectedAddress,
  selectedAddress,
  componentRestrictions,
  defaultToCurrentLocation = false,
  enableCurrentLocation = false,
  enableSavedLocations = false,
  intentKey,
  fieldClassName,
  inputClassName,
  containerClassName,
  inputStyle,
  placeholder = 'Search address...',
  onInputValueChange,
  renderInPortal,
  popoverClassName,
  currentLocationIconClassName,
  embedCurrentLocationIcon,
  storageNamespace,
  onCurrentLocationLoadingChange,
  labels,
}: PropsAddressAutocomplete) => {
  const resolvedLabels = { ...DEFAULT_ADDRESS_AUTOCOMPLETE_LABELS, ...labels }

  return (
    <AddressAutocompleteProvider
      onSelectedAddress={onSelectedAddress}
      selectedAddress={selectedAddress}
      componentRestrictions={componentRestrictions}
      defaultToCurrentLocation={defaultToCurrentLocation}
      enableCurrentLocation={enableCurrentLocation}
      enableSavedLocations={enableSavedLocations}
      intentKey={intentKey}
      onInputValueChange={onInputValueChange}
      storageNamespace={storageNamespace}
      onCurrentLocationLoadingChange={onCurrentLocationLoadingChange}
      labels={resolvedLabels}
    >
      <AddressAutocompleteLayout
        fieldClassName={fieldClassName}
        inputClassName={inputClassName}
        containerClassName={containerClassName}
        inputStyle={inputStyle}
        placeholder={placeholder}
        renderInPortal={renderInPortal}
        popoverClassName={popoverClassName}
        currentLocationIconClassName={currentLocationIconClassName}
        embedCurrentLocationIcon={embedCurrentLocationIcon}
      />
    </AddressAutocompleteProvider>
  )
}
