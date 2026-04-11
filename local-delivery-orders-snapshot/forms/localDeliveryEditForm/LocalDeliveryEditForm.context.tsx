import { useContext, createContext } from 'react'
import type { ReactNode } from 'react'

import type { PropsLocalDeliveryEditFormContext } from './LocalDeliveryEditForm.types'

export type LocalDeliveryEditFormContextProviderProps = {
  children: ReactNode
  value: PropsLocalDeliveryEditFormContext
}

export const LocalDeliveryEditFormContext = createContext<PropsLocalDeliveryEditFormContext | null>(null)

export const LocalDeliveryEditFormContextProvider = ({
  value,
  children,
}: LocalDeliveryEditFormContextProviderProps) => {
  return (
    <LocalDeliveryEditFormContext.Provider value={value}>
      {children}
    </LocalDeliveryEditFormContext.Provider>
  )
}

export const useLocalDeliveryEditForm = () => {
  const ctx = useContext(LocalDeliveryEditFormContext)
  if (!ctx) {
    throw new Error('LocalDeliveryEditForm is not available. Wrap your app with LocalDeliveryEditFormProvider.')
  }
  return ctx
}
