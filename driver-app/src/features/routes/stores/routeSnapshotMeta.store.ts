import type { DriverRouteRecord } from '../domain'

export type RouteSnapshotMetaState = {
  route: DriverRouteRecord | null
  hydratedRouteId: number | null
  hydratedRouteFreshnessUpdatedAt: string | null
}

type Listener = () => void
type StateUpdater =
  | RouteSnapshotMetaState
  | ((state: RouteSnapshotMetaState) => RouteSnapshotMetaState)

function createInitialRouteSnapshotMetaState(): RouteSnapshotMetaState {
  return {
    route: null,
    hydratedRouteId: null,
    hydratedRouteFreshnessUpdatedAt: null,
  }
}

function createRouteSnapshotMetaStore(
  initialState: RouteSnapshotMetaState = createInitialRouteSnapshotMetaState(),
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

export const routeSnapshotMetaStore = createRouteSnapshotMetaStore()
