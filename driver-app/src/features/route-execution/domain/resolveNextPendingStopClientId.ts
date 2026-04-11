import type { AssignedRouteViewModel } from '@/app/contracts/routeExecution.types'

export function resolveNextPendingStopClientId(
  route: AssignedRouteViewModel | null | undefined,
  currentStopClientId: string,
): string | null {
  if (!route) {
    return null
  }

  const currentIndex = route.stops.findIndex((candidate) => candidate.stopClientId === currentStopClientId)
  if (currentIndex < 0) {
    return null
  }

  return route.stops
    .slice(currentIndex + 1)
    .find((candidate) => !candidate.isCompleted)?.stopClientId ?? null
}
