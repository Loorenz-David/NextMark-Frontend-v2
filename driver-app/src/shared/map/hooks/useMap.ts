import { useCallback, useEffect, useMemo, useState } from 'react'
import { GoogleMapAdapter } from '../infrastructure/GoogleMapAdapter'
import { MapController } from '../services/MapController'
import type { MapMarker } from '../domain/entities/MapMarker'
import type { MapRoute } from '../domain/entities/MapRoute'
import type {
  Coordinates,
  MapBounds,
  MapBridge,
  MapConfig,
  MapViewportInsets,
  SetMarkerLayerOptions,
} from '../domain/types'

export const useMap = (options?: MapConfig): MapBridge => {
  const [controller] = useState(() => new MapController(new GoogleMapAdapter()))

  const initialize = useCallback(async (container: HTMLElement | null, overrideOptions?: MapConfig) => {
    if (!container) {
      return
    }

    const baseOptions = overrideOptions ?? options

    await controller.initialize(container, {
      ...baseOptions,
      mapId: baseOptions?.mapId ?? import.meta.env.VITE_GOOGLE_MAPS_MAP_ID_LIGHT,
      zoom: baseOptions?.zoom ?? 11,
    })
  }, [controller, options])

  const showMarkers = useCallback((markers: MapMarker[]) => {
    controller.showMarkers(markers)
  }, [controller])

  const setMarkerLayer = useCallback((layerId: string, markers: MapMarker[], setOptions?: SetMarkerLayerOptions) => {
    controller.setMarkerLayer(layerId, markers, setOptions)
  }, [controller])

  const setMarkerLayerVisibility = useCallback((layerId: string, visible: boolean) => {
    controller.setMarkerLayerVisibility(layerId, visible)
  }, [controller])

  const clearMarkerLayer = useCallback((layerId: string) => {
    controller.clearMarkerLayer(layerId)
  }, [controller])

  const showRoute = useCallback((route: MapRoute | null) => {
    controller.showRoute(route)
  }, [controller])

  const selectMarker = useCallback((id: string | number) => {
    controller.selectMarker(id)
  }, [controller])

  const setSelectedMarker = useCallback((id: string | null) => {
    controller.setSelectedMarker(id)
  }, [controller])

  const setHoveredMarker = useCallback((id: string | null) => {
    controller.setHoveredMarker(id)
  }, [controller])

  const setViewportInsets = useCallback((insets: MapViewportInsets) => {
    controller.setViewportInsets(insets)
  }, [controller])

  const focusCoordinates = useCallback((coordinates: Coordinates, zoom?: number) => {
    controller.focusCoordinates(coordinates, zoom)
  }, [controller])

  const reframeToVisibleArea = useCallback(() => {
    controller.reframeToVisibleArea()
  }, [controller])

  const subscribeBoundsChanged = useCallback(
    (callback: (bounds: MapBounds | null) => void) => controller.subscribeBoundsChanged(callback),
    [controller],
  )

  const resize = useCallback(() => {
    controller.resize()
  }, [controller])

  useEffect(() => {
    return () => {
      controller.destroy()
    }
  }, [controller])

  return useMemo(() => ({
    initialize,
    showMarkers,
    setMarkerLayer,
    setMarkerLayerVisibility,
    clearMarkerLayer,
    showRoute,
    selectMarker,
    setSelectedMarker,
    setHoveredMarker,
    setViewportInsets,
    focusCoordinates,
    reframeToVisibleArea,
    subscribeBoundsChanged,
    resize,
  }), [
    clearMarkerLayer,
    focusCoordinates,
    initialize,
    reframeToVisibleArea,
    resize,
    selectMarker,
    setHoveredMarker,
    setMarkerLayer,
    setMarkerLayerVisibility,
    setSelectedMarker,
    setViewportInsets,
    showMarkers,
    showRoute,
    subscribeBoundsChanged,
  ])
}
