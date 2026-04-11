import React from 'react'
import type { CSSProperties } from 'react'
import { FloatingPopover } from '../floating-popover/FloatingPopover'
import { InputField } from '../input-field/InputField'
import { BoldArrowIcon } from '../icons/BoldArrowIcon'
import { usePhoneFieldContext } from './PhoneField.context'
import { PhonePrefixList } from './PhonePrefixList'
import { getFlagEmoji } from './phonePrefixes'
type PhoneFieldLayoutProps = {
  containerClassName?: string
  containerStyle?: CSSProperties
  prefixPopoverClassName?: string
}

export const PhoneFieldLayout = ({
  containerClassName,
  containerStyle,
  prefixPopoverClassName,
}: PhoneFieldLayoutProps) => {
  const {
    isOpen,
    inputValue,
    phoneNumber,
    selectedPrefix,
    inputRef,
    handleOpenChange,
    handleInputFocus,
    handleInputChange,
    handleNumberChange,
  } = usePhoneFieldContext()

  const rootClassName = ['flex w-full items-center gap-2', containerClassName]
    .filter(Boolean)
    .join(' ')
  const popoverClassName = [
    'rounded-2xl border border-white/10 bg-[#172122]/88 p-2 shadow-xl backdrop-blur-xl',
    prefixPopoverClassName,
  ].filter(Boolean).join(' ')

  return (
    <div className={rootClassName} style={containerStyle}>
      <div className="flex">
        <FloatingPopover
          open={isOpen}
          onOpenChange={handleOpenChange}
          classes="relative"
          crossOffSetNum={-20}
          offSetNum={15}
          reference={
            <div className="flex justify-between" onClick={handleInputFocus} style={{ width: '80px' }}>
              <div className="flex items-center pr-1 text-base" aria-hidden>
                {selectedPrefix ? getFlagEmoji(selectedPrefix.countryCode) : ''}
              </div>
              <InputField
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder="+1"
                inputRef={inputRef as React.Ref<HTMLInputElement>}
                fieldClassName="w-[100px]"
              />
              <div
                className="flex items-center content-center pr-2"
                onClick={() => {
                  requestAnimationFrame(() => {
                    handleOpenChange(!isOpen)
                  })
                }}
              >
                <BoldArrowIcon className={`h-3 w-3 ${isOpen ? 'rotate-270' : 'rotate-90'}`} />
              </div>
            </div>
          }
        >
          <div className={popoverClassName} style={{ width: '120px' }}>
            <PhonePrefixList />
          </div>
        </FloatingPopover>
      </div>

      <InputField
        type="tel"
        value={phoneNumber.number}
        onChange={handleNumberChange}
        placeholder="Phone number"
        fieldClassName="flex-3"
      />
    </div>
  )
}
