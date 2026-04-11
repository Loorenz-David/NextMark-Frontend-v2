import type { DriverWorkspaceScopeKey } from '@/app/contracts/driverSession.types'
import { routeSelectionService } from '@/app/services/routeSelection.service'
import { isPersistedRouteSelectionValid, resolveDefaultSelectedRoute } from '../domain'
import {
  clearSelectedRoute,
  selectAllRoutes,
  selectSelectedRouteClientId,
  setSelectedRoute,
  useRoutesSelectionStore,
  useRoutesStore,
} from '../stores'
import { resolveStoredRouteSelectionFlow } from './resolveStoredRouteSelection.flow'

type HydrateRoutesSelectionFlowDependencies = {
  workspaceScopeKey: DriverWorkspaceScopeKey
}

export function hydrateRoutesSelectionFlow({
  workspaceScopeKey,
}: HydrateRoutesSelectionFlowDependencies) {
  const routesState = useRoutesStore.getState()
  const routes = selectAllRoutes(routesState)

  if (routes.length === 0) {
    clearSelectedRoute()
    routeSelectionService.clearInvalid(workspaceScopeKey)
    return null
  }

  const storedSelectedRouteClientId = resolveStoredRouteSelectionFlow({
    workspaceScopeKey,
    routesByClientId: routesState.byClientId,
  })

  if (storedSelectedRouteClientId) {
    setSelectedRoute(storedSelectedRouteClientId)
    return storedSelectedRouteClientId
  }

  const currentSelectedRouteClientId = selectSelectedRouteClientId(useRoutesSelectionStore.getState())
  const currentSelectedRoute = currentSelectedRouteClientId
    ? routesState.byClientId[currentSelectedRouteClientId] ?? null
    : null

  if (
    currentSelectedRoute &&
    isPersistedRouteSelectionValid(
      currentSelectedRouteClientId
        ? { routeClientId: currentSelectedRouteClientId, selectedAt: '' }
        : null,
      currentSelectedRoute,
    )
  ) {
    return currentSelectedRoute.client_id
  }

  const defaultRoute = resolveDefaultSelectedRoute(routes)

  if (!defaultRoute) {
    clearSelectedRoute()
    routeSelectionService.clearInvalid(workspaceScopeKey)
    return null
  }

  setSelectedRoute(defaultRoute.client_id)
  return defaultRoute.client_id
}
