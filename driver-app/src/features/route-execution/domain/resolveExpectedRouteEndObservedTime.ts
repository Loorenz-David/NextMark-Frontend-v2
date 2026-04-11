import type { AssignedRouteViewModel } from '@/app/contracts/routeExecution.types'

function toDate(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function resolveExpectedRouteEndObservedTime(
  route: AssignedRouteViewModel,
  now: Date,
) {
  if (!route.route || route.rawStops.length === 0) {
    return null
  }

  const lastStop = [...route.rawStops]
    .sort((left, right) => (left.stop_order ?? Number.MAX_SAFE_INTEGER) - (right.stop_order ?? Number.MAX_SAFE_INTEGER))
    .at(-1)

  if (!lastStop?.actual_arrival_time) {
    return null
  }

  const actualArrival = toDate(lastStop.actual_arrival_time)
  if (!actualArrival) {
    return null
  }

  const expectedEnd = toDate(route.route.expected_end_time)
  const lastExpectedDeparture = toDate(lastStop.expected_departure_time)
  if (!expectedEnd || !lastExpectedDeparture) {
    return null
  }

  const expectedServiceSeconds = lastStop.expected_service_duration_seconds
  if (typeof expectedServiceSeconds !== 'number' || expectedServiceSeconds < 0) {
    return null
  }

  const remainingTravelSeconds = Math.max(
    0,
    Math.round((expectedEnd.getTime() - lastExpectedDeparture.getTime()) / 1000),
  )

  const projectedEnd = new Date(
    actualArrival.getTime()
    + ((expectedServiceSeconds + remainingTravelSeconds) * 1000),
  )

  if (projectedEnd.getTime() > now.getTime()) {
    return null
  }

  return projectedEnd.toISOString()
}
