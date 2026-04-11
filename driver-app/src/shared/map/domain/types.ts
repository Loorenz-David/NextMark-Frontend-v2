import type { MapMarker } from './entities/MapMarker'
import type { MapRoute } from './entities/MapRoute'

export type Coordinates = {
  lat: number
  lng: number
}

export type MapViewportInsets = {
  top: number
  right: number
  bottom: number
  left: number
}

export type SetMarkerLayerOptions = {
  fitBounds?: boolean
}

export type MapBounds = {
  north: number
  south: number
  east: number
  west: number
}

export type MapConfig = {
  center?: Coordinates
  zoom?: number
  mapId?: string
  disableDefaultUI?: boolean
  gestureHandling?: 'auto' | 'cooperative' | 'greedy' | 'none'
}

export type MapBridge = {
  initialize: (container: HTMLElement | null, options?: MapConfig) => Promise<void>
  showMarkers: (markers: MapMarker[]) => void
  setMarkerLayer: (layerId: string, markers: MapMarker[], options?: SetMarkerLayerOptions) => void
  setMarkerLayerVisibility: (layerId: string, visible: boolean) => void
  clearMarkerLayer: (layerId: string) => void
  showRoute: (route: MapRoute | null) => void
  selectMarker: (id: number | string) => void
  setSelectedMarker: (id: string | null) => void
  setHoveredMarker: (id: string | null) => void
  setViewportInsets: (insets: MapViewportInsets) => void
  focusCoordinates: (coordinates: Coordinates, zoom?: number) => void
  reframeToVisibleArea: () => void
  subscribeBoundsChanged: (callback: (bounds: MapBounds | null) => void) => () => void
  resize: () => void
}

export interface MapAdapter {
  initialize: (container: HTMLElement, options?: MapConfig) => Promise<void>
  setLayerMarkers: (layerId: string, markers: MapMarker[], options?: SetMarkerLayerOptions) => void
  setLayerVisibility: (layerId: string, visible: boolean) => void
  clearLayer: (layerId: string) => void
  clearMarkers: () => void
  drawRoute: (route: MapRoute | null) => void
  selectMarker: (id: string) => void
  setSelectedMarker: (id: string | null) => void
  setHoveredMarker: (id: string | null) => void
  setViewportInsets: (insets: MapViewportInsets) => void
  focusCoordinates: (coordinates: Coordinates, zoom?: number) => void
  reframeToVisibleArea: () => void
  subscribeBoundsChanged: (callback: (bounds: MapBounds | null) => void) => () => void
  destroy: () => void
  resize: () => void
}
