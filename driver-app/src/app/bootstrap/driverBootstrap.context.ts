import { createContext, useContext } from 'react'
import type { DriverBootstrapStore } from './driverBootstrap.store'

type DriverBootstrapContextValue = {
  store: DriverBootstrapStore
}

export const DriverBootstrapContext = createContext<DriverBootstrapContextValue | null>(null)

export function useDriverBootstrapContext() {
  const context = useContext(DriverBootstrapContext)
  if (!context) {
    throw new Error('useDriverBootstrapContext must be used within DriverBootstrapProvider')
  }

  return context
}
