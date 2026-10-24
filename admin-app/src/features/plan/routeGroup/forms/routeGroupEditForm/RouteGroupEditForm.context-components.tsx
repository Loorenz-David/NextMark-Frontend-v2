import type { ReactNode } from 'react'
import type { PropsRouteGroupEditFormContext } from './RouteGroupEditForm.types'
export type RouteGroupEditFormContextProviderProps = {
  children: ReactNode
  value: PropsRouteGroupEditFormContext
}
import { RouteGroupEditFormContext } from './RouteGroupEditForm.context'

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
