import type { Coordinates } from '../../domain/types'
import type { Route } from '../../domain/entities/Route'
import type { MapInstanceManager } from '../core/MapInstanceManager'

export class RouteRenderer {
  private routePolylines: any[] = []
  private mapInstanceManager: MapInstanceManager
  private onRouteRendered: (points: Coordinates[]) => void

  constructor(mapInstanceManager: MapInstanceManager, onRouteRendered: (points: Coordinates[]) => void) {
    this.mapInstanceManager = mapInstanceManager
    this.onRouteRendered = onRouteRendered
  }

  drawRoute(route: Route | null) {
    const map = this.mapInstanceManager.getMap()
    const PolylineCtor = this.mapInstanceManager.getPolylineCtor()

    if (!map || !PolylineCtor) return

    this.clearRoute()

    if (!route || !route.path) return

    let encodedPolylines: string[] = []

    if (typeof route.path === 'string') {
      encodedPolylines = [route.path]
    } else if (Array.isArray(route.path) && typeof route.path[0] === 'string') {
      encodedPolylines = route.path as string[]
    } else {
      return
    }

    if (!google.maps.geometry?.encoding) {
      console.error('Google Maps geometry library is not loaded')
      return
    }

    const allPoints: Coordinates[] = []

    encodedPolylines.forEach((encoded) => {
      const decoded = google.maps.geometry.encoding.decodePath(encoded)

      const path = decoded.map((p: any) => ({
        lat: p.lat(),
        lng: p.lng(),
      }))

      const polyline = new PolylineCtor({
        map,
        path,
        strokeColor: '#2563eb',
        strokeOpacity: 0.9,
        strokeWeight: 4,
      })

      this.routePolylines.push(polyline)
      allPoints.push(...path)
    })

    if (allPoints.length) {
      this.onRouteRendered(allPoints)
    }
  }

  getRoutePoints() {
    const points: Coordinates[] = []

    this.routePolylines.forEach((polyline) => {
      const path = (polyline as any).getPath?.()
      if (!path || typeof path.getArray !== 'function') return

      path.getArray().forEach((point: any) => {
        points.push({ lat: point.lat(), lng: point.lng() })
      })
    })

    return points
  }

  clearRoute() {
    this.routePolylines.forEach((polyline) => polyline.setMap(null))
    this.routePolylines = []
  }

  destroy() {
    this.clearRoute()
  }
}
