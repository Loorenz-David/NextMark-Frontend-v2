import { createContext, useContext } from 'react'
import type { DriverRouteRecord } from '../domain'

export type RoutesListContextValue = {
  routes: DriverRouteRecord[]
  selectedRouteClientId: string | null
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  refreshRoutes: () => Promise<void>
  onSelectRoute?: (routeClientId: string) => void
}

export const RoutesListContext = createContext<RoutesListContextValue | null>(null)

export function useRoutesListContext() {
  const context = useContext(RoutesListContext)

  if (!context) {
    throw new Error('useRoutesListContext must be used within RoutesListProvider')
  }

  return context
}
