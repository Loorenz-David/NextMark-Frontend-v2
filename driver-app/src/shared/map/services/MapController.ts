import { MAP_MARKER_LAYERS } from '../domain/constants/markerLayers'
import type { MapMarker } from '../domain/entities/MapMarker'
import type { MapRoute } from '../domain/entities/MapRoute'
import type {
  Coordinates,
  MapAdapter,
  MapBounds,
  MapConfig,
  MapViewportInsets,
  SetMarkerLayerOptions,
} from '../domain/types'

export class MapController {
  private adapter: MapAdapter

  constructor(adapter: MapAdapter) {
    this.adapter = adapter
  }

  async initialize(container: HTMLElement, options?: MapConfig) {
    await this.adapter.initialize(container, options)
  }

  showMarkers(markers: MapMarker[]) {
    this.adapter.setLayerMarkers(MAP_MARKER_LAYERS.default, markers, { fitBounds: true })
  }

  setMarkerLayer(layerId: string, markers: MapMarker[], options?: SetMarkerLayerOptions) {
    this.adapter.setLayerMarkers(layerId, markers, options)
  }

  setMarkerLayerVisibility(layerId: string, visible: boolean) {
    this.adapter.setLayerVisibility(layerId, visible)
  }

  clearMarkerLayer(layerId: string) {
    this.adapter.clearLayer(layerId)
  }

  showRoute(route: MapRoute | null) {
    this.adapter.drawRoute(route)
  }

  selectMarker(id: string | number) {
    this.adapter.selectMarker(String(id))
  }

  setSelectedMarker(id: string | null) {
    this.adapter.setSelectedMarker(id)
  }

  setHoveredMarker(id: string | null) {
    this.adapter.setHoveredMarker(id)
  }

  setViewportInsets(insets: MapViewportInsets) {
    this.adapter.setViewportInsets(insets)
  }

  focusCoordinates(coordinates: Coordinates, zoom?: number) {
    this.adapter.focusCoordinates(coordinates, zoom)
  }

  reframeToVisibleArea() {
    this.adapter.reframeToVisibleArea()
  }

  subscribeBoundsChanged(callback: (bounds: MapBounds | null) => void) {
    return this.adapter.subscribeBoundsChanged(callback)
  }

  resize() {
    this.adapter.resize()
  }

  clear() {
    this.adapter.clearMarkers()
    this.adapter.drawRoute(null)
  }

  destroy() {
    this.adapter.destroy()
  }
}
