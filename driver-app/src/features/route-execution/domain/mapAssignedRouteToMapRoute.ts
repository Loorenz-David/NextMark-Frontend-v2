import type { AssignedRouteViewModel } from '@/app/contracts/routeExecution.types'
import type { MapRoute, MapRouteSegment } from '@/shared/map'

function hasRouteStarted(route: AssignedRouteViewModel) {
  return Boolean(route.route?.actual_start_time)
}

function getCompletedStopCount(route: AssignedRouteViewModel) {
  return route.stops.filter((stop) => stop.isCompleted).length
}

function buildStartLegSegment(
  route: AssignedRouteViewModel,
): MapRouteSegment | null {
  const path = route.route?.start_leg_polyline
  if (!path) {
    return null
  }

  return {
    path,
    state: 'completed',
  }
}

function buildIntermediateLegSegments(
  route: AssignedRouteViewModel,
  hasStarted: boolean,
  completedStopCount: number,
): MapRouteSegment[] {
  return route.rawStops.flatMap((stop, index) => {
    if (!stop.to_next_polyline) {
      return []
    }

    const nextStopIndex = index + 1
    const state = !hasStarted || completedStopCount >= nextStopIndex ? 'completed' : 'pending'

    return [{
      path: stop.to_next_polyline,
      state,
    }]
  })
}

function buildEndLegSegment(
  route: AssignedRouteViewModel,
  hasStarted: boolean,
  completedStopCount: number,
): MapRouteSegment | null {
  const path = route.route?.end_leg_polyline
  if (!path) {
    return null
  }

  return {
    path,
    state: !hasStarted || completedStopCount === route.stops.length ? 'completed' : 'pending',
  }
}

export function mapAssignedRouteToMapRoute(route: AssignedRouteViewModel): MapRoute | null {
  const started = hasRouteStarted(route)
  const completedStopCount = getCompletedStopCount(route)
  const segments = [
    buildStartLegSegment(route),
    ...buildIntermediateLegSegments(route, started, completedStopCount),
    buildEndLegSegment(route, started, completedStopCount),
  ].filter((segment): segment is MapRouteSegment => Boolean(segment))

  if (!segments.length) {
    return null
  }

  return {
    segments,
  }
}
