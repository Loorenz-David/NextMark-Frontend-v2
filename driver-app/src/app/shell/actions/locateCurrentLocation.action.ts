import type { DriverServices } from '@/app/providers/driverServices.context'
import type { ShellStore } from '../domain/shell.types'
import { setCurrentLocationState, setCurrentLocationStatusState } from '../stores/shell.mutations'

type LocateCurrentLocationActionDependencies = {
  browserLocationService: DriverServices['browserLocationService']
  store: ShellStore
}

export async function locateCurrentLocationAction({
  browserLocationService,
  store,
}: LocateCurrentLocationActionDependencies) {
  store.setState((state) => setCurrentLocationStatusState(state, 'locating'))

  try {
    const coordinates = await browserLocationService.getCurrentCoordinates()
    store.setState((state) => setCurrentLocationState(state, coordinates))
    return coordinates
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to resolve current location.'
    store.setState((state) => setCurrentLocationStatusState(state, 'error', message))
    throw error
  }
}
