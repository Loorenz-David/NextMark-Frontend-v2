import { useCallback, useEffect, useMemo, useRef } from 'react'

import { MAP_MARKER_LAYERS, type MapOrder, type MapBounds } from '@/shared/map'
import { useMapManager } from '@/shared/resource-manager/useResourceManager'

import { useListOrderMapMarkers } from '../api/orderApi'
import type { Order } from '../types/order'
import type { OrderQueryStoreFilters } from '../types/orderMeta'
import { orderStringFilters } from '../domain/orderFilterConfig'
import { normalizeQuery } from '@shared-utils'
import { buildOrderMarkers } from './orderMapMarkers.flow'
import {
  resolveOrderGroupOperationBadgeDirections,
  resolveOrderOperationBadgeDirections,
} from '../domain/orderOperationBadgeDirections'
import { useUpsertOrdersStore } from '../store/orderHooks.store'
import { useOrderMapInteractionActions } from '../store/orderMapInteractionHooks.store'
import type { OrderMarkerGroupLookup } from '../store/orderMapInteraction.store'

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
  markerClassName,
  onMarkerClick,
  onGroupMarkerClick,
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
  markerClassName: string
  onMarkerClick: (event: MouseEvent, order: Order) => void
  onGroupMarkerClick?: (params: {
    event: MouseEvent
    markerId: string
    markerAnchorEl: HTMLElement
    orders: Order[]
    primaryOrder: Order
  }) => void
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

  markers.forEach((marker) => {
    const groupedOrders = marker.order_client_ids
      .map((clientId) => ordersByClientId[clientId])
      .filter((order): order is Order => Boolean(order))

    const primaryOrder = ordersByClientId[marker.primary_order_client_id]
    if (!primaryOrder || groupedOrders.length === 0) {
      return
    }

    markerOrderClientIdsByMarkerId[marker.id] = marker.order_client_ids
    primaryOrderClientIdByMarkerId[marker.id] = primaryOrder.client_id
    marker.order_client_ids.forEach((clientId) => {
      markerIdByOrderClientId[clientId] = marker.id
    })

    builtMarkers.push({
      id: marker.id,
      coordinates: marker.coordinates,
      markerColor: getOrderMarkerColor(primaryOrder),
      route_plan_id: primaryOrder.delivery_plan_id ?? null,
      className: markerClassName,
      interactionVariant: 'order',
      label: marker.count > 1 ? String(marker.count) : undefined,
      operationBadgeDirections:
        marker.count > 1
          ? resolveOrderGroupOperationBadgeDirections(groupedOrders.map((order) => order.operation_type))
          : resolveOrderOperationBadgeDirections(primaryOrder.operation_type),
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
      onMouseEnter: onMarkerMouseEnter
        ? (event: MouseEvent) => onMarkerMouseEnter(event, primaryOrder)
        : undefined,
      onMouseLeave: onMarkerMouseLeave
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

export const useOrderMapDataFlow = ({
  query,
  visible,
  refreshEnabled,
  bootstrapOrders,
  markerClassName,
  onMarkerClick,
  onGroupMarkerClick,
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

  const normalizedQuery = useMemo(() => normalizeQuery({
    q: query.q,
    filters: query.filters,
  }, orderStringFilters), [query.filters, query.q])

  const normalizedQueryRef = useRef(normalizedQuery)
  const visibleRef = useRef(visible)
  const refreshEnabledRef = useRef(refreshEnabled)
  const markerClassNameRef = useRef(markerClassName)
  const onMarkerClickRef = useRef(onMarkerClick)
  const onGroupMarkerClickRef = useRef(onGroupMarkerClick)
  const onMarkerMouseEnterRef = useRef(onMarkerMouseEnter)
  const onMarkerMouseLeaveRef = useRef(onMarkerMouseLeave)
  const listOrderMapMarkersRef = useRef(listOrderMapMarkers)
  const upsertOrdersStoreRef = useRef(upsertOrdersStore)

  useEffect(() => {
    normalizedQueryRef.current = normalizedQuery
    visibleRef.current = visible
    refreshEnabledRef.current = refreshEnabled
    markerClassNameRef.current = markerClassName
    onMarkerClickRef.current = onMarkerClick
    onGroupMarkerClickRef.current = onGroupMarkerClick
    onMarkerMouseEnterRef.current = onMarkerMouseEnter
    onMarkerMouseLeaveRef.current = onMarkerMouseLeave
    listOrderMapMarkersRef.current = listOrderMapMarkers
    upsertOrdersStoreRef.current = upsertOrdersStore
  }, [
    listOrderMapMarkers,
    markerClassName,
    normalizedQuery,
    onGroupMarkerClick,
    onMarkerClick,
    onMarkerMouseEnter,
    onMarkerMouseLeave,
    refreshEnabled,
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

      upsertOrdersStoreRef.current(payload.order)

      const { markers, lookup } = buildMarkersFromResponse({
        markers: payload.markers,
        ordersByClientId: payload.order.byClientId,
        markerClassName: markerClassNameRef.current,
        onMarkerClick: onMarkerClickRef.current,
        onGroupMarkerClick: onGroupMarkerClickRef.current,
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
      onMarkerMouseEnter,
      onMarkerMouseLeave,
    })

    setMarkerLookup(lookup)
    mapManager.setClusteredMarkerLayer(MAP_MARKER_LAYERS.orders, markers, {
      radius: ORDER_CLUSTER_RADIUS_PX,
      maxZoom: ORDER_CLUSTER_MAX_ZOOM,
    })
    mapManager.setMarkerLayerVisibility(MAP_MARKER_LAYERS.orders, true)

    if (!hasBootstrappedRef.current) {
      hasBootstrappedRef.current = true
      mapManager.reframeToVisibleArea()
    }
  }, [
    bootstrapOrders,
    clearMarkerLookup,
    mapManager,
    markerClassName,
    onGroupMarkerClick,
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
