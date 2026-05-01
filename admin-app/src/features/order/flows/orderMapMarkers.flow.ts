import { useEffect } from 'react'

import { MAP_MARKER_LAYERS, type MapOrder } from '@/shared/map'
import { useMapManager } from '@/shared/resource-manager/useResourceManager'
import { buildOrderAddressGroups } from '@/features/order/domain/orderAddressGroup.flow'
import {
  resolveOrderGroupOperationBadgeDirections,
  resolveOrderOperationBadgeDirections,
} from '@/features/order/domain/orderOperationBadgeDirections'
import {
  useOrderMapInteractionActions,
} from '@/features/order/store/orderMapInteractionHooks.store'
import type { OrderMarkerGroupLookup } from '@/features/order/store/orderMapInteraction.store'

import type { Order } from '../types/order'

type BuildOrderMarkersParams = {
  orders: Order[]
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

type UseOrderMapMarkersFlowParams = BuildOrderMarkersParams & {
  visible: boolean
}

const UNSCHEDULED_COLOR = '#8b8b8b'
const GOLDEN_ANGLE = 137.508
const ORDER_GROUP_MARKER_PREFIX = 'order_group_marker:'
const ORDER_CLUSTER_RADIUS_PX = 80
const ORDER_CLUSTER_MAX_ZOOM = 16
const planColorCache = new Map<number, string>()

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

const hasValidCoordinates = (order: Order) => {
  const coordinates = order.client_address?.coordinates
  return (
    coordinates &&
    typeof coordinates.lat === 'number' &&
    typeof coordinates.lng === 'number' &&
    Number.isFinite(coordinates.lat) &&
    Number.isFinite(coordinates.lng)
  )
}

type OrderMarkerBuildResult = {
  markers: MapOrder[]
  lookup: OrderMarkerGroupLookup
}

export const buildOrderMarkers = ({
  orders,
  markerClassName,
  onMarkerClick,
  onGroupMarkerClick,
  onGroupMarkerMouseEnter,
  onGroupMarkerMouseLeave,
  onMarkerClientIdsMouseEnter,
  onMarkerClientIdsMouseLeave,
  onMarkerMouseEnter,
  onMarkerMouseLeave,
}: BuildOrderMarkersParams): OrderMarkerBuildResult => {
  const groupedOrders = buildOrderAddressGroups(orders)
  const markers: MapOrder[] = []

  const markerOrderClientIdsByMarkerId: Record<string, string[]> = {}
  const primaryOrderClientIdByMarkerId: Record<string, string> = {}
  const markerIdByOrderClientId: Record<string, string> = {}
  const ordersByClientId = new Map(orders.map((order) => [order.client_id, order]))
  const resolveHoverOrders = (clientIds: string[]) =>
    clientIds
      .map((clientId) => ordersByClientId.get(clientId) ?? null)
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

  groupedOrders.forEach((group) => {
    const markerRepresentative = group.orders.find(hasValidCoordinates)
    if (!markerRepresentative || !markerRepresentative.client_address?.coordinates) {
      return
    }

    const markerId = group.orders.length > 1
      ? `${ORDER_GROUP_MARKER_PREFIX}${group.key}`
      : markerRepresentative.client_id

    const orderClientIds = group.orders.map((order) => order.client_id)
    const primaryOrder = markerRepresentative
    const markerAnchorOrders = group.orders

    markerOrderClientIdsByMarkerId[markerId] = orderClientIds
    primaryOrderClientIdByMarkerId[markerId] = primaryOrder.client_id
    orderClientIds.forEach((clientId) => {
      markerIdByOrderClientId[clientId] = markerId
    })

    markers.push({
      id: markerId,
      coordinates: {
        lat: markerRepresentative.client_address.coordinates.lat,
        lng: markerRepresentative.client_address.coordinates.lng,
      },
      markerColor: getOrderMarkerColor(primaryOrder),
      route_plan_id: primaryOrder.delivery_plan_id ?? null,
      className: markerClassName,
      interactionVariant: 'order',
      label: group.orders.length > 1 ? String(group.orders.length) : undefined,
      operationBadgeDirections:
        group.orders.length > 1
          ? resolveOrderGroupOperationBadgeDirections(
            group.orders.map((order) => order.operation_type),
          )
          : resolveOrderOperationBadgeDirections(primaryOrder.operation_type),
      hoverIds: orderClientIds,
      onHoverIdsEnter:
        onMarkerClientIdsMouseEnter || onGroupMarkerMouseEnter || onMarkerMouseEnter
          ? handleHoverIdsEnter
          : undefined,
      onHoverIdsLeave:
        onMarkerClientIdsMouseLeave || onGroupMarkerMouseLeave || onMarkerMouseLeave
          ? handleHoverIdsLeave
          : undefined,
      onClick: (event: MouseEvent) => {
        if (group.orders.length > 1 && onGroupMarkerClick) {
          const markerAnchorEl = event.currentTarget as HTMLElement | null
          if (markerAnchorEl) {
            onGroupMarkerClick({
              event,
              markerId,
              markerAnchorEl,
              orders: markerAnchorOrders,
              primaryOrder,
            })
            return
          }
        }
        onMarkerClick(event, primaryOrder)
      },
      onMouseEnter:
        group.orders.length > 1 && onGroupMarkerMouseEnter
          ? (event: MouseEvent) =>
              onGroupMarkerMouseEnter(event, markerAnchorOrders, primaryOrder)
          : onMarkerMouseEnter
            ? (event: MouseEvent) => onMarkerMouseEnter(event, primaryOrder)
            : undefined,
      onMouseLeave:
        group.orders.length > 1 && onGroupMarkerMouseLeave
          ? () => onGroupMarkerMouseLeave()
          : onMarkerMouseLeave
            ? (event: MouseEvent) => onMarkerMouseLeave(event, primaryOrder)
            : undefined,
    })
  })

  return {
    markers,
    lookup: {
      markerOrderClientIdsByMarkerId,
      primaryOrderClientIdByMarkerId,
      markerIdByOrderClientId,
    },
  }
}

export const useOrderMapMarkersFlow = ({
  orders,
  markerClassName,
  onMarkerClick,
  onGroupMarkerClick,
  onGroupMarkerMouseEnter,
  onGroupMarkerMouseLeave,
  onMarkerClientIdsMouseEnter,
  onMarkerClientIdsMouseLeave,
  onMarkerMouseEnter,
  onMarkerMouseLeave,
  visible,
}: UseOrderMapMarkersFlowParams) => {
  const mapManager = useMapManager()
  const { setMarkerLookup, clearMarkerLookup } = useOrderMapInteractionActions()

  useEffect(() => {
    const { markers, lookup } = buildOrderMarkers({
      orders,
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
    mapManager.setMarkerLayerVisibility(MAP_MARKER_LAYERS.orders, visible)

    if (visible) {
      mapManager.showRoute(null)
    }
  }, [
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
    orders,
    setMarkerLookup,
    visible,
  ])

  useEffect(() => () => {
    clearMarkerLookup()
  }, [clearMarkerLookup])
}
