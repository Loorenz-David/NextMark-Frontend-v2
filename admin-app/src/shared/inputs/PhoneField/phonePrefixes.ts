import { phonePrefixOptions } from '@/constants/dropDownOptions'

export type PhonePrefixOption = {
  value: string
  display: string
  countryName: string
  countryCode: string
}

export const phonePrefixes: PhonePrefixOption[] = phonePrefixOptions

export const getFlagEmoji = (countryCode: string): string => {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
}
