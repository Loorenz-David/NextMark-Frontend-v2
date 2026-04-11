import type { AssignedRouteViewModel } from '@/app/contracts/routeExecution.types'
import type { Coordinates } from '@/shared/map'
import { markRouteActualEndTimeExpectedAction } from '../actions/markRouteActualEndTimeExpected.action'
import { markStopActualArrivalTimeAction } from '../actions/markStopActualArrivalTime.action'
import { isWithinArrivalRange } from '../domain/isWithinArrivalRange'
import { resolveExpectedRouteEndObservedTime } from '../domain/resolveExpectedRouteEndObservedTime'

type SyncRouteTimingFlowDependencies = {
  route: AssignedRouteViewModel | null
  currentLocation: Coordinates | null
  observedTime: string
  arrivalRangeMeters: number
}

export async function syncRouteTimingFlow({
  route,
  currentLocation,
  observedTime,
  arrivalRangeMeters,
}: SyncRouteTimingFlowDependencies) {
  if (!route?.route?.id) {
    return
  }

  const activeStop = route.activeStopClientId
    ? route.stops.find((candidate) => candidate.stopClientId === route.activeStopClientId) ?? null
    : null

  const activeRawStop = route.activeStopClientId
    ? route.rawStops.find((candidate) => candidate.client_id === route.activeStopClientId) ?? null
    : null

  if (
    currentLocation
    && activeStop
    && activeRawStop
    && !activeRawStop.actual_arrival_time
    && activeStop.address?.coordinates
    && isWithinArrivalRange(currentLocation, activeStop.address.coordinates, arrivalRangeMeters)
  ) {
    await markStopActualArrivalTimeAction(activeStop.stopClientId, observedTime)
  }

  if (!route.route.actual_end_time) {
    const expectedObservedTime = resolveExpectedRouteEndObservedTime(route, new Date(observedTime))
    if (expectedObservedTime) {
      await markRouteActualEndTimeExpectedAction(route.route.id, expectedObservedTime)
    }
  }
}
