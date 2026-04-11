import { useContext, createContext } from 'react'
import type { ReactNode } from 'react'

import type { PropsRouteGroupEditFormContext } from './RouteGroupEditForm.types'

export type RouteGroupEditFormContextProviderProps = {
  children: ReactNode
  value: PropsRouteGroupEditFormContext
}

export const RouteGroupEditFormContext = createContext<PropsRouteGroupEditFormContext | null>(null)

export const RouteGroupEditFormContextProvider = ({
  value,
  children,
}: RouteGroupEditFormContextProviderProps) => {
  return (
    <RouteGroupEditFormContext.Provider value={value}>
      {children}
    </RouteGroupEditFormContext.Provider>
  )
}

export const useRouteGroupEditForm = () => {
  const ctx = useContext(RouteGroupEditFormContext)
  if (!ctx) {
    throw new Error('RouteGroupEditForm is not available. Wrap your app with RouteGroupEditFormProvider.')
  }
  return ctx
}
