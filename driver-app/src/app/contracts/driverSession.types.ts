import type { SessionSnapshot } from '@shared-api'

export type DriverSessionState =
  | 'anonymous'
  | 'authenticating'
  | 'authenticated'
  | 'refreshing'
  | 'expired'

export type DriverBaseRole = 'admin' | 'assistant' | 'driver'
export type DriverWorkspaceKind = 'personal' | 'team'

export type DriverCapabilities = {
  canExecuteRoutes: boolean
  canCreateRoutes: boolean
  canEditRoutes: boolean
  canCreateOrders: boolean
  canEditOrders: boolean
  canSwitchWorkspace: boolean
  canViewTeamAssignments: boolean
}

export type DriverWorkspaceScopeKey = string

export type DriverWorkspaceContext = {
  userId: string
  baseRole: DriverBaseRole
  currentWorkspace: DriverWorkspaceKind
  hasTeamWorkspace: boolean
  teamId: string | null
  workspaceScopeKey: DriverWorkspaceScopeKey
  capabilities: DriverCapabilities
}

export type DriverBootstrapResult = {
  restoredSession: boolean
  hydratedWorkspace: boolean
}

export type WorkspaceSwitchCommand = {
  targetWorkspace: DriverWorkspaceKind
}

export type WorkspaceSwitchResponse = {
  access_token: string
  refresh_token: string
  socket_token?: string
  user?: SessionSnapshot['user'] | null
}
