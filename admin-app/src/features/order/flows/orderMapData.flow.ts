import { useCallback, useEffect, useMemo, useRef } from 'react'

import { MAP_MARKER_LAYERS, type MapOrder, type MapBounds } from '@/shared/map'
import { useMapManager } from '@/shared/resource-manager/useResourceManager'

import { useListOrderMapMarkers } from '../api/orderApi'
import type { Order } from '../types/order'
import type { OrderQueryFilters, OrderQueryStoreFilters } from '../types/orderMeta'
import { orderStringFilters } from '../domain/orderFilterConfig'
import { reactiveOrderVisibility } from '../domain/orderReactiveVisibility'
import { normalizeQuery } from '@shared-utils'
import { buildOrderMarkers } from './orderMapMarkers.flow'
import {
  resolveOrderGroupOperationBadgeDirections,
  resolveOrderOperationBadgeDirections,
} from '../domain/orderOperationBadgeDirections'
import { useUpsertOrdersStore } from '../store/orderHooks.store'
import { useOrderMapInteractionActions } from '../store/orderMapInteractionHooks.store'
import {
  useOrderMapInteractionStore,
  type OrderMarkerGroupLookup,
} from '../store/orderMapInteraction.store'
import { useOrderStore } from '../store/order.store'

type UseOrderMapDataFlowParams = {
  query: OrderQueryStoreFilters
  visible: boolean
  refreshEnabled: boolean
  bootstrapOrders: Order[]
  markerClassName: string
  onMarkerClick: (event: MouseEvent, order: Order) => void
  onGroupMarkerClick?: (params: {
    event: MouseEvent
    markerId: string
    markerAnchorEl: HTMLElement
    orders: Order[]
    primaryOrder: Order
  }) => void
  onGroupMarkerMouseEnter?: (event: MouseEvent, orders: Order[], primaryOrder: Order) => void
  onGroupMarkerMouseLeave?: () => void
  onMarkerClientIdsMouseEnter?: (event: MouseEvent, clientIds: string[]) => void
  onMarkerClientIdsMouseLeave?: () => void
  onMarkerMouseEnter?: (event: MouseEvent, order: Order) => void
  onMarkerMouseLeave?: (event: MouseEvent, order: Order) => void
}

const DEBOUNCE_MS = 180
const UNSCHEDULED_COLOR = '#8b8b8b'
const GOLDEN_ANGLE = 137.508
const ORDER_CLUSTER_RADIUS_PX = 80
const ORDER_CLUSTER_MAX_ZOOM = 16
const planColorCache = new Map<number, string>()
let lastSuccessfulOrderMarkerRequestKey: string | null = null

const bucketBounds = (bounds: MapBounds | null) => {
  if (!bounds) return null
  const round = (value: number) => Number(value.toFixed(3))
  return {
    north: round(bounds.north),
    south: round(bounds.south),
    east: round(bounds.east),
    west: round(bounds.west),
  }
}

const buildMarkerRequestKey = (query: Record<string, unknown>, bounds: ReturnType<typeof bucketBounds>) =>
  JSON.stringify({
    query,
    bounds,
  })

const boundsContainBounds = (
  outer: ReturnType<typeof bucketBounds>,
  inner: ReturnType<typeof bucketBounds>,
) => {
  if (!outer || !inner) return false

  return (
    outer.north >= inner.north
    && outer.south <= inner.south
    && outer.east >= inner.east
    && outer.west <= inner.west
  )
}

const getPlanColor = (planId: number): string => {
  if (planColorCache.has(planId)) {
    return planColorCache.get(planId)!
  }

  const hue = (planId * GOLDEN_ANGLE) % 360
  const color = `hsl(${hue}, 75%, 48%)`
  planColorCache.set(planId, color)
  return color
}

const getOrderMarkerColor = (order: Order): string => {
  if (!order.delivery_plan_id) return UNSCHEDULED_COLOR
  return getPlanColor(order.delivery_plan_id)
}

const buildMarkersFromResponse = ({
  markers,
  ordersByClientId,
  resolveOrderForMarker,
  markerClassName,
  onMarkerClick,
  onGroupMarkerClick,
  onGroupMarkerMouseEnter,
  onGroupMarkerMouseLeave,
  onMarkerClientIdsMouseEnter,
  onMarkerClientIdsMouseLeave,
  onMarkerMouseEnter,
  onMarkerMouseLeave,
}: {
  markers: Array<{
    id: string
    coordinates: {
      lat: number
      lng: number
    }
    primary_order_client_id: string
    order_client_ids: string[]
    count: number
  }>
  ordersByClientId: Record<string, Order>
  resolveOrderForMarker?: (clientId: string, responseOrder: Order | null) => Order | null
  markerClassName: string
  onMarkerClick: (event: MouseEvent, order: Order) => void
  onGroupMarkerClick?: (params: {
    event: MouseEvent
    markerId: string
    markerAnchorEl: HTMLElement
    orders: Order[]
    primaryOrder: Order
  }) => void
  onGroupMarkerMouseEnter?: (event: MouseEvent, orders: Order[], primaryOrder: Order) => void
  onGroupMarkerMouseLeave?: () => void
  onMarkerClientIdsMouseEnter?: (event: MouseEvent, clientIds: string[]) => void
  onMarkerClientIdsMouseLeave?: () => void
  onMarkerMouseEnter?: (event: MouseEvent, order: Order) => void
  onMarkerMouseLeave?: (event: MouseEvent, order: Order) => void
}): {
  markers: MapOrder[]
  lookup: OrderMarkerGroupLookup
} => {
  const builtMarkers: MapOrder[] = []
  const markerOrderClientIdsByMarkerId: Record<string, string[]> = {}
  const primaryOrderClientIdByMarkerId: Record<string, string> = {}
  const markerIdByOrderClientId: Record<string, string> = {}
  const resolveHoverOrders = (clientIds: string[]) =>
    clientIds
      .map((clientId) => {
        const responseOrder = ordersByClientId[clientId] ?? null
        return resolveOrderForMarker
          ? resolveOrderForMarker(clientId, responseOrder)
          : responseOrder
      })
      .filter((order): order is Order => Boolean(order))

  const handleHoverIdsEnter = (
    event: MouseEvent,
    clientIds: string[],
  ) => {
    if (onMarkerClientIdsMouseEnter) {
      onMarkerClientIdsMouseEnter(event, clientIds)
      return
    }

    const hoverOrders = resolveHoverOrders(clientIds)
    const primaryOrder = hoverOrders[0] ?? null
    if (!primaryOrder) {
      return
    }

    if (onGroupMarkerMouseEnter) {
      onGroupMarkerMouseEnter(event, hoverOrders, primaryOrder)
      return
    }

    onMarkerMouseEnter?.(event, primaryOrder)
  }

  const handleHoverIdsLeave = (
    event: MouseEvent,
    clientIds: string[],
  ) => {
    if (onMarkerClientIdsMouseLeave) {
      onMarkerClientIdsMouseLeave()
      return
    }

    if (onGroupMarkerMouseLeave) {
      onGroupMarkerMouseLeave()
      return
    }

    const primaryOrder = resolveHoverOrders(clientIds)[0] ?? null
    if (primaryOrder) {
      onMarkerMouseLeave?.(event, primaryOrder)
    }
  }

  markers.forEach((marker) => {
    const groupedOrders = marker.order_client_ids
      .map((clientId) => {
        const responseOrder = ordersByClientId[clientId] ?? null
        return resolveOrderForMarker
          ? resolveOrderForMarker(clientId, responseOrder)
          : responseOrder
      })
      .filter((order): order is Order => Boolean(order))

    const responsePrimaryOrder = ordersByClientId[marker.primary_order_client_id] ?? null
    const primaryOrder =
      (resolveOrderForMarker
        ? resolveOrderForMarker(marker.primary_order_client_id, responsePrimaryOrder)
        : responsePrimaryOrder) ?? groupedOrders[0] ?? null
    if (!primaryOrder || groupedOrders.length === 0) {
      return
    }

    const groupedOrderClientIds = groupedOrders.map((order) => order.client_id)

    markerOrderClientIdsByMarkerId[marker.id] = groupedOrderClientIds
    primaryOrderClientIdByMarkerId[marker.id] = primaryOrder.client_id
    groupedOrderClientIds.forEach((clientId) => {
      markerIdByOrderClientId[clientId] = marker.id
    })

    builtMarkers.push({
      id: marker.id,
      coordinates: marker.coordinates,
      markerColor: getOrderMarkerColor(primaryOrder),
      route_plan_id: primaryOrder.delivery_plan_id ?? null,
      className: markerClassName,
      interactionVariant: 'order',
      label: groupedOrders.length > 1 ? String(groupedOrders.length) : undefined,
      operationBadgeDirections:
        groupedOrders.length > 1
          ? resolveOrderGroupOperationBadgeDirections(groupedOrders.map((order) => order.operation_type))
          : resolveOrderOperationBadgeDirections(primaryOrder.operation_type),
      hoverIds: groupedOrderClientIds,
      onHoverIdsEnter:
        onMarkerClientIdsMouseEnter || onGroupMarkerMouseEnter || onMarkerMouseEnter
          ? handleHoverIdsEnter
          : undefined,
      onHoverIdsLeave:
        onMarkerClientIdsMouseLeave || onGroupMarkerMouseLeave || onMarkerMouseLeave
          ? handleHoverIdsLeave
          : undefined,
      onClick: (event: MouseEvent) => {
        if (marker.count > 1 && onGroupMarkerClick) {
          const markerAnchorEl = event.currentTarget as HTMLElement | null
          if (markerAnchorEl) {
            onGroupMarkerClick({
              event,
              markerId: marker.id,
              markerAnchorEl,
              orders: groupedOrders,
              primaryOrder,
            })
            return
          }
        }
        onMarkerClick(event, primaryOrder)
      },
      onMouseEnter:
        groupedOrders.length > 1 && onGroupMarkerMouseEnter
          ? (event: MouseEvent) =>
              onGroupMarkerMouseEnter(event, groupedOrders, primaryOrder)
          : onMarkerMouseEnter
            ? (event: MouseEvent) => onMarkerMouseEnter(event, primaryOrder)
            : undefined,
      onMouseLeave:
        groupedOrders.length > 1 && onGroupMarkerMouseLeave
          ? () => onGroupMarkerMouseLeave()
          : onMarkerMouseLeave
            ? (event: MouseEvent) => onMarkerMouseLeave(event, primaryOrder)
            : undefined,
    })
  })

  return {
    markers: builtMarkers,
    lookup: {
      markerOrderClientIdsByMarkerId,
      primaryOrderClientIdByMarkerId,
      markerIdByOrderClientId,
    },
  }
}

const filterOrderMapForCurrentLocalState = (
  responseOrderMap: {
    byClientId: Record<string, Order>
    allIds: string[]
    idIndex?: Record<number, string>
  },
  filters: OrderQueryFilters,
) => {
  const localOrdersByClientId = useOrderStore.getState().byClientId
  const byClientId: Record<string, Order> = {}
  const allIds: string[] = []
  const idIndex: Record<number, string> = {}

  responseOrderMap.allIds.forEach((clientId) => {
    const responseOrder = responseOrderMap.byClientId[clientId]
    if (!responseOrder) {
      return
    }

    const localOrder = localOrdersByClientId[clientId]
    if (localOrder && !reactiveOrderVisibility(localOrder, filters)) {
      return
    }

    const order = localOrder ?? responseOrder
    byClientId[clientId] = order
    allIds.push(clientId)

    if (typeof order.id === 'number') {
      idIndex[order.id] = clientId
    }
  })

  return {
    ...responseOrderMap,
    byClientId,
    allIds,
    idIndex: {
      ...(responseOrderMap.idIndex ?? {}),
      ...idIndex,
    },
  }
}

export const useOrderMapDataFlow = ({
  query,
  visible,
  refreshEnabled,
  bootstrapOrders,
  markerClassName,
  onMarkerClick,
  onGroupMarkerClick,
  onGroupMarkerMouseEnter,
  onGroupMarkerMouseLeave,
  onMarkerClientIdsMouseEnter,
  onMarkerClientIdsMouseLeave,
  onMarkerMouseEnter,
  onMarkerMouseLeave,
}: UseOrderMapDataFlowParams) => {
  const mapManager = useMapManager()
  const listOrderMapMarkers = useListOrderMapMarkers()
  const upsertOrdersStore = useUpsertOrdersStore()
  const { setMarkerLookup, clearMarkerLookup } = useOrderMapInteractionActions()
  const boundsRef = useRef<ReturnType<typeof bucketBounds>>(null)
  const debounceRef = useRef<number | null>(null)
  const requestVersionRef = useRef(0)
  const hasBootstrappedRef = useRef(false)
  const fetchedBoundsRef = useRef<ReturnType<typeof bucketBounds>>(null)
  const fetchedQueryKeyRef = useRef<string | null>(null)
  const previousBootstrapOrderClientIdsRef = useRef<string[] | null>(null)

  const normalizedQuery = useMemo(() => normalizeQuery({
    q: query.q,
    filters: query.filters,
  }, orderStringFilters), [query.filters, query.q])
  const bootstrapOrdersSignature = useMemo(
    () =>
      bootstrapOrders
        .map((order) =>
          [
            order.client_id,
            order.delivery_plan_id ?? 'none',
            order.operation_type ?? 'none',
          ].join(':'),
        )
        .sort()
        .join('|'),
    [bootstrapOrders],
  )
  const bootstrapOrderClientIds = useMemo(
    () => bootstrapOrders.map((order) => order.client_id).sort(),
    [bootstrapOrders],
  )

  const normalizedQueryRef = useRef(normalizedQuery)
  const queryFiltersRef = useRef(query.filters)
  const visibleRef = useRef(visible)
  const refreshEnabledRef = useRef(refreshEnabled)
  const markerClassNameRef = useRef(markerClassName)
  const onMarkerClickRef = useRef(onMarkerClick)
  const onGroupMarkerClickRef = useRef(onGroupMarkerClick)
  const onGroupMarkerMouseEnterRef = useRef(onGroupMarkerMouseEnter)
  const onGroupMarkerMouseLeaveRef = useRef(onGroupMarkerMouseLeave)
  const onMarkerClientIdsMouseEnterRef = useRef(onMarkerClientIdsMouseEnter)
  const onMarkerClientIdsMouseLeaveRef = useRef(onMarkerClientIdsMouseLeave)
  const onMarkerMouseEnterRef = useRef(onMarkerMouseEnter)
  const onMarkerMouseLeaveRef = useRef(onMarkerMouseLeave)
  const listOrderMapMarkersRef = useRef(listOrderMapMarkers)
  const upsertOrdersStoreRef = useRef(upsertOrdersStore)

  useEffect(() => {
    normalizedQueryRef.current = normalizedQuery
    queryFiltersRef.current = query.filters
    visibleRef.current = visible
    refreshEnabledRef.current = refreshEnabled
    markerClassNameRef.current = markerClassName
    onMarkerClickRef.current = onMarkerClick
    onGroupMarkerClickRef.current = onGroupMarkerClick
    onGroupMarkerMouseEnterRef.current = onGroupMarkerMouseEnter
    onGroupMarkerMouseLeaveRef.current = onGroupMarkerMouseLeave
    onMarkerClientIdsMouseEnterRef.current = onMarkerClientIdsMouseEnter
    onMarkerClientIdsMouseLeaveRef.current = onMarkerClientIdsMouseLeave
    onMarkerMouseEnterRef.current = onMarkerMouseEnter
    onMarkerMouseLeaveRef.current = onMarkerMouseLeave
    listOrderMapMarkersRef.current = listOrderMapMarkers
    upsertOrdersStoreRef.current = upsertOrdersStore
  }, [
    listOrderMapMarkers,
    markerClassName,
    normalizedQuery,
    onGroupMarkerClick,
    onGroupMarkerMouseEnter,
    onGroupMarkerMouseLeave,
    onMarkerClientIdsMouseEnter,
    onMarkerClientIdsMouseLeave,
    onMarkerClick,
    onMarkerMouseEnter,
    onMarkerMouseLeave,
    refreshEnabled,
    query.filters,
    upsertOrdersStore,
    visible,
  ])

  const refreshMarkers = useCallback(async () => {
    if (!visibleRef.current || !refreshEnabledRef.current || !boundsRef.current) {
      return
    }

    const requestKey = buildMarkerRequestKey(normalizedQueryRef.current, boundsRef.current)
    const currentQueryKey = JSON.stringify(normalizedQueryRef.current)
    const currentBounds = boundsRef.current

    if (
      fetchedQueryKeyRef.current === currentQueryKey
      && boundsContainBounds(fetchedBoundsRef.current, currentBounds)
    ) {
      return
    }

    if (requestKey === lastSuccessfulOrderMarkerRequestKey) {
      return
    }

    const requestVersion = ++requestVersionRef.current
    try {
      const response = await listOrderMapMarkersRef.current({
        ...normalizedQueryRef.current,
        ...boundsRef.current,
      })

      if (requestVersion !== requestVersionRef.current) {
        return
      }

      const payload = response.data
      if (!payload?.order || !Array.isArray(payload.markers)) {
        return
      }

      const localFilteredOrderMap = filterOrderMapForCurrentLocalState(
        payload.order,
        queryFiltersRef.current as OrderQueryFilters,
      )

      upsertOrdersStoreRef.current(localFilteredOrderMap)

      const { markers, lookup } = buildMarkersFromResponse({
        markers: payload.markers,
        ordersByClientId: localFilteredOrderMap.byClientId,
        resolveOrderForMarker: (clientId, responseOrder) => {
          const localOrder = useOrderStore.getState().byClientId[clientId]
          if (
            localOrder &&
            !reactiveOrderVisibility(
              localOrder,
              queryFiltersRef.current as OrderQueryFilters,
            )
          ) {
            return null
          }
          return localOrder ?? responseOrder
        },
        markerClassName: markerClassNameRef.current,
        onMarkerClick: onMarkerClickRef.current,
        onGroupMarkerClick: onGroupMarkerClickRef.current,
        onGroupMarkerMouseEnter: onGroupMarkerMouseEnterRef.current,
        onGroupMarkerMouseLeave: onGroupMarkerMouseLeaveRef.current,
        onMarkerClientIdsMouseEnter: onMarkerClientIdsMouseEnterRef.current,
        onMarkerClientIdsMouseLeave: onMarkerClientIdsMouseLeaveRef.current,
        onMarkerMouseEnter: onMarkerMouseEnterRef.current,
        onMarkerMouseLeave: onMarkerMouseLeaveRef.current,
      })

      setMarkerLookup(lookup)
      mapManager.setClusteredMarkerLayer(MAP_MARKER_LAYERS.orders, markers, {
        radius: ORDER_CLUSTER_RADIUS_PX,
        maxZoom: ORDER_CLUSTER_MAX_ZOOM,
      })
      mapManager.setMarkerLayerVisibility(MAP_MARKER_LAYERS.orders, visibleRef.current)
      fetchedBoundsRef.current = currentBounds
      fetchedQueryKeyRef.current = currentQueryKey
      lastSuccessfulOrderMarkerRequestKey = requestKey
    } catch {
      if (requestVersion === requestVersionRef.current) {
        fetchedBoundsRef.current = null
      }
    }
  }, [mapManager, setMarkerLookup])

  const scheduleRefresh = useCallback(() => {
    if (debounceRef.current != null) {
      return
    }

    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = null
      void refreshMarkers()
    }, DEBOUNCE_MS)
  }, [refreshMarkers])

  useEffect(() => {
    const unsubscribe = mapManager.subscribeBoundsChanged((bounds) => {
      boundsRef.current = bucketBounds(bounds)
      scheduleRefresh()
    })

    return () => {
      unsubscribe()
      if (debounceRef.current != null) {
        window.clearTimeout(debounceRef.current)
      }
    }
  }, [
    mapManager,
    refreshMarkers,
    scheduleRefresh,
  ])

  useEffect(() => {
    fetchedBoundsRef.current = null
    fetchedQueryKeyRef.current = null
    lastSuccessfulOrderMarkerRequestKey = null

    if (debounceRef.current != null) {
      window.clearTimeout(debounceRef.current)
    }
    debounceRef.current = null
    scheduleRefresh()

    return () => {
      if (debounceRef.current != null) {
        window.clearTimeout(debounceRef.current)
      }
    }
  }, [normalizedQuery, refreshMarkers, scheduleRefresh])

  useEffect(() => {
    const previousClientIds = previousBootstrapOrderClientIdsRef.current
    previousBootstrapOrderClientIdsRef.current = bootstrapOrderClientIds

    if (!visible || !refreshEnabled || !previousClientIds) {
      return
    }

    const currentClientIdSet = new Set(bootstrapOrderClientIds)
    const removedClientIds = previousClientIds.filter(
      (clientId) => !currentClientIdSet.has(clientId),
    )

    if (!removedClientIds.length) {
      return
    }

    const markerLookup = useOrderMapInteractionStore.getState().markerLookup
    const markerIds = Array.from(
      new Set(
        removedClientIds.map(
          (clientId) => markerLookup.markerIdByOrderClientId[clientId] ?? clientId,
        ),
      ),
    )

    if (markerIds.length) {
      mapManager.removeMarkerLayerEntries(MAP_MARKER_LAYERS.orders, markerIds)
      clearMarkerLookup()
    }
  }, [
    bootstrapOrderClientIds,
    clearMarkerLookup,
    mapManager,
    refreshEnabled,
    visible,
  ])

  useEffect(() => {
    if (!refreshEnabled) {
      return
    }

    fetchedBoundsRef.current = null
    fetchedQueryKeyRef.current = null
    lastSuccessfulOrderMarkerRequestKey = null
    scheduleRefresh()
  }, [bootstrapOrdersSignature, refreshEnabled, scheduleRefresh])

  useEffect(() => {
    if (refreshEnabled) {
      return
    }

    if (!visible) {
      mapManager.setMarkerLayerVisibility(MAP_MARKER_LAYERS.orders, false)
      return
    }

    if (bootstrapOrders.length === 0) {
      mapManager.clearClusteredMarkerLayer(MAP_MARKER_LAYERS.orders)
      clearMarkerLookup()
      hasBootstrappedRef.current = false
      return
    }

    const { markers, lookup } = buildOrderMarkers({
      orders: bootstrapOrders,
      markerClassName,
      onMarkerClick,
      onGroupMarkerClick,
      onGroupMarkerMouseEnter,
      onGroupMarkerMouseLeave,
      onMarkerClientIdsMouseEnter,
      onMarkerClientIdsMouseLeave,
      onMarkerMouseEnter,
      onMarkerMouseLeave,
    })

    setMarkerLookup(lookup)
    mapManager.setClusteredMarkerLayer(MAP_MARKER_LAYERS.orders, markers, {
      radius: ORDER_CLUSTER_RADIUS_PX,
      maxZoom: ORDER_CLUSTER_MAX_ZOOM,
    })
    mapManager.setMarkerLayerVisibility(MAP_MARKER_LAYERS.orders, true)

    hasBootstrappedRef.current = true
  }, [
    bootstrapOrders,
    clearMarkerLookup,
    mapManager,
    markerClassName,
    onGroupMarkerClick,
    onGroupMarkerMouseEnter,
    onGroupMarkerMouseLeave,
    onMarkerClientIdsMouseEnter,
    onMarkerClientIdsMouseLeave,
    onMarkerClick,
    onMarkerMouseEnter,
    onMarkerMouseLeave,
    refreshEnabled,
    setMarkerLookup,
    visible,
  ])

  useEffect(() => {
    if (!visible) {
      mapManager.setMarkerLayerVisibility(MAP_MARKER_LAYERS.orders, false)
      return
    }

    mapManager.setMarkerLayerVisibility(MAP_MARKER_LAYERS.orders, true)
  }, [mapManager, visible])

  useEffect(() => () => {
    clearMarkerLookup()
  }, [clearMarkerLookup])
}
