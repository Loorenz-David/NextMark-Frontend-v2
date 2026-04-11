import type {
  DriverCommandEnvelope,
  DriverRouteActionCommand,
  DriverRouteActionResult,
} from '@/app/contracts/routeExecution.types'
import type { DriverOrderCommandDeltaPayload } from '../domain/mapOrderCommandDeltas'
import type { RouteExecutionStore } from './routeExecution.store'
import {
  createEmptyRouteExecutionOrdersCollection,
  createEmptyRouteExecutionStopsCollection,
  createInitialRouteExecutionWorkspaceState,
  type RouteExecutionOrdersCollection,
  type RouteExecutionStopsCollection,
} from './routeExecution.store'
import type { DriverRouteRecord } from '@/features/routes'

type RouteExecutionOrdersSnapshot = RouteExecutionOrdersCollection

function cloneOrdersCollection(orders: RouteExecutionOrdersCollection): RouteExecutionOrdersCollection {
  return {
    byClientId: Object.fromEntries(
      orders.allIds
        .map((clientId) => {
          const order = orders.byClientId[clientId]
          return order ? [clientId, { ...order }] : null
        })
        .filter((entry): entry is [string, RouteExecutionOrdersCollection['byClientId'][string]] => Boolean(entry)),
    ),
    allIds: [...orders.allIds],
  }
}

function cloneStopsCollection(stops: RouteExecutionStopsCollection): RouteExecutionStopsCollection {
  return {
    byClientId: Object.fromEntries(
      stops.allIds
        .map((clientId) => {
          const stop = stops.byClientId[clientId]
          return stop ? [clientId, { ...stop }] : null
        })
        .filter((entry): entry is [string, RouteExecutionStopsCollection['byClientId'][string]] => Boolean(entry)),
    ),
    allIds: [...stops.allIds],
  }
}

function findOrderClientIdsByServerIds(
  orders: RouteExecutionOrdersCollection,
  orderIds: number[],
) {
  if (orderIds.length === 0) {
    return []
  }

  const orderIdSet = new Set(orderIds)
  return orders.allIds.filter((clientId) => {
    const order = orders.byClientId[clientId]
    return order?.id != null && orderIdSet.has(order.id)
  })
}

export function setRouteExecutionLoading(store: RouteExecutionStore) {
  store.setState((state) => ({
    ...state,
    workspace: {
      ...state.workspace,
      status: 'loading',
      routeRecord: null,
      orders: createEmptyRouteExecutionOrdersCollection(),
      stops: createEmptyRouteExecutionStopsCollection(),
      hydratedRouteId: null,
      hydratedRouteFreshnessUpdatedAt: null,
      error: undefined,
    },
  }))
}

export function setAssignedRouteSnapshot(
  store: RouteExecutionStore,
  snapshot: {
    routeRecord: DriverRouteRecord | null
    orders: RouteExecutionOrdersCollection
    stops: RouteExecutionStopsCollection
  },
) {
  store.setState((state) => ({
    ...state,
    workspace: {
      ...state.workspace,
      status: 'ready',
      routeRecord: snapshot.routeRecord,
      orders: cloneOrdersCollection(snapshot.orders),
      stops: cloneStopsCollection(snapshot.stops),
      hydratedRouteId: snapshot.routeRecord?.id ?? null,
      syncState: 'idle',
      error: undefined,
    },
  }))
}

export function setAssignedRouteSnapshotMeta(
  store: RouteExecutionStore,
  hydratedRouteId: number | null,
  hydratedRouteFreshnessUpdatedAt: string | null,
) {
  store.setState((state) => ({
    ...state,
    workspace: {
      ...state.workspace,
      hydratedRouteId,
      hydratedRouteFreshnessUpdatedAt,
    },
  }))
}

export function setRouteExecutionError(store: RouteExecutionStore, error: string) {
  store.setState((state) => ({
    ...state,
    workspace: {
      ...state.workspace,
      status: 'error',
      routeRecord: null,
      orders: createEmptyRouteExecutionOrdersCollection(),
      stops: createEmptyRouteExecutionStopsCollection(),
      hydratedRouteId: null,
      hydratedRouteFreshnessUpdatedAt: null,
      error,
    },
  }))
}

export function setRouteActionSubmitting(
  store: RouteExecutionStore,
  envelope: DriverCommandEnvelope<DriverRouteActionCommand>,
) {
  store.setState((state) => ({
    ...state,
    workspace: {
      ...state.workspace,
      syncState: 'submitting',
      lastCommand: envelope,
      error: undefined,
    },
  }))
}

export function applyRouteActionResult(
  store: RouteExecutionStore,
  envelope: DriverCommandEnvelope<DriverRouteActionCommand>,
  result: DriverRouteActionResult,
) {
  store.setState((state) => ({
    ...state,
    workspace: {
      ...state.workspace,
      status: 'ready',
      syncState: result.syncState,
      error: undefined,
      lastCommand: envelope,
    },
  }))
}

export function setRouteActionFailure(
  store: RouteExecutionStore,
  envelope: DriverCommandEnvelope<DriverRouteActionCommand>,
  error: string,
) {
  store.setState((state) => ({
    ...state,
    workspace: {
      ...state.workspace,
      syncState: 'retryable_failure',
      error,
      lastCommand: envelope,
    },
  }))
}

export function resetRouteExecutionStore(store: RouteExecutionStore) {
  store.setState({
    workspace: createInitialRouteExecutionWorkspaceState(),
  })
}

export function createAssignedRouteOrdersSnapshotByServerIds(
  store: RouteExecutionStore,
  orderIds: number[],
): RouteExecutionOrdersSnapshot {
  const orders = store.getState().workspace.orders
  const clientIds = findOrderClientIdsByServerIds(orders, orderIds)

  return {
    byClientId: Object.fromEntries(
      clientIds
        .map((clientId) => {
          const order = orders.byClientId[clientId]
          return order ? [clientId, { ...order }] : null
        })
        .filter((entry): entry is [string, RouteExecutionOrdersCollection['byClientId'][string]] => Boolean(entry)),
    ),
    allIds: clientIds,
  }
}

export function restoreAssignedRouteOrdersSnapshot(
  store: RouteExecutionStore,
  snapshot: RouteExecutionOrdersSnapshot,
) {
  if (snapshot.allIds.length === 0) {
    return
  }

  store.setState((state) => {
    const nextOrders = cloneOrdersCollection(state.workspace.orders)

    snapshot.allIds.forEach((clientId) => {
      const order = snapshot.byClientId[clientId]
      if (order) {
        nextOrders.byClientId[clientId] = { ...order }
        if (!nextOrders.allIds.includes(clientId)) {
          nextOrders.allIds.push(clientId)
        }
      }
    })

    return {
      ...state,
      workspace: {
        ...state.workspace,
        orders: nextOrders,
      },
    }
  })
}

export function patchAssignedRouteOrderStateByServerIds(
  store: RouteExecutionStore,
  orderIds: number[],
  orderStateId: number,
) {
  let didPatch = false

  store.setState((state) => {
    const clientIds = findOrderClientIdsByServerIds(state.workspace.orders, orderIds)
    if (clientIds.length === 0) {
      return state
    }

    didPatch = true
    const nextOrders = cloneOrdersCollection(state.workspace.orders)
    clientIds.forEach((clientId) => {
      const order = nextOrders.byClientId[clientId]
      if (!order) {
        return
      }

      nextOrders.byClientId[clientId] = {
        ...order,
        order_state_id: orderStateId,
      }
    })

    return {
      ...state,
      workspace: {
        ...state.workspace,
        orders: nextOrders,
      },
    }
  })

  return didPatch
}

export function applyAssignedRouteOrderCommandDeltas(
  store: RouteExecutionStore,
  deltas: DriverOrderCommandDeltaPayload,
) {
  let didPatch = false

  store.setState((state) => {
    const presentClientIds = deltas.allIds.filter((clientId) => state.workspace.orders.byClientId[clientId])
    if (presentClientIds.length === 0) {
      return state
    }

    didPatch = true
    const nextOrders = cloneOrdersCollection(state.workspace.orders)
    presentClientIds.forEach((clientId) => {
      const delta = deltas.byClientId[clientId]
      const order = nextOrders.byClientId[clientId]
      if (!delta || !order) {
        return
      }

      nextOrders.byClientId[clientId] = {
        ...order,
        order_state_id: delta.order_state_id,
        open_order_cases: delta.open_order_cases,
      }
    })

    return {
      ...state,
      workspace: {
        ...state.workspace,
        orders: nextOrders,
      },
    }
  })

  return didPatch
}
