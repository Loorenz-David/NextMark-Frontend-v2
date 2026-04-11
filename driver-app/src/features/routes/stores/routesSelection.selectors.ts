import type { RoutesSelectionStoreState } from './routesSelection.store'
import type { EntityTable } from '@shared-store'
import type { DriverRouteRecord } from '../domain'

export function selectSelectedRouteClientId(state: RoutesSelectionStoreState) {
  return state.selectedRouteClientId
}

export function selectSelectedRoute(
  selectionState: RoutesSelectionStoreState,
  routesState: EntityTable<DriverRouteRecord>,
) {
  const selectedRouteClientId = selectionState.selectedRouteClientId

  if (!selectedRouteClientId) {
    return null
  }

  return routesState.byClientId[selectedRouteClientId] ?? null
}
