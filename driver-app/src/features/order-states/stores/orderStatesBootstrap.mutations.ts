import type { OrderStatesBootstrapStore } from './orderStatesBootstrap.store'

export function setOrderStatesBootstrapLoading(store: OrderStatesBootstrapStore) {
  store.setState((state) => ({
    ...state,
    status: 'loading',
    error: null,
  }))
}

export function setOrderStatesBootstrapReady(store: OrderStatesBootstrapStore) {
  store.setState((state) => ({
    ...state,
    status: 'ready',
    error: null,
  }))
}

export function setOrderStatesBootstrapError(store: OrderStatesBootstrapStore, error: string) {
  store.setState((state) => ({
    ...state,
    status: 'error',
    error,
  }))
}
