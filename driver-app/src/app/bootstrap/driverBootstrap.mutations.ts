import type { DriverBootstrapStore } from './driverBootstrap.store'
import type { DriverBootstrapPayload } from './driverBootstrap.types'

export function setDriverBootstrapLoading(store: DriverBootstrapStore) {
  store.setState((state) => ({
    ...state,
    status: 'loading',
    error: null,
  }))
}

export function setDriverBootstrapReady(store: DriverBootstrapStore, payload: DriverBootstrapPayload) {
  store.setState((state) => ({
    ...state,
    status: 'ready',
    error: null,
    routeTiming: payload.routeTiming,
  }))
}

export function setDriverBootstrapError(store: DriverBootstrapStore, error: string) {
  store.setState((state) => ({
    ...state,
    status: 'error',
    error,
  }))
}
