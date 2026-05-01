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

    if (!map || !LatLngBoundsCtor) return

    let resolvedPoints = points?.length ? points : this.getRoutePoints()
    if (!resolvedPoints.length) {
      resolvedPoints = this.getMarkerPoints()
    }
    if (!resolvedPoints.length) return

    if (resolvedPoints.length === 1) {
      map.setOptions({
        center: resolvedPoints[0],
        zoom: 14,
      })
      const horizontalOffset = (this.viewportInsets.left - this.viewportInsets.right) / 2
      const verticalOffset = (this.viewportInsets.top - this.viewportInsets.bottom) / 2
      map.panBy?.(horizontalOffset, verticalOffset)
      return
    }

    const bounds = new LatLngBoundsCtor()
    resolvedPoints.forEach((point) => bounds.extend(point))
    map.fitBounds(bounds, this.viewportInsets)

    const MAX_ZOOM = 10
    const MIN_ZOOM = 10
    const currentZoom = map?.getZoom?.()

    if (typeof currentZoom === 'number' && currentZoom > MAX_ZOOM) {
      map.setZoom?.(MAX_ZOOM)
    }
    if (typeof currentZoom === 'number' && currentZoom > MIN_ZOOM) {
      map.setZoom?.(MIN_ZOOM)
    }
  }

  setViewportInsets(insets: MapViewportInsets) {
    this.viewportInsets = {
      top: Math.max(0, insets.top),
      right: Math.max(0, insets.right),
      bottom: Math.max(0, insets.bottom),
      left: Math.max(0, insets.left),
    }
    this.applyViewportInsets()
  }

  storeViewportInsets(insets: MapViewportInsets) {
    this.viewportInsets = {
      top: Math.max(0, insets.top),
      right: Math.max(0, insets.right),
      bottom: Math.max(0, insets.bottom),
      left: Math.max(0, insets.left),
    }
  }

  applyViewportInsets() {
    const map = this.mapInstanceManager.getMap()
    if (!map) return

    map.setOptions({ padding: this.viewportInsets })
  }

  reframeToVisibleArea() {
    this.fitBounds()
  }

  getRoutePoints() {
    return this.routeRenderer.getRoutePoints()
  }

  getMarkerPoints() {
    return this.markerLayerManager.getVisibleMarkerPoints()
  }
}
