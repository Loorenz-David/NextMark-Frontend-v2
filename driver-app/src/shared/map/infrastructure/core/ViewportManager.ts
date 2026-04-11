import type { Coordinates, MapViewportInsets } from '../../domain/types'
import type { MarkerLayerManager } from '../markers/MarkerLayerManager'
import type { RouteRenderer } from '../route/RouteRenderer'
import type { MapInstanceManager } from './MapInstanceManager'

const DEFAULT_VIEWPORT_INSETS: MapViewportInsets = {
  top: 24,
  right: 24,
  bottom: 24,
  left: 24,
}

export class ViewportManager {
  private viewportInsets: MapViewportInsets = DEFAULT_VIEWPORT_INSETS
  private mapInstanceManager: MapInstanceManager
  private markerLayerManager: MarkerLayerManager
  private routeRenderer: RouteRenderer

  constructor(
    mapInstanceManager: MapInstanceManager,
    markerLayerManager: MarkerLayerManager,
    routeRenderer: RouteRenderer,
  ) {
    this.mapInstanceManager = mapInstanceManager
    this.markerLayerManager = markerLayerManager
    this.routeRenderer = routeRenderer
  }

  fitBounds(points?: Coordinates[]) {
    const map = this.mapInstanceManager.getMap()
    const LatLngBoundsCtor = this.mapInstanceManager.getLatLngBoundsCtor()

    if (!map || !LatLngBoundsCtor) {
      return
    }

    let resolvedPoints = points?.length ? points : this.routeRenderer.getRoutePoints()
    if (!resolvedPoints.length) {
      resolvedPoints = this.markerLayerManager.getVisibleMarkerPoints()
    }
    if (!resolvedPoints.length) {
      return
    }

    if (resolvedPoints.length === 1) {
      map.setOptions?.({
        center: resolvedPoints[0],
        zoom: 14,
      })
      return
    }

    const bounds = new LatLngBoundsCtor()
    resolvedPoints.forEach((point) => bounds.extend(point))
    map.fitBounds?.(bounds, this.viewportInsets)

    const MAX_ZOOM = 15
    const currentZoom = map?.getZoom?.()
    if (typeof currentZoom === 'number' && currentZoom > MAX_ZOOM) {
      map.setZoom?.(MAX_ZOOM)
    }
  }

  setViewportInsets(insets: MapViewportInsets) {
    this.viewportInsets = {
      top: Math.max(0, insets.top),
      right: Math.max(0, insets.right),
      bottom: Math.max(0, insets.bottom),
      left: Math.max(0, insets.left),
    }
  }

  focusCoordinates(coordinates: Coordinates, zoom = 16) {
    const map = this.mapInstanceManager.getMap()
    if (!map) {
      return
    }

    map.setOptions?.({
      center: coordinates,
      zoom,
    })
  }

  reframeToVisibleArea() {
    this.fitBounds()
  }

  applyViewportInsets() {
    const map = this.mapInstanceManager.getMap()
    if (!map) {
      return
    }

    map.setOptions?.({ padding: this.viewportInsets })
  }
}
