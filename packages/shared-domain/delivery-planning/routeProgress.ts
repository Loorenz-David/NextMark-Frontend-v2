export type RouteProgressSegmentState = 'completed' | 'pending'

export type RouteProgressSegment = {
  path: string
  state: RouteProgressSegmentState
}

export type RouteProgressStop = {
  toNextPolyline?: string | null
  isTerminal: boolean
}

export type BuildRouteProgressSegmentsInput = {
  routeStarted: boolean
  startLegPolyline?: string | null
  stops: RouteProgressStop[]
  endLegPolyline?: string | null
}

/**
 * Builds the visual route progress used by both the driver and admin maps.
 *
 * The rules intentionally preserve the established driver behavior:
 * before execution starts the full route uses the completed treatment; after
 * start, progress advances according to the number of terminal stops.
 */
export const buildRouteProgressSegments = ({
  routeStarted,
  startLegPolyline,
  stops,
  endLegPolyline,
}: BuildRouteProgressSegmentsInput): RouteProgressSegment[] => {
  const terminalStopCount = stops.filter((stop) => stop.isTerminal).length
  const segments: RouteProgressSegment[] = []

  if (startLegPolyline) {
    segments.push({
      path: startLegPolyline,
      state: 'completed',
    })
  }

  stops.forEach((stop, index) => {
    if (!stop.toNextPolyline) {
      return
    }

    segments.push({
      path: stop.toNextPolyline,
      state: !routeStarted || terminalStopCount >= index + 1
        ? 'completed'
        : 'pending',
    })
  })

  if (endLegPolyline) {
    segments.push({
      path: endLegPolyline,
      state: !routeStarted || terminalStopCount === stops.length
        ? 'completed'
        : 'pending',
    })
  }

  return segments
}
