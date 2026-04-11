import type { AssignedRouteViewModel } from '@/app/contracts/routeExecution.types'
import type { Coordinates } from '@/shared/map'
import { markRouteActualStartTimeAction } from '../actions/markRouteActualStartTime.action'
import { markStopActualArrivalTimeAction } from '../actions/markStopActualArrivalTime.action'
import { markStopActualDepartureTimeAction } from '../actions/markStopActualDepartureTime.action'
import { isWithinArrivalRange } from '../domain/isWithinArrivalRange'

type HandleNavigateStopTimingDependencies = {
  route: AssignedRouteViewModel | null
  stopClientId: string
  getCurrentCoordinates: () => Promise<Coordinates>
  arrivalRangeMeters: number | null
}

export async function handleNavigateStopTimingFlow({
  route,
  stopClientId,
  getCurrentCoordinates,
  arrivalRangeMeters,
}: HandleNavigateStopTimingDependencies) {
  if (!route?.route?.id) {
    return
  }

  const observedTime = new Date().toISOString()
  const stopIndex = route.stops.findIndex((candidate) => candidate.stopClientId === stopClientId)
  if (stopIndex < 0) {
    return
  }

  const currentStop = route.stops[stopIndex]
  const currentRawStop = route.rawStops.find((candidate) => candidate.client_id === stopClientId) ?? null
  const previousStop = stopIndex > 0 ? route.stops[stopIndex - 1] : null
  const previousRawStop = previousStop
    ? route.rawStops.find((candidate) => candidate.client_id === previousStop.stopClientId) ?? null
    : null

  if (!route.route.actual_start_time && route.activeStopClientId === currentStop.stopClientId) {
    await markRouteActualStartTimeAction(route.route.id, observedTime)
  }

  if (
    previousStop
    && previousStop.isCompleted
    && previousRawStop
    && !previousRawStop.actual_departure_time
  ) {
    await markStopActualDepartureTimeAction(previousStop.stopClientId, observedTime)
  }

  if (
    route.activeStopClientId !== currentStop.stopClientId
    || !currentRawStop
    || currentRawStop.actual_arrival_time
    || arrivalRangeMeters == null
    || !currentStop.address?.coordinates
  ) {
    return
  }

  try {
    const currentLocation = await getCurrentCoordinates()
    if (isWithinArrivalRange(currentLocation, currentStop.address.coordinates, arrivalRangeMeters)) {
      await markStopActualArrivalTimeAction(currentStop.stopClientId, observedTime)
    }
  } catch {
    // Silent by design. Navigate should remain usable if location cannot be resolved.
  }
}
