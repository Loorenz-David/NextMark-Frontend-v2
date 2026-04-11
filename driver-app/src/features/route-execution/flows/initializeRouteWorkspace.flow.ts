import type { DriverWorkspaceContext } from '@/app/contracts/driverSession.types'
import type { DriverOrderStateIds } from '@/features/order-states'
import { shouldRefreshForFreshness } from '@shared-utils'
import {
  clearOrders,
  clearRouteSnapshotMeta,
  clearRoutes,
  hydrateDriverRouteByIdFlow,
  initializeActiveRoutesFlow,
  loadRouteFreshnessQuery,
  routeSnapshotMetaStore,
  selectSelectedRoute,
  useRoutesSelectionStore,
  useRoutesStore,
} from '@/features/routes'
import { clearStops, selectStopsByRouteRecord, useStopsStore } from '@/features/routes/stops'
import { selectAllOrders, useOrdersStore } from '@/features/routes/orders'
import {
  resetRouteExecutionStore,
  setAssignedRouteSnapshot,
  setAssignedRouteSnapshotMeta,
  setRouteExecutionError,
  setRouteExecutionLoading,
} from '../stores/routeExecution.mutations'
import type { RouteExecutionStore } from '../stores/routeExecution.store'
import type { DriverRouteRecord } from '@/features/routes'
import type { DriverOrderRecord } from '@/features/routes/orders'
import type { DriverRouteStopRecord } from '@/features/routes/stops'

type InitializeRouteWorkspaceDependencies = {
  workspace: DriverWorkspaceContext | null
  store: RouteExecutionStore
  orderStateIds: DriverOrderStateIds
}

export async function initializeRouteWorkspaceFlow({
  workspace,
  store,
  orderStateIds: _orderStateIds,
}: InitializeRouteWorkspaceDependencies) {
  if (!workspace?.capabilities.canExecuteRoutes) {
    clearRoutes()
    clearOrders()
    clearRouteSnapshotMeta()
    resetRouteExecutionStore(store)
    return
  }

  try {
    let selectedRoute = selectSelectedRoute(useRoutesSelectionStore.getState(), useRoutesStore.getState())
    if (!selectedRoute) {
      await initializeActiveRoutesFlow({
        workspaceScopeKey: workspace.workspaceScopeKey,
      })
      selectedRoute = selectSelectedRoute(useRoutesSelectionStore.getState(), useRoutesStore.getState())
    }

    if (!selectedRoute?.id) {
      clearOrders()
      clearStops()
      clearRouteSnapshotMeta()
      setAssignedRouteSnapshot(store, createEmptyAssignedRouteSnapshot())
      setAssignedRouteSnapshotMeta(store, null, null)
      return
    }

    const freshness = await loadRouteFreshnessQuery(selectedRoute.id)
    const canonicalFreshness = freshness.routeFreshnessUpdatedAt
    let snapshotState = routeSnapshotMetaStore.getState()
    const hasFreshSnapshotForSelectedRoute = (
      snapshotState.route != null
      && snapshotState.hydratedRouteId === selectedRoute.id
      && !shouldRefreshForFreshness(
        snapshotState.hydratedRouteFreshnessUpdatedAt,
        canonicalFreshness,
      )
    )
    const workspaceState = store.getState().workspace
    const hasFreshWorkspaceSnapshot = (
      workspaceState.routeRecord != null
      && workspaceState.hydratedRouteId === selectedRoute.id
      && !shouldRefreshForFreshness(
        workspaceState.hydratedRouteFreshnessUpdatedAt,
        canonicalFreshness,
      )
    )

    if (hasFreshWorkspaceSnapshot && workspaceState.routeRecord) {
      setAssignedRouteSnapshotMeta(
        store,
        workspaceState.hydratedRouteId,
        workspaceState.hydratedRouteFreshnessUpdatedAt ?? canonicalFreshness,
      )
      return
    }

    if (!hasFreshWorkspaceSnapshot && !hasFreshSnapshotForSelectedRoute) {
      setRouteExecutionLoading(store)
      await hydrateDriverRouteByIdFlow({
        routeId: selectedRoute.id,
        workspaceScopeKey: workspace.workspaceScopeKey,
        freshAfter: canonicalFreshness,
        force: snapshotState.hydratedRouteId !== selectedRoute.id,
      })
      snapshotState = routeSnapshotMetaStore.getState()
    }

    const fullRouteRecord = snapshotState.route

    const isHydratedForSelectedRoute = (
      fullRouteRecord != null
      && snapshotState.hydratedRouteId === selectedRoute.id
      && !shouldRefreshForFreshness(
        snapshotState.hydratedRouteFreshnessUpdatedAt,
        canonicalFreshness,
      )
    )

    if (!isHydratedForSelectedRoute) {
      throw new Error('Driver route snapshot is missing for the selected route.')
    }

    setAssignedRouteSnapshot(store, buildAssignedRouteSnapshotFromStores(fullRouteRecord))
    setAssignedRouteSnapshotMeta(
      store,
      snapshotState.hydratedRouteId,
      snapshotState.hydratedRouteFreshnessUpdatedAt ?? canonicalFreshness,
    )
  } catch (error) {
    console.error('Failed to initialize route workspace', error)
    clearOrders()
    clearStops()
    clearRouteSnapshotMeta()
    setRouteExecutionError(store, 'Unable to load assigned route.')
  }
}

function createEmptyAssignedRouteSnapshot() {
  return {
    routeRecord: null,
    orders: {
      byClientId: {},
      allIds: [],
    },
    stops: {
      byClientId: {},
      allIds: [],
    },
  }
}

export function buildAssignedRouteSnapshotFromStores(routeRecord: DriverRouteRecord) {
  const stopRecords = selectStopsByRouteRecord(useStopsStore.getState(), routeRecord)
  const orderIdsForRoute = new Set(
    stopRecords
      .map((stop) => stop.order_id)
      .filter((orderId): orderId is number => typeof orderId === 'number'),
  )
  const orders = selectAllOrders(useOrdersStore.getState())
    .filter((order) => order.id != null && orderIdsForRoute.has(order.id))

  return {
    routeRecord: { ...routeRecord },
    orders: toOrderCollection(orders),
    stops: toStopCollection(stopRecords),
  }
}

function toOrderCollection(orders: DriverOrderRecord[]) {
  return {
    byClientId: Object.fromEntries(orders.map((order) => [order.client_id, { ...order }])),
    allIds: orders.map((order) => order.client_id),
  }
}

function toStopCollection(stops: DriverRouteStopRecord[]) {
  return {
    byClientId: Object.fromEntries(stops.map((stop) => [stop.client_id, { ...stop }])),
    allIds: stops.map((stop) => stop.client_id),
  }
}
