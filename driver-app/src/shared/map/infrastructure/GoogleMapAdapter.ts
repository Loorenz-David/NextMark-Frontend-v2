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
import { MapInstanceManager } from './core/MapInstanceManager'
import { ViewportManager } from './core/ViewportManager'
import { MarkerLayerManager } from './markers/MarkerLayerManager'
import { MarkerSelectionManager } from './markers/MarkerSelectionManager'
import { RouteRenderer } from './route/RouteRenderer'

export class GoogleMapAdapter implements MapAdapter {
  private readonly mapInstanceManager: MapInstanceManager
  private readonly markerLayerManager: MarkerLayerManager
  private readonly markerSelectionManager: MarkerSelectionManager
  private readonly routeRenderer: RouteRenderer
  private readonly viewportManager: ViewportManager
  private currentRoute: MapRoute | null = null
  private boundsChangedListeners = new Set<(bounds: MapBounds | null) => void>()
  private idleListener: { remove?: () => void } | null = null

  constructor() {
    let routeFitBoundsCallback: (points: Coordinates[]) => void = () => undefined

    this.mapInstanceManager = new MapInstanceManager()
    this.markerLayerManager = new MarkerLayerManager(this.mapInstanceManager)
    this.markerSelectionManager = new MarkerSelectionManager(this.markerLayerManager)
    this.routeRenderer = new RouteRenderer(this.mapInstanceManager, (points) => {
      routeFitBoundsCallback(points)
    })
    this.viewportManager = new ViewportManager(
      this.mapInstanceManager,
      this.markerLayerManager,
      this.routeRenderer,
    )
    routeFitBoundsCallback = (points) => this.viewportManager.fitBounds(points)
  }

  async initialize(container: HTMLElement, options?: MapConfig) {
    await this.mapInstanceManager.initialize(container, options)
    this.bindBoundsChangedListener()
    this.viewportManager.applyViewportInsets()

    this.markerLayerManager.replayLayerSnapshots((points) => {
      this.viewportManager.fitBounds(points)
    })
    this.routeRenderer.drawRoute(this.currentRoute)

    this.markerSelectionManager.reconcileSelectionState()
    this.markerSelectionManager.reapplySelectionStyles()
  }

  setLayerMarkers(layerId: string, markers: MapMarker[], options?: SetMarkerLayerOptions) {
    const { shouldFitBounds } = this.markerLayerManager.setLayerMarkers(layerId, markers, options)
    this.markerSelectionManager.reconcileSelectionState()
    this.markerSelectionManager.reapplySelectionStyles()

    if (shouldFitBounds) {
      this.viewportManager.fitBounds(markers.map((marker) => marker.coordinates))
    }
  }

  setLayerVisibility(layerId: string, visible: boolean) {
    this.markerLayerManager.setLayerVisibility(layerId, visible)
  }

  clearLayer(layerId: string) {
    this.markerLayerManager.clearLayer(layerId)
    this.markerSelectionManager.reconcileSelectionState()
    this.markerSelectionManager.reapplySelectionStyles()
  }

  clearMarkers() {
    this.markerLayerManager.clearMarkers()
    this.markerSelectionManager.reset()
  }

  drawRoute(route: MapRoute | null) {
    this.currentRoute = route
    this.routeRenderer.drawRoute(route)
  }

  selectMarker(id: string) {
    this.markerSelectionManager.selectMarker(id)
  }

  setSelectedMarker(id: string | null) {
    this.markerSelectionManager.setSelectedMarker(id)
  }

  setHoveredMarker(id: string | null) {
    this.markerSelectionManager.setHoveredMarker(id)
  }

  setViewportInsets(insets: MapViewportInsets) {
    this.viewportManager.setViewportInsets(insets)
    this.viewportManager.applyViewportInsets()
  }

  focusCoordinates(coordinates: Coordinates, zoom?: number) {
    this.viewportManager.focusCoordinates(coordinates, zoom)
  }

  reframeToVisibleArea() {
    this.viewportManager.reframeToVisibleArea()
  }

  subscribeBoundsChanged(callback: (bounds: MapBounds | null) => void) {
    this.boundsChangedListeners.add(callback)
    callback(this.resolveBounds())

    return () => {
      this.boundsChangedListeners.delete(callback)
    }
  }

  destroy() {
    this.idleListener?.remove?.()
    this.idleListener = null
    this.boundsChangedListeners.clear()
    this.clearMarkers()
    this.currentRoute = null
    this.routeRenderer.destroy()
    this.mapInstanceManager.destroy()
  }

  resize() {
    this.mapInstanceManager.resize(() => {
      this.viewportManager.applyViewportInsets()
    })
  }

  private bindBoundsChangedListener() {
    this.idleListener?.remove?.()
    const map = this.mapInstanceManager.getMap()
    if (!map || !google?.maps?.event?.addListener) {
      return
    }

    this.idleListener = google.maps.event.addListener(map, 'idle', () => {
      const bounds = this.resolveBounds()
      this.boundsChangedListeners.forEach((listener) => listener(bounds))
    })
  }

  private resolveBounds(): MapBounds | null {
    const map = this.mapInstanceManager.getMap()
    const bounds = map?.getBounds?.()
    if (!bounds) {
      return null
    }

    const northEast = bounds.getNorthEast?.()
    const southWest = bounds.getSouthWest?.()
    if (!northEast || !southWest) {
      return null
    }

    return {
      north: northEast.lat(),
      east: northEast.lng(),
      south: southWest.lat(),
      west: southWest.lng(),
    }
  }
}
