import type { ReactNode } from 'react'

import { PhoneFieldContext } from './PhoneField.context'
import { usePhoneFieldControllers } from './PhoneField.controllers'
import type { PhoneFieldProps } from './PhoneField.types'

type PhoneFieldProviderProps = PhoneFieldProps & {
  children: ReactNode
}

export const PhoneFieldProvider = ({
  children,
  phoneNumber,
  onChange,
  storageNamespace,
}: PhoneFieldProviderProps) => {
  const controllers = usePhoneFieldControllers({
    phoneNumber,
    onChange,
    storageNamespace,
  })

  const value = {
    phoneNumber,
    ...controllers,
  }

  return (
    <PhoneFieldContext.Provider value={value}>
      {children}
    </PhoneFieldContext.Provider>
  )
}
