import type {
  DriverCapabilities,
  DriverWorkspaceKind,
} from '../contracts/driverSession.types'

const PERSONAL_WORKSPACE: DriverWorkspaceKind = 'personal'

export function buildDriverCapabilities(currentWorkspace: DriverWorkspaceKind): DriverCapabilities {
  const isPersonalWorkspace = currentWorkspace === PERSONAL_WORKSPACE

  return {
    canExecuteRoutes: true,
    canCreateRoutes: isPersonalWorkspace,
    canEditRoutes: isPersonalWorkspace,
    canCreateOrders: isPersonalWorkspace,
    canEditOrders: isPersonalWorkspace,
    canSwitchWorkspace: true,
    canViewTeamAssignments: !isPersonalWorkspace,
  }
}
