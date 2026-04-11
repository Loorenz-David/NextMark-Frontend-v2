import type { DriverRouteRecord } from './routes.types'

export type PersistedRouteSelectionCandidate = {
  routeClientId: string
  selectedAt: string
}

function parseDate(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function isPersistedRouteSelectionValid(
  selection: PersistedRouteSelectionCandidate | null,
  route: DriverRouteRecord | null,
  now: Date = new Date(),
) {
  if (!selection || !route) {
    return false
  }

  const endDate = parseDate(route.delivery_plan?.end_date)

  if (!endDate) {
    return true
  }

  return endDate.getTime() >= now.getTime()
}
