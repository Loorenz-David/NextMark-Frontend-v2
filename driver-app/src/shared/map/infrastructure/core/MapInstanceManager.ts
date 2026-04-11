import { loadGoogleMaps } from '@shared-google-maps'
import type { MapConfig } from '../../domain/types'

type MapsLibrary = {
  Map: MapConstructor
  Polyline: PolylineConstructor
  LatLngBounds: LatLngBoundsConstructor
}

type MarkerLibrary = {
  AdvancedMarkerElement: AdvancedMarkerConstructor
}

type MapInstance = {
  getCenter?: () => { lat(): number; lng(): number } | null
  setCenter?: (value: { lat: number; lng: number }) => void
  getBounds?: () => {
    getNorthEast?: () => { lat(): number; lng(): number }
    getSouthWest?: () => { lat(): number; lng(): number }
  } | null
  getZoom?: () => number | undefined
  setZoom?: (zoom: number) => void
  setOptions?: (options: Record<string, unknown>) => void
  fitBounds?: (bounds: unknown, padding?: unknown) => void
  panBy?: (x: number, y: number) => void
}

type MapConstructor = new (container: HTMLElement, options?: Record<string, unknown>) => MapInstance
type PolylineConstructor = new (options: Record<string, unknown>) => {
  setMap: (map: unknown) => void
  getPath?: () => { getArray: () => Array<{ lat(): number; lng(): number }> }
}
type LatLngBoundsConstructor = new () => {
  extend: (point: { lat: number; lng: number }) => void
}
type AdvancedMarkerConstructor = new (options: Record<string, unknown>) => {
  map: unknown
  position: unknown
}

export class MapInstanceManager {
  private map: MapInstance | null = null
  private MapCtor: MapConstructor | null = null
  private PolylineCtor: PolylineConstructor | null = null
  private LatLngBoundsCtor: LatLngBoundsConstructor | null = null
  private AdvancedMarkerCtor: AdvancedMarkerConstructor | null = null
  private loadMapsClient: typeof loadGoogleMaps

  constructor(loadMapsClient: typeof loadGoogleMaps = loadGoogleMaps) {
    this.loadMapsClient = loadMapsClient
  }

  async initialize(container: HTMLElement, options?: MapConfig) {
    const google = await this.loadMapsClient()
    const mapsLibrary = google.maps?.importLibrary
      ? (await google.maps.importLibrary('maps')) as MapsLibrary
      : null
    const markerLibrary = google.maps?.importLibrary
      ? (await google.maps.importLibrary('marker')) as MarkerLibrary
      : null

    this.MapCtor = (mapsLibrary?.Map ?? google.maps?.Map ?? null) as MapConstructor | null
    this.PolylineCtor = (mapsLibrary?.Polyline ?? google.maps?.Polyline ?? null) as PolylineConstructor | null
    this.LatLngBoundsCtor = (mapsLibrary?.LatLngBounds ?? google.maps?.LatLngBounds ?? null) as LatLngBoundsConstructor | null
    this.AdvancedMarkerCtor = (
      markerLibrary?.AdvancedMarkerElement ?? google.maps?.marker?.AdvancedMarkerElement ?? null
    ) as AdvancedMarkerConstructor | null

    if (!this.MapCtor) {
      throw new Error('Google Maps Map constructor is unavailable.')
    }

    if (!this.AdvancedMarkerCtor) {
      throw new Error('AdvancedMarkerElement is not available. Ensure the marker library is enabled.')
    }

    this.map = new this.MapCtor(container, {
      center: options?.center ?? { lat: 0, lng: 0 },
      zoom: options?.zoom ?? 12,
      mapId: options?.mapId,
      disableDefaultUI: options?.disableDefaultUI ?? true,
      gestureHandling: options?.gestureHandling ?? 'greedy',
    })
  }

  getMap() {
    return this.map
  }

  getPolylineCtor() {
    return this.PolylineCtor
  }

  getLatLngBoundsCtor() {
    return this.LatLngBoundsCtor
  }

  getAdvancedMarkerCtor() {
    return this.AdvancedMarkerCtor
  }

  resize(onAfterResize?: () => void) {
    if (!this.map) {
      return
    }

    const center = this.map.getCenter?.()
    if (!center) {
      return
    }

    const normalizedCenter = {
      lat: center.lat(),
      lng: center.lng(),
    }

    google.maps.event.trigger(this.map, 'resize')
    onAfterResize?.()
    this.map.setCenter?.(normalizedCenter)
  }

  destroy() {
    this.map = null
    this.MapCtor = null
    this.PolylineCtor = null
    this.LatLngBoundsCtor = null
    this.AdvancedMarkerCtor = null
  }
}
