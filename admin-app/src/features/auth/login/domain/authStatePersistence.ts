import type { SessionSnapshot } from '@shared-api'

import type {
  AuthStateSnapshot,
  AuthenticationMode,
  StoredUserSession,
} from './authState'

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isValidStoredSession = (value: unknown): value is StoredUserSession =>
  isPlainRecord(value) &&
  typeof value.accessToken === 'string' &&
  value.accessToken.length > 0 &&
  typeof value.refreshToken === 'string' &&
  value.refreshToken.length > 0

const isAuthenticationMode = (value: unknown): value is AuthenticationMode =>
  value === 'single_user' || value === 'trusted_device'

/**
 * Validates and repairs a persisted auth-state payload read from storage.
 * - Drops structurally-invalid sessions.
 * - Falls back to a deterministic active user when the stored active id no
 *   longer resolves.
 * Returns null when nothing usable remains (caller should clear + require login).
 */
export const parseStoredAuthState = (
  parsed: unknown,
  now: number,
): AuthStateSnapshot | null => {
  if (!isPlainRecord(parsed)) {
    return null
  }
  if (!isAuthenticationMode(parsed.authenticationMode)) {
    return null
  }
  if (!isPlainRecord(parsed.sessionsByUserClientId)) {
    return null
  }

  const rawSessions = parsed.sessionsByUserClientId
  const sessionsByUserClientId: Record<string, StoredUserSession> = {}
  for (const id of Object.keys(rawSessions)) {
    const candidate = rawSessions[id]
    if (isValidStoredSession(candidate)) {
      sessionsByUserClientId[id] = candidate
    }
  }

  const ids = Object.keys(sessionsByUserClientId)
  if (ids.length === 0) {
    return null
  }

  let activeUserClientId =
    typeof parsed.activeUserClientId === 'string' ? parsed.activeUserClientId : ''
  if (!activeUserClientId || !sessionsByUserClientId[activeUserClientId]) {
    activeUserClientId = ids[0]
  }

  const trustedDevice =
    isPlainRecord(parsed.trustedDevice) &&
    typeof parsed.trustedDevice.clientId === 'string' &&
    typeof parsed.trustedDevice.name === 'string'
      ? {
          clientId: parsed.trustedDevice.clientId,
          name: parsed.trustedDevice.name,
        }
      : undefined

  return {
    authenticationMode: parsed.authenticationMode,
    activeUserClientId,
    sessionsByUserClientId,
    trustedDevice,
    updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : now,
  }
}

/**
 * Migrates a legacy single `SessionSnapshot` (stored under `beyo.admin.session`)
 * into the normalized multi-session shape. Returns null when the legacy user
 * lacks a stable `client_id` — per contract we clear it and require re-login
 * rather than synthesizing an unstable key.
 */
export const migrateLegacySession = (
  legacy: unknown,
  now: number,
): AuthStateSnapshot | null => {
  if (!isValidStoredSession(legacy)) {
    return null
  }
  const session = legacy as SessionSnapshot
  const clientId =
    typeof session.user?.client_id === 'string'
      ? session.user.client_id.trim()
      : ''
  if (!clientId) {
    return null
  }
  return {
    authenticationMode: 'single_user',
    activeUserClientId: clientId,
    sessionsByUserClientId: {
      [clientId]: { ...session, updatedAt: session.updatedAt || now },
    },
    updatedAt: now,
  }
}
