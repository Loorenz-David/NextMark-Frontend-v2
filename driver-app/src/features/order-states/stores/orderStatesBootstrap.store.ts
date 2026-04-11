export type OrderStatesBootstrapStatus = 'idle' | 'loading' | 'ready' | 'error'

export type OrderStatesBootstrapState = {
  status: OrderStatesBootstrapStatus
  error: string | null
}

export type OrderStatesBootstrapStore = ReturnType<typeof createOrderStatesBootstrapStore>

type Listener = () => void
type StateUpdater =
  | OrderStatesBootstrapState
  | ((state: OrderStatesBootstrapState) => OrderStatesBootstrapState)

export function createInitialOrderStatesBootstrapState(): OrderStatesBootstrapState {
  return {
    status: 'idle',
    error: null,
  }
}

export function createOrderStatesBootstrapStore(
  initialState: OrderStatesBootstrapState = createInitialOrderStatesBootstrapState(),
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
