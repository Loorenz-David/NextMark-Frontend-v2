import type { AssignedRouteViewModel } from '@/app/contracts/routeExecution.types'
import type { TeamStopSearchResult } from './assignedRouteSearch.types'

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

export function searchAssignedRouteStops(
  route: AssignedRouteViewModel | null,
  query: string,
): TeamStopSearchResult[] {
  if (!route) {
    return []
  }

  const normalizedQuery = normalizeSearchValue(query)
  if (!normalizedQuery) {
    return []
  }

  return route.stops
    .filter((stop) => stop.searchText.includes(normalizedQuery))
    .map((stop) => ({
      id: stop.stopClientId,
      kind: 'team-stop' as const,
      stopClientId: stop.stopClientId,
      title: stop.title,
      subtitle: [stop.secondaryAddressLine, stop.itemSummary].filter(Boolean).join(' • ') || null,
      badgeLabel: stop.badgeLabel,
    }))
}
