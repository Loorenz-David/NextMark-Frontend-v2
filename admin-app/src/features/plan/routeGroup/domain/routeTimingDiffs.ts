import type { RouteGroup } from '@/features/plan/routeGroup/types/routeGroup'
import type { RouteSolution } from '@/features/plan/routeGroup/types/routeSolution'
import type { RouteSolutionStop } from '@/features/plan/routeGroup/types/routeSolutionStop'

export interface RouteTimingDiffs {
  expectedTotalSeconds: number
  expectedDrivingSeconds: number
  expectedServiceSeconds: number
  realTotalSeconds: number | null
  realDrivingSeconds: number | null
  realServiceSeconds: number | null
  totalDiffSeconds: number | null
  drivingDiffSeconds: number | null
  serviceDiffSeconds: number | null
}

const parseUtcDate = (value?: string | null): Date | null => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const diffSeconds = (start: Date | null, end: Date | null): number | null => {
  if (!start || !end) return null
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000))
}

const normalizeDelta = (realSeconds: number | null, expectedSeconds: number): number | null => {
  if (realSeconds == null) return null
  const diff = realSeconds - expectedSeconds
  if (Math.abs(diff) < 60) return 0
  return diff
}

export const formatSignedDurationDelta = (diffSecondsValue: number | null): string | null => {
  if (diffSecondsValue == null) return null
  const sign = diffSecondsValue > 0 ? '+' : diffSecondsValue < 0 ? '-' : ''
  const totalMinutes = Math.round(Math.abs(diffSecondsValue) / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${sign}${hours}h ${minutes}m`
  return `${sign}${minutes}m`
}

export const computeRouteTimingDiffs = ({
  routeSolution,
  stops,
}: {
  routeSolution: RouteSolution | null | undefined
  stops: RouteSolutionStop[]
}): RouteTimingDiffs => {
  const orderedStops = [...stops].sort(
    (a, b) => (a.stop_order ?? Number.POSITIVE_INFINITY) - (b.stop_order ?? Number.POSITIVE_INFINITY),
  )

  const expectedStart = parseUtcDate(routeSolution?.expected_start_time)
  const expectedEnd = parseUtcDate(routeSolution?.expected_end_time)
  const routeActualStart = parseUtcDate(routeSolution?.actual_start_time)
  const routeStartAnchor = routeActualStart ?? expectedStart

  const expectedTotalSeconds = Math.max(0, diffSeconds(expectedStart, expectedEnd) ?? 0)
  const expectedDrivingSeconds = Math.max(0, routeSolution?.total_travel_time_seconds ?? 0)

  let expectedServiceFromStops = 0
  let hasExpectedServiceStops = false
  let realServiceSeconds = 0
  let realDrivingSecondsFromSegments = 0
  let hasDrivingSegments = false
  let latestActualTimestamp: Date | null = null
  let hasActualDeparture = false
  let previousActualDeparture: Date | null = null

  for (const stop of orderedStops) {
    if (typeof stop.expected_service_duration_seconds === 'number') {
      expectedServiceFromStops += Math.max(0, stop.expected_service_duration_seconds)
      hasExpectedServiceStops = true
    }

    const actualArrival = parseUtcDate(stop.actual_arrival_time)
    const actualDeparture = parseUtcDate(stop.actual_departure_time)

    if (actualDeparture) {
      hasActualDeparture = true
      latestActualTimestamp = actualDeparture
    } else if (actualArrival) {
      latestActualTimestamp = actualArrival
    }

    const serviceSegmentSeconds = diffSeconds(actualArrival, actualDeparture)
    if (serviceSegmentSeconds != null) {
      realServiceSeconds += serviceSegmentSeconds
    }

    if (previousActualDeparture && actualArrival) {
      realDrivingSecondsFromSegments += Math.max(
        0,
        Math.round((actualArrival.getTime() - previousActualDeparture.getTime()) / 1000),
      )
      hasDrivingSegments = true
    }

    if (actualDeparture) {
      previousActualDeparture = actualDeparture
    }
  }

  const expectedServiceSeconds = hasExpectedServiceStops
    ? expectedServiceFromStops
    : Math.max(0, expectedTotalSeconds - expectedDrivingSeconds)

  if (!hasActualDeparture || !routeStartAnchor || !latestActualTimestamp) {
    return {
      expectedTotalSeconds,
      expectedDrivingSeconds,
      expectedServiceSeconds,
      realTotalSeconds: null,
      realDrivingSeconds: null,
      realServiceSeconds: null,
      totalDiffSeconds: null,
      drivingDiffSeconds: null,
      serviceDiffSeconds: null,
    }
  }

  const realTotalSeconds = Math.max(0, diffSeconds(routeStartAnchor, latestActualTimestamp) ?? 0)
  const normalizedRealServiceSeconds = Math.max(0, realServiceSeconds)
  const realDrivingSeconds = hasDrivingSegments
    ? Math.max(0, realDrivingSecondsFromSegments)
    : Math.max(0, realTotalSeconds - normalizedRealServiceSeconds)

  return {
    expectedTotalSeconds,
    expectedDrivingSeconds,
    expectedServiceSeconds,
    realTotalSeconds,
    realDrivingSeconds,
    realServiceSeconds: normalizedRealServiceSeconds,
    totalDiffSeconds: normalizeDelta(realTotalSeconds, expectedTotalSeconds),
    drivingDiffSeconds: normalizeDelta(realDrivingSeconds, expectedDrivingSeconds),
    serviceDiffSeconds: normalizeDelta(normalizedRealServiceSeconds, expectedServiceSeconds),
  }
}
