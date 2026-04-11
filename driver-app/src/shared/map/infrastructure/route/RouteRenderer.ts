import type { MapRoute } from '../../domain/entities/MapRoute'
import type { Coordinates } from '../../domain/types'
import type { MapInstanceManager } from '../core/MapInstanceManager'

const ROUTE_OUTER_STROKE_COLOR = '#0f766e'
const ROUTE_COMPLETED_INNER_STROKE_COLOR = '#74d8ca'
const ROUTE_PENDING_INNER_STROKE_COLOR = '#f3fcfa'
const ROUTE_OUTER_STROKE_WEIGHT = 8
const ROUTE_INNER_STROKE_WEIGHT = 4.5

export class RouteRenderer {
  private routePolylines: Array<{
    setMap: (map: unknown) => void
    getPath?: () => { getArray: () => Array<{ lat(): number; lng(): number }> }
  }> = []
  private mapInstanceManager: MapInstanceManager
  private onRouteRendered: (points: Coordinates[]) => void

  constructor(mapInstanceManager: MapInstanceManager, onRouteRendered: (points: Coordinates[]) => void) {
    this.mapInstanceManager = mapInstanceManager
    this.onRouteRendered = onRouteRendered
  }

  drawRoute(route: MapRoute | null) {
    const map = this.mapInstanceManager.getMap()
    const PolylineCtor = this.mapInstanceManager.getPolylineCtor()

    if (!map || !PolylineCtor) {
      return
    }

    this.clearRoute()

    if (!route?.segments.length) {
      return
    }

    if (!google.maps.geometry?.encoding) {
      return
    }

    const allPoints: Coordinates[] = []

    route.segments.forEach((segment) => {
      const decoded = google.maps.geometry.encoding.decodePath(segment.path)

      const path = decoded.map((point: { lat(): number; lng(): number }) => ({
        lat: point.lat(),
        lng: point.lng(),
      }))

      const outerPolyline = new PolylineCtor({
        map,
        path,
        strokeColor: ROUTE_OUTER_STROKE_COLOR,
        strokeOpacity: 0.9,
        strokeWeight: ROUTE_OUTER_STROKE_WEIGHT,
      })

      const innerPolyline = new PolylineCtor({
        map,
        path,
        strokeColor: segment.state === 'completed'
          ? ROUTE_COMPLETED_INNER_STROKE_COLOR
          : ROUTE_PENDING_INNER_STROKE_COLOR,
        strokeOpacity: 0.98,
        strokeWeight: ROUTE_INNER_STROKE_WEIGHT,
      })

      this.routePolylines.push(outerPolyline, innerPolyline)
      allPoints.push(...path)
    })

    if (allPoints.length) {
      this.onRouteRendered(allPoints)
    }
  }

  getRoutePoints() {
    const points: Coordinates[] = []

    this.routePolylines.forEach((polyline) => {
      const path = polyline.getPath?.()
      if (!path || typeof path.getArray !== 'function') {
        return
      }

      path.getArray().forEach((point: { lat(): number; lng(): number }) => {
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
