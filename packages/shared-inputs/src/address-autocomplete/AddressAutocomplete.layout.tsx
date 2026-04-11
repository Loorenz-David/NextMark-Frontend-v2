import type { CSSProperties } from 'react'
import { CurrentLocationIcon } from '@shared-icons'
import { FloatingPopover } from '../floating-popover/FloatingPopover'
import { InputField } from '../input-field/InputField'

import { SuggestionsSelector } from './SuggestionSelector'
import { useAddressAutocompleteContext } from './AddressAutocomplete.context'
import { isAddressCurrentLocation } from './utils/isAddressCurrentLocation'
import { CURRENT_LOCATION_INPUT_LABEL } from './constants/location.constants'

type AddressAutocompleteLayoutProps = {
  fieldClassName?: string
  inputClassName?: string
  containerClassName?: string
  inputStyle?: CSSProperties
  placeholder?: string
  renderInPortal?: boolean
  popoverClassName?: string
  currentLocationIconClassName?: string
  embedCurrentLocationIcon?: boolean
}

export const AddressAutocompleteLayout = ({
  fieldClassName,
  inputClassName,
  containerClassName,
  inputStyle,
  placeholder,
  renderInPortal,
  popoverClassName,
  currentLocationIconClassName,
  embedCurrentLocationIcon,
}: AddressAutocompleteLayoutProps) => {
  const {
    isOpen,
    handleToogle,
    handleInputChange,
    inputValue,
    selectedAddress,
    handleBeginManualEntryFromCurrentLocation,
    storageNamespace,
  } = useAddressAutocompleteContext()

  const isCurrentLocationMode = Boolean(selectedAddress && isAddressCurrentLocation(selectedAddress, storageNamespace))
  const displayedValue = isCurrentLocationMode ? CURRENT_LOCATION_INPUT_LABEL : inputValue
  const resolvedInputClassName = [
    inputClassName ?? 'custom-input',
    isCurrentLocationMode && embedCurrentLocationIcon ? 'pl-10' : null,
  ].filter(Boolean).join(' ')

  return (
    <FloatingPopover
      open={isOpen}
      onOpenChange={() => handleToogle({ value: false })}
      classes={'relative'}
      matchReferenceWidth={true}
      removeFlip={true}
      renderInPortal={renderInPortal}
      strategy={renderInPortal ? 'fixed' : 'absolute'}
      floatingClassName={popoverClassName}
      reference={
        <div className={`relative flex items-center ${containerClassName ?? ''}`}>
          {isCurrentLocationMode && !embedCurrentLocationIcon ? (
            <span className={`pointer-events-none ${currentLocationIconClassName ?? 'text-[var(--color-primary)]'}`}>
              <CurrentLocationIcon className="h-4 w-4" />
            </span>
          ) : null}
          {isCurrentLocationMode && embedCurrentLocationIcon ? (
            <span className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 ${currentLocationIconClassName ?? 'text-[var(--color-primary)]'}`}>
              <CurrentLocationIcon className="h-4 w-4" />
            </span>
          ) : null}
          <InputField
            onChange={handleInputChange}
            onFocus={() => {
              if (isCurrentLocationMode) handleBeginManualEntryFromCurrentLocation()
              handleToogle({ value: true })
            }}
            fieldClassName={fieldClassName}
            inputClassName={resolvedInputClassName}
            style={inputStyle}
            value={displayedValue}
            placeholder={placeholder}
          />
        </div>
      }
    >
      <div className="address-ac-dropdown bg-[var(--color-page)] border border-[var(--color-border-accent)] rounded-lg shadow-lg p-2">
        <SuggestionsSelector currentLocationIconClassName={currentLocationIconClassName} />
      </div>
    </FloatingPopover>
  )
}
