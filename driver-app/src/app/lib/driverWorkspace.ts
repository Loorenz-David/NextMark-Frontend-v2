import type { SessionSnapshot } from '@shared-api'
import type {
  DriverBaseRole,
  DriverWorkspaceContext,
  DriverWorkspaceKind,
  DriverWorkspaceScopeKey,
} from '../contracts/driverSession.types'
import { buildDriverCapabilities } from './driverCapabilities.policy'

const ADMIN_ROLE: DriverBaseRole = 'admin'
const ASSISTANT_ROLE: DriverBaseRole = 'assistant'
const DRIVER_ROLE: DriverBaseRole = 'driver'
const PERSONAL_WORKSPACE: DriverWorkspaceKind = 'personal'
const TEAM_WORKSPACE: DriverWorkspaceKind = 'team'

const resolveBaseRoleFromUnknown = (value: unknown): DriverBaseRole | null => {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()
  if (normalized === ADMIN_ROLE || normalized === ASSISTANT_ROLE || normalized === DRIVER_ROLE) {
    return normalized
  }

  return null
}

const resolveBaseRoleFromId = (value: unknown): DriverBaseRole | null => {
  if (value === 1) return ADMIN_ROLE
  if (value === 2) return ASSISTANT_ROLE
  if (value === 3) return DRIVER_ROLE
  return null
}

const resolveWorkspaceFromUnknown = (value: unknown): DriverWorkspaceKind | null => {
  if (value !== PERSONAL_WORKSPACE && value !== TEAM_WORKSPACE) {
    return null
  }

  return value
}

export const resolveDriverBaseRole = (session: SessionSnapshot | null): DriverBaseRole => (
  resolveBaseRoleFromUnknown(session?.user?.base_role)
  ?? resolveBaseRoleFromUnknown(session?.identity?.base_role)
  ?? resolveBaseRoleFromId(session?.user?.base_role_id)
  ?? resolveBaseRoleFromId(session?.identity?.base_role_id)
  ?? ADMIN_ROLE
)

export const resolveCurrentWorkspace = (session: SessionSnapshot | null): DriverWorkspaceKind => (
  resolveWorkspaceFromUnknown(session?.user?.current_workspace)
  ?? resolveWorkspaceFromUnknown(session?.identity?.current_workspace)
  ?? PERSONAL_WORKSPACE
)

export const resolveHasTeamWorkspace = (session: SessionSnapshot | null): boolean => {
  const explicit =
    typeof session?.user?.has_team_workspace === 'boolean'
      ? session.user.has_team_workspace
      : typeof session?.identity?.has_team_workspace === 'boolean'
        ? session.identity.has_team_workspace
        : null

  if (explicit != null) {
    return explicit
  }

  return resolveCurrentWorkspace(session) === TEAM_WORKSPACE
}

export const resolveTeamId = (session: SessionSnapshot | null): string | null => {
  const raw = session?.identity?.active_team_id
    ?? session?.identity?.team_id
    ?? session?.user?.active_team_id
    ?? session?.user?.teamId
    ?? null
  if (raw == null) return null
  const normalized = String(raw).trim()
  return normalized || null
}

export const buildWorkspaceScopeKey = (
  userId: string,
  currentWorkspace: DriverWorkspaceKind,
  baseRole: DriverBaseRole,
  teamId: string | null,
): DriverWorkspaceScopeKey => `${userId}:${currentWorkspace}:${baseRole}:${teamId ?? 'no-team'}`

export const buildWorkspaceContext = (
  session: SessionSnapshot | null,
): DriverWorkspaceContext | null => {
  if (!session?.accessToken) return null

  const userId = String(
    session.user?.id
    ?? session.identity?.user_id
    ?? 'anonymous-driver',
  )

  const baseRole = resolveDriverBaseRole(session)
  const currentWorkspace = resolveCurrentWorkspace(session)
  const hasTeamWorkspace = resolveHasTeamWorkspace(session)
  const teamId = resolveTeamId(session)
  const capabilities = buildDriverCapabilities(currentWorkspace)

  return {
    userId,
    baseRole,
    currentWorkspace,
    hasTeamWorkspace,
    teamId,
    workspaceScopeKey: buildWorkspaceScopeKey(userId, currentWorkspace, baseRole, teamId),
    capabilities,
  }
}
