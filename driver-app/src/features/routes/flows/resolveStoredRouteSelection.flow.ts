import type { DriverWorkspaceScopeKey } from '@/app/contracts/driverSession.types'
import { routeSelectionService } from '@/app/services/routeSelection.service'
import { isPersistedRouteSelectionValid } from '../domain'
import type { DriverRouteRecord } from '../domain'

type ResolveStoredRouteSelectionFlowDependencies = {
  workspaceScopeKey: DriverWorkspaceScopeKey
  routesByClientId: Record<string, DriverRouteRecord>
}

export function resolveStoredRouteSelectionFlow({
  workspaceScopeKey,
  routesByClientId,
}: ResolveStoredRouteSelectionFlowDependencies) {
  const storedSelection = routeSelectionService.get(workspaceScopeKey)

  if (!storedSelection) {
    return null
  }

  const storedRoute = routesByClientId[storedSelection.routeClientId] ?? null

  if (!isPersistedRouteSelectionValid(storedSelection, storedRoute)) {
    routeSelectionService.clearInvalid(workspaceScopeKey)
    return null
  }

  return storedSelection.routeClientId
}
