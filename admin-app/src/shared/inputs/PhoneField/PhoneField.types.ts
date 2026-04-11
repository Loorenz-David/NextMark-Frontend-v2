import type { ChangeEvent, CSSProperties, RefObject } from 'react'
import type { Phone } from '@/types/phone'
import type { PhonePrefixOption } from './phonePrefixes'

export type PhoneFieldProps = {
  phoneNumber: Phone 
  onChange: (value: Phone) => void
  containerClassName?: string
  containerStyle?: CSSProperties
}

export type PhoneFieldContextValue = {
  phoneNumber: Phone
  isOpen: boolean
  inputValue: string
  selectedPrefix: PhonePrefixOption | null
  filteredPrefixes: PhonePrefixOption[]
  inputRef: RefObject<HTMLInputElement | null>
  handleOpenChange: (isOpen: boolean) => void
  handleInputFocus: () => void
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleSelectPrefix: (prefixOption: PhonePrefixOption) => void
  handleNumberChange: (event: ChangeEvent<HTMLInputElement>) => void
}
