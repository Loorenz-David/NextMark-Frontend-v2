import { useSyncExternalStore } from 'react'
import { useDriverBootstrapContext } from './driverBootstrap.context'

export function useDriverBootstrapState() {
  const { store } = useDriverBootstrapContext()

  return useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  )
}
