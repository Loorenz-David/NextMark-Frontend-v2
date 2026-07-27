import type { Coordinates } from '../../domain/types'
import type { Route } from '../../domain/entities/Route'
import type { MapInstanceManager } from '../core/MapInstanceManager'

const ROUTE_OUTER_STROKE_COLOR = '#172554'
const ROUTE_COMPLETED_INNER_STROKE_COLOR = '#2563eb'
const ROUTE_PENDING_INNER_STROKE_COLOR = '#bfdbfe'
const ROUTE_OUTER_STROKE_WEIGHT = 8
const ROUTE_INNER_STROKE_WEIGHT = 4.5

type RoutePoint = {
  lat(): number
  lng(): number
}

type RenderedRoutePolyline = {
  setMap(map: unknown): void
  getPath?(): {
    getArray(): RoutePoint[]
  }
}

export class RouteRenderer {
  private routePolylines: RenderedRoutePolyline[] = []
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

    if (!route?.segments.length) return

    if (!google.maps.geometry?.encoding) {
      console.error('Google Maps geometry library is not loaded')
      return
    }

    const allPoints: Coordinates[] = []

    route.segments.forEach((segment) => {
      let decoded: Array<{ lat(): number; lng(): number }>
      try {
        decoded = google.maps.geometry.encoding.decodePath(segment.path)
      } catch (error) {
        console.error('Unable to decode route polyline', error)
        return
      }

      const path = decoded.map((point) => ({
        lat: point.lat(),
        lng: point.lng(),
      }))

      if (!path.length) {
        return
      }

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

    if (allPoints.length && route.fitBounds !== false) {
      this.onRouteRendered(allPoints)
    }
  }

  getRoutePoints() {
    const points: Coordinates[] = []

    this.routePolylines.forEach((polyline) => {
      const path = polyline.getPath?.()
      if (!path || typeof path.getArray !== 'function') return

      path.getArray().forEach((point) => {
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
