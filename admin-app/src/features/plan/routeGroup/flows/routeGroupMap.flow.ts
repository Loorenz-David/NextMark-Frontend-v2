import { useCallback, useEffect, useRef } from 'react'

import type { Order } from '@/features/order/types/order'
import type { RouteSolutionStop } from '@/features/plan/routeGroup/types/routeSolutionStop'
import type { RouteSolution } from '@/features/plan/routeGroup/types/routeSolution'
import { MAP_MARKER_LAYERS, type MapOrder } from '@/shared/map'
import { useMapManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'
import type { BoundaryLocationMeta } from '@/features/plan/routeGroup/domain/getRouteGroupBoundaryLocations'
import { buildRouteGroupStopAddressGroups } from '@/features/plan/routeGroup/domain/routeGroupAddressGroup.flow'
import {
  resolveOrderGroupOperationBadgeDirections,
  resolveOrderOperationBadgeDirections,
} from '@/features/order/domain/orderOperationBadgeDirections'
import {
  useRouteGroupMapInteractionActions,
} from '@/features/plan/routeGroup/store/routeGroupMapInteractionHooks.store'
import type { RouteGroupMarkerGroupLookup } from '@/features/plan/routeGroup/store/routeGroupMapInteraction.store'
import {
  buildRouteGroupDriverLocationMarkers,
  selectDriverLivePositions,
  selectDriverLiveVisibility,
  useDriverLiveMarkerOverlayStore,
  useDriverLiveStore,
  useDriverLiveVisibilityStore,
} from '@/realtime/driverLive'
import { useShallow } from 'zustand/react/shallow'

type RouteGroupMapParams = {
  orders: Order[]
  stopByOrderId: Map<number, RouteSolutionStop>
  selectedRouteSolution: RouteSolution | null
  isActive: boolean
  boundaryLocations: {
    start: BoundaryLocationMeta
    end: BoundaryLocationMeta
  }
}

const LOCAL_DELIVERY_GROUP_MARKER_PREFIX = 'route_stop_group_marker:'
const ROUTE_GROUP_CLUSTER_RADIUS_PX = 60
const ROUTE_GROUP_CLUSTER_MAX_ZOOM = 16

const areSameCoordinates = (
  left: { lat: number; lng: number } | null | undefined,
  right: { lat: number; lng: number } | null | undefined,
) =>
  left?.lat === right?.lat && left?.lng === right?.lng

const hasValidCoordinates = (order: Order): boolean => {
  const coordinates = order.client_address?.coordinates
  if (!coordinates) return false
  return (
    typeof coordinates.lat === 'number'
    && typeof coordinates.lng === 'number'
    && Number.isFinite(coordinates.lat)
    && Number.isFinite(coordinates.lng)
  )
}

const buildStopOrderLabel = (stopOrder: number | null | undefined): string | undefined =>
  typeof stopOrder === 'number' ? String(stopOrder) : undefined

const buildStopRangeLabel = (firstStopOrder: number | null, lastStopOrder: number | null): string | undefined => {
  if (typeof firstStopOrder !== 'number' || typeof lastStopOrder !== 'number') return undefined
  return firstStopOrder === lastStopOrder
    ? String(firstStopOrder)
    : `${firstStopOrder} to ${lastStopOrder}`
}

const serializeLookup = (lookup: RouteGroupMarkerGroupLookup): string => {
  const markerIds = Object.keys(lookup.markerOrderClientIdsByMarkerId).sort()
  const parts: string[] = []

  markerIds.forEach((markerId) => {
    const orderClientIds = lookup.markerOrderClientIdsByMarkerId[markerId] ?? []
    const primary = lookup.primaryOrderClientIdByMarkerId[markerId] ?? ''
    parts.push(`${markerId}|${primary}|${orderClientIds.join(',')}`)
  })

  return parts.join('::')
}

export const resolveRouteGroupOperationBadgeDirections = (order: Order) =>
  resolveOrderOperationBadgeDirections(order.operation_type)

export const resolveRouteGroupGroupOperationBadgeDirections = (
  entries: Array<{ order: Order }>,
) =>
  resolveOrderGroupOperationBadgeDirections(
    entries.map((entry) => entry.order.operation_type),
  )


export const useRouteGroupMapFlow = ({
  orders,
  stopByOrderId,
  selectedRouteSolution,
  isActive,
  boundaryLocations, 
}: RouteGroupMapParams) => {
  const mapManager = useMapManager()
  const sectionManager = useSectionManager()
  const lookupSignatureRef = useRef<string>('')
  const routeSignatureRef = useRef<string>('')
  const routeScopeRef = useRef<string>('')
  const previousIsActiveRef = useRef(isActive)
  const { setMarkerLookup, clearMarkerLookup, openGroupOverlay, closeGroupOverlay } = useRouteGroupMapInteractionActions()
  const liveDriverPositions = useDriverLiveStore(useShallow(selectDriverLivePositions))
  const isDriverLiveVisible = useDriverLiveVisibilityStore(selectDriverLiveVisibility)

  const handleClickMarker = useCallback((order: Order) => {
    const key = "order.details"
    const payload = {
      mode: "edit",
      clientId: order.client_id,
      openSource: "marker",
      headerBehavior: "order-main-context",
    }
    const parentParams = { borderLeft: 'rgb(var(--color-light-blue-r),0.7)' }
    const latestOpenEntry = sectionManager
      .getSnapshot()
      .filter((entry) => entry.key === key && !entry.isClosing)
      .at(-1)

    const openPayload = latestOpenEntry?.payload as
      | { clientId?: string | null }
      | undefined

    if (openPayload?.clientId === order.client_id) {
      return
    }

    if (latestOpenEntry) {
      sectionManager.atomicOpenClose({ key, payload, parentParams }, latestOpenEntry.id)
      return
    }

    sectionManager.open({
      key,
      payload,
      parentParams,
    })
  }, [sectionManager])
  useEffect(() => {
    const mapOrders: MapOrder[] = []
    const boundaryMarkers: MapOrder[] = []
    const markerOrderClientIdsByMarkerId: Record<string, string[]> = {}
    const primaryOrderClientIdByMarkerId: Record<string, string> = {}
    const markerIdByOrderClientId: Record<string, string> = {}
    const solutionClientId = selectedRouteSolution?.client_id ?? 'unknown'
    
    const startCoordinates = boundaryLocations.start.location?.coordinates ?? null
    const endCoordinates = boundaryLocations.end.location?.coordinates ?? null

    if (areSameCoordinates(startCoordinates, endCoordinates) && startCoordinates) {
      const combinedMarker = buildCombinedStartEndMarker({
        idPrefix: `route-start-end-${solutionClientId}`,
        boundary: boundaryLocations.start,
        onClick: handleClickStartEndMarker,
      })
      if (combinedMarker) {
        boundaryMarkers.push(combinedMarker)
      }
    } else {
      const startMarker = buildStartEndMarker({
        status: 'start',
        boundary: boundaryLocations.start,
        idPrefix: `route-start-${solutionClientId}`,
        onClick: handleClickStartEndMarker,
      })
      if (startMarker) {
        boundaryMarkers.push(startMarker)
      }

      const endMarker = buildStartEndMarker({
        status: 'end',
        idPrefix: `route-end-${solutionClientId}`,
        boundary: boundaryLocations.end,
        onClick: handleClickStartEndMarker,
      })
      if (endMarker) {
        boundaryMarkers.push(endMarker)
      }
    }

    const stopEntries = orders
      .map((order) => ({
        order,
        stop: order.id != null ? stopByOrderId.get(order.id) : undefined,
      }))
      .filter(
        (entry): entry is { order: Order; stop: RouteSolutionStop } =>
          Boolean(entry.stop) && typeof entry.stop?.stop_order === 'number',
      )
      .sort(
        (left, right) =>
          (left.stop.stop_order ?? Number.POSITIVE_INFINITY)
          - (right.stop.stop_order ?? Number.POSITIVE_INFINITY),
      )

    const groupedStops = buildRouteGroupStopAddressGroups(stopEntries)
    const representedClientIds = new Set<string>()

    groupedStops.forEach((group) => {
      const markerRepresentative = group.entries.find((entry) => hasValidCoordinates(entry.order))
      if (!markerRepresentative?.order.client_address?.coordinates) {
        return
      }

      const isGroupedMarker = group.entries.length > 1
      const markerId = isGroupedMarker
        ? `${LOCAL_DELIVERY_GROUP_MARKER_PREFIX}${group.key}`
        : markerRepresentative.order.client_id
      const orderClientIds = group.entries.map((entry) => entry.order.client_id)

      markerOrderClientIdsByMarkerId[markerId] = orderClientIds
      primaryOrderClientIdByMarkerId[markerId] = markerRepresentative.order.client_id
      orderClientIds.forEach((clientId) => {
        markerIdByOrderClientId[clientId] = markerId
        representedClientIds.add(clientId)
      })

      mapOrders.push({
        id: markerId,
        onClick: (event: MouseEvent) => {
          if (isGroupedMarker) {
            const markerAnchorEl = event.currentTarget as HTMLElement | null
            if (markerAnchorEl) {
              openGroupOverlay({
                markerId,
                markerAnchorEl,
                orderClientIds,
              })
              return
            }
          }
          handleClickMarker(markerRepresentative.order)
        },
        coordinates: markerRepresentative.order.client_address.coordinates,
        markerColor: '#0034c1',
        route_plan_id: markerRepresentative.order.delivery_plan_id ?? null,
        label: isGroupedMarker
          ? buildStopRangeLabel(group.firstStopOrder, group.lastStopOrder)
          : buildStopOrderLabel(markerRepresentative.stop.stop_order),
        operationBadgeDirections: isGroupedMarker
          ? resolveRouteGroupGroupOperationBadgeDirections(group.entries)
          : resolveRouteGroupOperationBadgeDirections(markerRepresentative.order),
      })
    })

    orders
      .filter((order) => !representedClientIds.has(order.client_id))
      .forEach((order) => {
        if (!hasValidCoordinates(order) || !order.client_address?.coordinates) return

        const markerId = order.client_id
        markerOrderClientIdsByMarkerId[markerId] = [order.client_id]
        primaryOrderClientIdByMarkerId[markerId] = order.client_id
        markerIdByOrderClientId[order.client_id] = markerId

        const stop = order.id != null ? stopByOrderId.get(order.id) : undefined
        mapOrders.push({
          id: markerId,
          onClick: () => handleClickMarker(order),
          coordinates: order.client_address.coordinates,
          markerColor: '#0034c1',
          route_plan_id: order.delivery_plan_id ?? null,
          operationBadgeDirections: resolveRouteGroupOperationBadgeDirections(order),
          ...(typeof stop?.stop_order === 'number' ? { label: String(stop.stop_order) } : {}),
        })
      })

    const lookup: RouteGroupMarkerGroupLookup = {
      markerOrderClientIdsByMarkerId,
      primaryOrderClientIdByMarkerId,
      markerIdByOrderClientId,
    }
    const nextLookupSignature = serializeLookup(lookup)
    if (lookupSignatureRef.current !== nextLookupSignature) {
      lookupSignatureRef.current = nextLookupSignature
      setMarkerLookup(lookup)
    }

    mapManager.setClusteredMarkerLayer(MAP_MARKER_LAYERS.routeGroup, mapOrders, {
      radius: ROUTE_GROUP_CLUSTER_RADIUS_PX,
      maxZoom: ROUTE_GROUP_CLUSTER_MAX_ZOOM,
    })
    mapManager.setMarkerLayer(MAP_MARKER_LAYERS.routeGroupBoundary, boundaryMarkers)
    mapManager.setMarkerLayerVisibility(MAP_MARKER_LAYERS.routeGroup, isActive)
    mapManager.setMarkerLayerVisibility(MAP_MARKER_LAYERS.routeGroupBoundary, isActive)

    const routeSegments = buildRouteSegments(orders, stopByOrderId, selectedRouteSolution)
    const nextRouteScope = selectedRouteSolution?.id != null
      ? String(selectedRouteSolution.id)
      : selectedRouteSolution?.client_id ?? ''
    if (routeScopeRef.current !== nextRouteScope) {
      routeScopeRef.current = nextRouteScope
      routeSignatureRef.current = ''
    }

    const nextRouteSignature = isActive && routeSegments.length
      ? routeSegments.join('::')
      : ''
    if (nextRouteSignature) {
      if (routeSignatureRef.current !== nextRouteSignature) {
        const shouldFitBounds = routeSignatureRef.current === ''
        routeSignatureRef.current = nextRouteSignature
        mapManager.showRoute({ path: routeSegments, fitBounds: shouldFitBounds })
      }
    } else if (routeSignatureRef.current) {
      routeSignatureRef.current = ''
      mapManager.showRoute(null)
    }

  }, [
    boundaryLocations,
    isActive,
    mapManager,
    openGroupOverlay,
    orders,
    selectedRouteSolution,
    setMarkerLookup,
    stopByOrderId,
    handleClickMarker,
  ])

  useEffect(() => {
    if (!isActive) {
      mapManager.clearMarkerLayer(MAP_MARKER_LAYERS.driverLiveRouteGroup)
      useDriverLiveMarkerOverlayStore.getState().closeOverlay()
      return
    }

    const selectedDriverId = selectedRouteSolution?.driver_id ?? null
    if (selectedDriverId == null) {
      mapManager.clearMarkerLayer(MAP_MARKER_LAYERS.driverLiveRouteGroup)
      useDriverLiveMarkerOverlayStore.getState().closeOverlay()
      return
    }

    const { openOverlay, closeOverlay } = useDriverLiveMarkerOverlayStore.getState()
    const driverMarkers = buildRouteGroupDriverLocationMarkers({
      positions: liveDriverPositions,
      selectedDriverId,
      onClick: () => undefined,
      onMouseEnter: (event, position) => {
        const markerAnchorEl = event.currentTarget as HTMLElement | null
        if (!markerAnchorEl) return

        openOverlay({
          markerId: `driver-live:route-group:${position.driver_id}`,
          markerAnchorEl,
          position,
        })
      },
      onMouseLeave: () => {
        closeOverlay()
      },
    })

    mapManager.setMarkerLayer(MAP_MARKER_LAYERS.driverLiveRouteGroup, driverMarkers)
    mapManager.setMarkerLayerVisibility(
      MAP_MARKER_LAYERS.driverLiveRouteGroup,
      isActive && isDriverLiveVisible,
    )
    if (!isDriverLiveVisible) {
      closeOverlay()
    }
  }, [
    isActive,
    isDriverLiveVisible,
    liveDriverPositions,
    mapManager,
    selectedRouteSolution?.driver_id,
  ])

  useEffect(() => {
    const wasActive = previousIsActiveRef.current
    previousIsActiveRef.current = isActive

    if (isActive) return
    mapManager.clearClusteredMarkerLayer(MAP_MARKER_LAYERS.routeGroup)
    mapManager.clearMarkerLayer(MAP_MARKER_LAYERS.routeGroupBoundary)
    mapManager.clearMarkerLayer(MAP_MARKER_LAYERS.driverLiveRouteGroup)
    mapManager.showRoute(null)
    routeSignatureRef.current = ''
    routeScopeRef.current = ''
    if (wasActive) {
      mapManager.reframeToVisibleArea()
    }
    closeGroupOverlay()
    useDriverLiveMarkerOverlayStore.getState().closeOverlay()
    lookupSignatureRef.current = ''
    clearMarkerLookup()
  }, [clearMarkerLookup, closeGroupOverlay, isActive, mapManager])

  useEffect(() => {
    return () => {
      mapManager.clearClusteredMarkerLayer(MAP_MARKER_LAYERS.routeGroup)
      mapManager.clearMarkerLayer(MAP_MARKER_LAYERS.routeGroupBoundary)
      mapManager.clearMarkerLayer(MAP_MARKER_LAYERS.driverLiveRouteGroup)
      mapManager.showRoute(null)
      routeSignatureRef.current = ''
      routeScopeRef.current = ''
      closeGroupOverlay()
      useDriverLiveMarkerOverlayStore.getState().closeOverlay()
      lookupSignatureRef.current = ''
      clearMarkerLookup()
    }
  }, [clearMarkerLookup, closeGroupOverlay, mapManager])
}



const handleClickStartEndMarker = () => {
  // Marker clicks for start/end are intentionally no-op for now.
}

export const buildStartEndMarker = ({
  status,
  idPrefix,
  boundary,
  onClick,
}: {
  status: 'start' | 'end'
  idPrefix: string
  boundary: BoundaryLocationMeta
  onClick: (e: MouseEvent) => void
}): MapOrder | null => {
  if (!boundary.location?.coordinates) return null

  const coordinates = boundary.location.coordinates
  if (typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') return null

  return {
    id: idPrefix,
    coordinates,
    status,
    onClick,
  }
}

export const buildCombinedStartEndMarker = ({
  idPrefix,
  boundary,
  onClick,
}: {
  idPrefix: string
  boundary: BoundaryLocationMeta
  onClick: (e: MouseEvent) => void
}): MapOrder | null => {
  if (!boundary.location?.coordinates) return null

  const coordinates = boundary.location.coordinates
  if (typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') return null

  return {
    id: idPrefix,
    coordinates,
    status: 'start_end',
    onClick,
  }
}


const buildRouteSegments = (
  orders: Order[],
  stopByOrderId: Map<number, RouteSolutionStop>,
  selectedRouteSolution: RouteSolution | null,
): string[] => {
  if (!selectedRouteSolution) return []

  const orderedStops = orders
    .map((order) => (order.id != null ? stopByOrderId.get(order.id) : undefined))
    .filter((stop): stop is RouteSolutionStop => !!stop && stop.stop_order != null)
    .sort((a, b) => (a.stop_order ?? Number.POSITIVE_INFINITY) - (b.stop_order ?? Number.POSITIVE_INFINITY))

  const path: string[] = []
  if (selectedRouteSolution.start_leg_polyline) {
    path.push(selectedRouteSolution.start_leg_polyline)
  }
  orderedStops.forEach((stop) => {
    if (stop.to_next_polyline) {
      path.push(stop.to_next_polyline)
    }
  })
  if (selectedRouteSolution.end_leg_polyline) {
    path.push(selectedRouteSolution.end_leg_polyline)
  }
  return path
}
