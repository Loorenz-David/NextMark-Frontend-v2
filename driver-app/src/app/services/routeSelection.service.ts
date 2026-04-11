import type { DriverWorkspaceScopeKey } from '../contracts/driverSession.types'
import {
  routeSelectionStorage,
  type PersistedRouteSelection,
} from '../storage/routeSelectionStorage'

export const routeSelectionService = {
  get: (workspaceScopeKey: DriverWorkspaceScopeKey): PersistedRouteSelection | null =>
    routeSelectionStorage.get(workspaceScopeKey),
  set: (workspaceScopeKey: DriverWorkspaceScopeKey, selection: PersistedRouteSelection) =>
    routeSelectionStorage.set(workspaceScopeKey, selection),
  clear: (workspaceScopeKey: DriverWorkspaceScopeKey) =>
    routeSelectionStorage.clear(workspaceScopeKey),
  clearInvalid: (workspaceScopeKey: DriverWorkspaceScopeKey) =>
    routeSelectionStorage.clearInvalid(workspaceScopeKey),
}

export type { PersistedRouteSelection } from '../storage/routeSelectionStorage'
