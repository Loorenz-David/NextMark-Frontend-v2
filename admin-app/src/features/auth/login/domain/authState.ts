import type { SessionSnapshot, SessionUser } from '@shared-api'

export type AuthenticationMode = 'single_user' | 'trusted_device'

export type StoredUserSession = SessionSnapshot

export type TrustedDeviceMetadata = {
  clientId: string
  name: string
}

export type AuthStateSnapshot = {
  authenticationMode: AuthenticationMode
  activeUserClientId: string
  sessionsByUserClientId: Record<string, StoredUserSession>
  trustedDevice?: TrustedDeviceMetadata
  updatedAt: number
}

export type AvailableAuthUser = {
  clientId: string
  user: SessionUser
  isActive: boolean
}

/**
 * The single source of truth for "which session is currently acting".
 * Every downstream consumer (API client, header, socket) must resolve the
 * active session through this helper — never `sessions[0]`.
 */
export const deriveActiveSession = (
  state: AuthStateSnapshot | null,
): StoredUserSession | null => {
  if (!state) {
    return null
  }
  return state.sessionsByUserClientId[state.activeUserClientId] ?? null
}

/**
 * Deterministic fallback used when the active user is removed or the persisted
 * active id no longer resolves. Prefers insertion order of the remaining map.
 */
export const selectFallbackActiveUserClientId = (
  sessionsByUserClientId: Record<string, StoredUserSession>,
): string | null => {
  const ids = Object.keys(sessionsByUserClientId)
  return ids.length > 0 ? ids[0] : null
}

/**
 * Single-user mode never switches, so the exact key value is immaterial — it
 * only needs a stable slot. Prefer the real `client_id`, then any stable
 * identifier, so single-user login never breaks while `client_id` rolls out.
 */
export const resolveSingleUserClientId = (
  user: SessionUser | null | undefined,
): string => {
  const clientId = typeof user?.client_id === 'string' ? user.client_id.trim() : ''
  if (clientId) {
    return clientId
  }
  const sessionScopeId =
    typeof user?.session_scope_id === 'string' ? user.session_scope_id.trim() : ''
  if (sessionScopeId) {
    return sessionScopeId
  }
  if (user?.id !== undefined && user.id !== null && `${user.id}`.trim()) {
    return `${user.id}`.trim()
  }
  return 'single-user'
}

export const listAvailableAuthUsers = (
  state: AuthStateSnapshot | null,
): AvailableAuthUser[] => {
  if (!state) {
    return []
  }
  return Object.entries(state.sessionsByUserClientId)
    .map(([clientId, session]) => ({
      clientId,
      user: session.user ?? { client_id: clientId },
      isActive: clientId === state.activeUserClientId,
    }))
}
