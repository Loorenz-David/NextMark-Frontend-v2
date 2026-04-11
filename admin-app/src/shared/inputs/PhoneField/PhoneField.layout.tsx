import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'
import { InputField } from '@/shared/inputs/InputField'
import { BoldArrowIcon } from '@/assets/icons'
import { usePhoneFieldContext } from './PhoneField.context'
import { PhonePrefixList } from './PhonePrefixList'
import { getFlagEmoji } from './phonePrefixes'
import type { CSSProperties } from 'react'

type PhoneFieldLayoutProps = {
  containerClassName?: string
  containerStyle?: CSSProperties
}

export const PhoneFieldLayout = ({
  containerClassName,
  containerStyle,
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

  const rootClassName = ['flex w-full items-center gap-2 ', containerClassName]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClassName} style={containerStyle}>
      <div className="flex ">
        <FloatingPopover
          open={isOpen}
          onOpenChange={handleOpenChange}
          classes="relative"
          crossOffSetNum={-20}
          offSetNum={15}
          reference={
            <div className="flex justify-between " onClick={handleInputFocus}
              style={{width:'80px'}}
            >
              <div className="flex items-center pr-1 text-base" aria-hidden>
                {selectedPrefix ? getFlagEmoji(selectedPrefix.countryCode) : ''}
              </div>
              <InputField
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder="+1"
                inputRef={inputRef}
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
                <BoldArrowIcon
                  className={`h-3 w-3 ${
                    isOpen ? 'rotate-270' : 'rotate-90'
                  }`}
                />
              </div>
            </div>
          }
        >
          <div className="admin-glass-popover rounded-2xl p-2 shadow-xl"
            style={{width:'120px'}}
          >
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
