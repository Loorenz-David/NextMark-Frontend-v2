import { useEffect, useMemo, useRef } from 'react'
import type { MapMarker } from '../domain/entities/MapMarker'
import type { MapRoute } from '../domain/entities/MapRoute'
import type { Coordinates, MapConfig } from '../domain/types'
import { useMap } from '../hooks/useMap'

type MapMarkerLayer = {
  layerId: string
  markers: MapMarker[]
}

type MapViewProps = {
  markers: MapMarker[]
  route: MapRoute | null
  markerLayers?: MapMarkerLayer[]
  selectedMarkerId?: string | null
  hoveredMarkerId?: string | null
  focusCoordinates?: Coordinates | null
  focusRequestKey?: number
  options?: MapConfig
  className?: string
}

function buildMarkerSignature(markers: MapMarker[]) {
  return markers.map((marker) => [
    marker.id,
    marker.coordinates.lat,
    marker.coordinates.lng,
    marker.markerColor ?? '',
    marker.status ?? '',
    marker.sequence ?? '',
    marker.label ?? '',
    marker.className ?? '',
    marker.interactionVariant ?? '',
    marker.iconName ?? '',
  ].join(':')).join('|')
}

function buildLayerSignature(markerLayers: MapMarkerLayer[]) {
  return markerLayers.map((layer) => `${layer.layerId}[${buildMarkerSignature(layer.markers)}]`).join('|')
}

function buildRouteSignature(route: MapRoute | null) {
  if (!route) {
    return 'null'
  }

  return route.segments.map((segment) => `${segment.state}:${segment.path}`).join('|')
}

export function MapView({
  markers,
  route,
  markerLayers = [],
  selectedMarkerId,
  hoveredMarkerId,
  focusCoordinates,
  focusRequestKey,
  options,
  className,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const lastMarkersSignatureRef = useRef<string | null>(null)
  const lastMarkerLayersSignatureRef = useRef<string | null>(null)
  const lastRouteSignatureRef = useRef<string | null>(null)
  const {
    initialize,
    showMarkers,
    setMarkerLayer,
    showRoute,
    setSelectedMarker,
    setHoveredMarker,
    focusCoordinates: focusMapCoordinates,
  } = useMap(options)

  const markersSignature = useMemo(() => buildMarkerSignature(markers), [markers])
  const markerLayersSignature = useMemo(() => buildLayerSignature(markerLayers), [markerLayers])
  const routeSignature = useMemo(() => buildRouteSignature(route), [route])

  useEffect(() => {
    void initialize(containerRef.current, options)
  }, [initialize, options])

  useEffect(() => {
    if (lastMarkersSignatureRef.current === markersSignature) {
      return
    }

    lastMarkersSignatureRef.current = markersSignature
    showMarkers(markers)
  }, [markers, markersSignature, showMarkers])

  useEffect(() => {
    if (lastRouteSignatureRef.current === routeSignature) {
      return
    }

    lastRouteSignatureRef.current = routeSignature
    showRoute(route)
  }, [route, routeSignature, showRoute])

  useEffect(() => {
    if (lastMarkerLayersSignatureRef.current === markerLayersSignature) {
      return
    }

    lastMarkerLayersSignatureRef.current = markerLayersSignature
    markerLayers.forEach((layer) => {
      setMarkerLayer(layer.layerId, layer.markers)
    })
  }, [markerLayers, markerLayersSignature, setMarkerLayer])

  useEffect(() => {
    setSelectedMarker(selectedMarkerId ?? null)
  }, [selectedMarkerId, setSelectedMarker])

  useEffect(() => {
    setHoveredMarker(hoveredMarkerId ?? null)
  }, [hoveredMarkerId, setHoveredMarker])

  useEffect(() => {
    if (!focusCoordinates || focusRequestKey === undefined) {
      return
    }

    focusMapCoordinates(focusCoordinates)
  }, [focusCoordinates, focusMapCoordinates, focusRequestKey])

  return <div ref={containerRef} className={className} />
}
