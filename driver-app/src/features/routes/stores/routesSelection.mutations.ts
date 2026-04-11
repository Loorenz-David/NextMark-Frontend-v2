import { useRoutesSelectionStore } from './routesSelection.store'

export function setSelectedRoute(routeClientId: string | null) {
  useRoutesSelectionStore.getState().setSelectedRouteClientId(routeClientId)
}

export function clearSelectedRoute() {
  useRoutesSelectionStore.getState().clearSelectedRouteClientId()
}
