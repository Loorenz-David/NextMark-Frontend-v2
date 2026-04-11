import type { CSSProperties } from 'react'
import { CurrentLocationIconSrc } from '@/assets/icons'
import { FloatingPopover }  from '@/shared/popups/FloatingPopover/FloatingPopover'
import { InputField } from '@/shared/inputs/InputField'

import {  SuggestionsSelector } from './SuggestionSelector'
import { useAddressAutocompleteContext } from './AddressAutocomplete.context'
import { isAddressCurrentLocation } from './utils/isAddressCurrentLocation'
import { CURRENT_LOCATION_INPUT_LABEL } from './constants/location.constants'


type AddressAutocompleteLayoutProps = {
    fieldClassName?: string
    inputClassName?: string
    containerClassName?:string
    inputStyle?: CSSProperties
    placeholder?: string
}

export const AddressAutocompleteLayout = ({
    fieldClassName,
    inputClassName,
    containerClassName,
    inputStyle,
    placeholder,
}: AddressAutocompleteLayoutProps) => {

    const { isOpen,
         handleToogle,
         handleInputChange,
         inputValue,
         selectedAddress,
         handleBeginManualEntryFromCurrentLocation,
    } = useAddressAutocompleteContext()

    const isCurrentLocationMode = Boolean(selectedAddress && isAddressCurrentLocation(selectedAddress))
    const displayedValue = isCurrentLocationMode ? CURRENT_LOCATION_INPUT_LABEL : inputValue

    return ( 
        <FloatingPopover
            open={ isOpen }
            onOpenChange={ ()=> handleToogle({value: false}) }
            classes={'relative'}
            matchReferenceWidth={ true }
            removeFlip={ true }
            reference={
                <div className={`relative flex items-center ${containerClassName}`}>
                    {isCurrentLocationMode ? (
                      <span className="pointer-events-none text-[var(--color-primary)]">
                        <img
                          alt="Current location"
                          className="h-4 w-4"
                          src={CurrentLocationIconSrc}
                        />
                      </span>
                    ) : null}
                    <InputField
                        onChange={ handleInputChange }
                        onFocus={ ()=> {
                          if (isCurrentLocationMode) {
                            handleBeginManualEntryFromCurrentLocation()
                          }
                          handleToogle({ value: true })
                        } }
                        fieldClassName={fieldClassName}
                        inputClassName={inputClassName}
                        style={inputStyle}
                        value={displayedValue}
                        placeholder={placeholder}
                    />
                </div>
            }
        >
            <div className="admin-glass-popover rounded-2xl p-2 shadow-xl">
                <SuggestionsSelector />
            </div>
        </FloatingPopover>
    );
}
