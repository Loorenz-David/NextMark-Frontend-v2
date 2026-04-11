import { loadGoogleMaps } from '@shared-google-maps'

import type { MapConfig } from '../../domain/types'

type MapsLibrary = {
  Map: any
  marker: any
  Polyline: any
  LatLngBounds: any
}

type MarkerLibrary = {
  AdvancedMarkerElement: any
}

export class MapInstanceManager {
  private map: any = null
  private MapCtor: any = null
  private PolylineCtor: any = null
  private LatLngBoundsCtor: any = null
  private AdvancedMarkerCtor: any = null
  private loadMapsClient: typeof loadGoogleMaps

  constructor(loadMapsClient: typeof loadGoogleMaps = loadGoogleMaps) {
    this.loadMapsClient = loadMapsClient
  }

  async initialize(container: HTMLElement, options?: MapConfig) {
    const google = (await this.loadMapsClient()) as any
    const mapsLibrary = google.maps?.importLibrary
      ? ((await google.maps.importLibrary('maps')) as MapsLibrary)
      : null
    const markerLibrary = google.maps?.importLibrary
      ? ((await google.maps.importLibrary('marker')) as MarkerLibrary)
      : null

    this.MapCtor = mapsLibrary?.Map ?? google.maps?.Map ?? null
    this.PolylineCtor = mapsLibrary?.Polyline ?? google.maps?.Polyline ?? null
    this.LatLngBoundsCtor = mapsLibrary?.LatLngBounds ?? google.maps?.LatLngBounds ?? null
    this.AdvancedMarkerCtor =
      markerLibrary?.AdvancedMarkerElement ?? google.maps?.marker?.AdvancedMarkerElement ?? null

    if (!this.MapCtor) {
      throw new Error('Google Maps Map constructor is unavailable.')
    }
    if (!this.AdvancedMarkerCtor) {
      throw new Error('AdvancedMarkerElement is not available. Ensure the marker library is enabled.')
    }

    const center = options?.center ?? { lat: 0, lng: 0 }
    const zoom = options?.zoom ?? 12

    this.map = new this.MapCtor(container, {
      center,
      zoom,
      mapId: options?.mapId,
      disableDefaultUI: options?.disableDefaultUI ?? true,
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
    if (!this.map) return

    const center = this.map.getCenter?.()
    if (!center) return

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
