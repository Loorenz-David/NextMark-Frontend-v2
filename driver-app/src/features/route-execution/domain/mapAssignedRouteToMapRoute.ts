import type { AssignedRouteViewModel } from '@/app/contracts/routeExecution.types'
import type { MapRoute } from '@/shared/map'
import { buildRouteProgressSegments } from '@shared-domain'

export function mapAssignedRouteToMapRoute(route: AssignedRouteViewModel): MapRoute | null {
  const segments = buildRouteProgressSegments({
    routeStarted: Boolean(route.route?.actual_start_time),
    startLegPolyline: route.route?.start_leg_polyline,
    stops: route.rawStops.map((stop, index) => ({
      toNextPolyline: stop.to_next_polyline,
      isTerminal: route.stops[index]?.isCompleted ?? false,
    })),
    endLegPolyline: route.route?.end_leg_polyline,
  })

  if (!segments.length) {
    return null
  }

  return {
    segments,
  }
}
