import { loadGoogleMaps } from '@shared-google-maps'

import type { MapConfig } from '../../domain/types'

type MapsLibrary = {
  Map: typeof google.maps.Map
  Polyline: typeof google.maps.Polyline
  LatLngBounds: typeof google.maps.LatLngBounds
}

type MarkerLibrary = {
  AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement
}

type MapRuntime = google.maps.Map & {
  panBy?: (x: number, y: number) => void
  setOptions: (options: Partial<google.maps.MapOptions> & { padding?: { top: number; right: number; bottom: number; left: number } }) => void
}

export class MapInstanceManager {
  private map: google.maps.Map | null = null
  private MapCtor: typeof google.maps.Map | null = null
  private PolylineCtor: typeof google.maps.Polyline | null = null
  private LatLngBoundsCtor: typeof google.maps.LatLngBounds | null = null
  private AdvancedMarkerCtor: typeof google.maps.marker.AdvancedMarkerElement | null = null
  private loadMapsClient: typeof loadGoogleMaps

  constructor(loadMapsClient: typeof loadGoogleMaps = loadGoogleMaps) {
    this.loadMapsClient = loadMapsClient
  }

  async initialize(container: HTMLElement, options?: MapConfig) {
    const client = await this.loadMapsClient()
    const mapsLibrary = client.maps?.importLibrary
      ? ((await client.maps.importLibrary('maps')) as MapsLibrary)
      : null
    const markerLibrary = client.maps?.importLibrary
      ? ((await client.maps.importLibrary('marker')) as MarkerLibrary)
      : null

    this.MapCtor = mapsLibrary?.Map ?? (client.maps?.Map as typeof google.maps.Map | undefined) ?? null
    this.PolylineCtor = mapsLibrary?.Polyline ?? (client.maps?.Polyline as typeof google.maps.Polyline | undefined) ?? null
    this.LatLngBoundsCtor = mapsLibrary?.LatLngBounds ?? (client.maps?.LatLngBounds as typeof google.maps.LatLngBounds | undefined) ?? null
    this.AdvancedMarkerCtor =
      markerLibrary?.AdvancedMarkerElement ?? (client.maps?.marker?.AdvancedMarkerElement as typeof google.maps.marker.AdvancedMarkerElement | undefined) ?? null

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
      gestureHandling: 'greedy',
      disableDefaultUI: options?.disableDefaultUI ?? true,
    })
  }

  getMap() {
    return this.map as MapRuntime | null
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
