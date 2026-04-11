import type {
  DriverCommandEnvelope,
  DriverRouteActionCommand,
  SyncExecutionState,
} from '@/app/contracts/routeExecution.types'
import type { DriverRouteRecord } from '@/features/routes'
import type { DriverOrderRecord } from '@/features/routes/orders'
import type { DriverRouteStopRecord } from '@/features/routes/stops'

export type RouteExecutionOrdersCollection = {
  byClientId: Record<string, DriverOrderRecord>
  allIds: string[]
}

export type RouteExecutionStopsCollection = {
  byClientId: Record<string, DriverRouteStopRecord>
  allIds: string[]
}

export type RouteExecutionWorkspaceState = {
  status: 'idle' | 'loading' | 'ready' | 'error'
  routeRecord: DriverRouteRecord | null
  orders: RouteExecutionOrdersCollection
  stops: RouteExecutionStopsCollection
  hydratedRouteId: number | null
  hydratedRouteFreshnessUpdatedAt: string | null
  error?: string
  lastCommand?: DriverCommandEnvelope<DriverRouteActionCommand>
  syncState: SyncExecutionState
}

export type RouteExecutionStoreState = {
  workspace: RouteExecutionWorkspaceState
}

export type RouteExecutionStore = ReturnType<typeof createRouteExecutionStore>

type Listener = () => void
type StateUpdater = RouteExecutionStoreState | ((state: RouteExecutionStoreState) => RouteExecutionStoreState)

export function createEmptyRouteExecutionOrdersCollection(): RouteExecutionOrdersCollection {
  return {
    byClientId: {},
    allIds: [],
  }
}

export function createEmptyRouteExecutionStopsCollection(): RouteExecutionStopsCollection {
  return {
    byClientId: {},
    allIds: [],
  }
}

export function createInitialRouteExecutionWorkspaceState(): RouteExecutionWorkspaceState {
  return {
    status: 'idle',
    routeRecord: null,
    orders: createEmptyRouteExecutionOrdersCollection(),
    stops: createEmptyRouteExecutionStopsCollection(),
    hydratedRouteId: null,
    hydratedRouteFreshnessUpdatedAt: null,
    syncState: 'idle',
  }
}

export function createInitialRouteExecutionStoreState(): RouteExecutionStoreState {
  return {
    workspace: createInitialRouteExecutionWorkspaceState(),
  }
}

export function createRouteExecutionStore(
  initialState: RouteExecutionStoreState = createInitialRouteExecutionStoreState(),
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
