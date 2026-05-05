export const DEFAULT_PREFIX = '+46'
export const PHONE_PREFIX_STORAGE_KEY = 'defaultPhonePrefix'
export const PHONE_PREFIX_INDEX_STORAGE_KEY = 'defaultPhonePrefixIndex'

export const phonePrefixOptions: Array<{
  value: string
  display: string
  countryName: string
  countryCode: string
}> = [
  {
    value: '+93',
    display: '+93',
    countryName: 'Afghanistan',
    countryCode: 'AF',
  },
  {
    value: '+355',
    display: '+355',
    countryName: 'Albania',
    countryCode: 'AL',
  },
  {
    value: '+213',
    display: '+213',
    countryName: 'Algeria',
    countryCode: 'DZ',
  },
  {
    value: '+376',
    display: '+376',
    countryName: 'Andorra',
    countryCode: 'AD',
  },
  {
    value: '+244',
    display: '+244',
    countryName: 'Angola',
    countryCode: 'AO',
  },
  {
    value: '+61',
    display: '+61',
    countryName: 'Australia',
    countryCode: 'AU',
  },
  {
    value: '+43',
    display: '+43',
    countryName: 'Austria',
    countryCode: 'AT',
  },
  {
    value: '+994',
    display: '+994',
    countryName: 'Azerbaijan',
    countryCode: 'AZ',
  },
  {
    value: '+32',
    display: '+32',
    countryName: 'Belgium',
    countryCode: 'BE',
  },
  {
    value: '+55',
    display: '+55',
    countryName: 'Brazil',
    countryCode: 'BR',
  },
  {
    value: '+86',
    display: '+86',
    countryName: 'China',
    countryCode: 'CN',
  },
  {
    value: '+33',
    display: '+33',
    countryName: 'France',
    countryCode: 'FR',
  },
  {
    value: '+49',
    display: '+49',
    countryName: 'Germany',
    countryCode: 'DE',
  },
  {
    value: '+39',
    display: '+39',
    countryName: 'Italy',
    countryCode: 'IT',
  },
  {
    value: '+46',
    display: '+46',
    countryName: 'Sweden',
    countryCode: 'SE',
  },
  {
    value: '+41',
    display: '+41',
    countryName: 'Switzerland',
    countryCode: 'CH',
  },
  {
    value: '+44',
    display: '+44',
    countryName: 'United Kingdom',
    countryCode: 'GB',
  },
  {
    value: '+1',
    display: '+1',
    countryName: 'United States',
    countryCode: 'US',
  },
]

export const getRememberedPhonePrefix = (): string => {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFIX
  }

  try {
    const stored = window.localStorage.getItem(PHONE_PREFIX_STORAGE_KEY)
    if (!stored) {
      return DEFAULT_PREFIX
    }

    const exists = phonePrefixOptions.some((option) => option.value === stored)
    return exists ? stored : DEFAULT_PREFIX
  } catch {
    return DEFAULT_PREFIX
  }
}
