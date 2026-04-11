import type { DriverRouteRecord } from './routes.types'

function parseDate(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getRouteDateDistance(route: DriverRouteRecord, now: Date) {
  const startDate = parseDate(route.delivery_plan?.start_date)
  const endDate = parseDate(route.delivery_plan?.end_date)

  if (!startDate && !endDate) {
    return Number.POSITIVE_INFINITY
  }

  if (startDate && endDate) {
    if (now >= startDate && now <= endDate) {
      return 0
    }

    return Math.min(
      Math.abs(startDate.getTime() - now.getTime()),
      Math.abs(endDate.getTime() - now.getTime()),
    )
  }

  const candidate = startDate ?? endDate
  return candidate ? Math.abs(candidate.getTime() - now.getTime()) : Number.POSITIVE_INFINITY
}

export function resolveDefaultSelectedRoute(
  routes: DriverRouteRecord[],
  now: Date = new Date(),
) {
  if (routes.length === 0) {
    return null
  }

  const datedRoutes = routes
    .map((route, index) => ({
      route,
      distance: getRouteDateDistance(route, now),
      index,
    }))
    .filter((candidate) => Number.isFinite(candidate.distance))
    .sort((left, right) => {
      if (left.distance === right.distance) {
        return left.index - right.index
      }

      return left.distance - right.distance
    })

  return datedRoutes[0]?.route ?? routes[0]
}
