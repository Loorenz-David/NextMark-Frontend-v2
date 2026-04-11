import { createContext, useContext } from 'react'

import type { PhoneFieldContextValue } from './PhoneField.types'

export const PhoneFieldContext = createContext<PhoneFieldContextValue | null>(null)

export const usePhoneFieldContext = () => {
  const ctx = useContext(PhoneFieldContext)
  if (!ctx) {
    throw new Error('PhoneField context is missing. Wrap with PhoneFieldProvider.')
  }
  return ctx
}
