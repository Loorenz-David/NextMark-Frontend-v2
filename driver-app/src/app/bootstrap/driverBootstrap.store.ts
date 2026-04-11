import type { DriverBootstrapState } from './driverBootstrap.types'

export type DriverBootstrapStore = ReturnType<typeof createDriverBootstrapStore>

type Listener = () => void
type StateUpdater =
  | DriverBootstrapState
  | ((state: DriverBootstrapState) => DriverBootstrapState)

export function createInitialDriverBootstrapState(): DriverBootstrapState {
  return {
    status: 'idle',
    error: null,
    routeTiming: null,
  }
}

export function createDriverBootstrapStore(
  initialState: DriverBootstrapState = createInitialDriverBootstrapState(),
) {
  let state = initialState
  const listeners = new Set<Listener>()

  const getState = () => state

  const setState = (updater: StateUpdater) => {
    state = typeof updater === 'function' ? updater(state) : updater
    listeners.forEach((listener) => listener())
  }

  const subscribe = (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return {
    getState,
    setState,
    subscribe,
  }
}
