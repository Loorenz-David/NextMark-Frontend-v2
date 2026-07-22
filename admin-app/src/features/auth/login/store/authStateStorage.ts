import type { SessionSnapshot } from '@shared-api'

import type {
  AuthStateSnapshot,
  StoredUserSession,
} from '@/features/auth/login/domain/authState'
import {
  deriveActiveSession,
  resolveSingleUserClientId,
  selectFallbackActiveUserClientId,
} from '@/features/auth/login/domain/authState'
import {
  migrateLegacySession,
  parseStoredAuthState,
} from '@/features/auth/login/domain/authStatePersistence'

type AuthStateListener = (state: AuthStateSnapshot | null) => void

const STORAGE_KEY = 'beyo.admin.auth-state'
const LEGACY_STORAGE_KEY = 'beyo.admin.session'
const isBrowser = typeof window !== 'undefined'

/**
 * Normalized, persisted multi-session authentication state.
 *
 * This is the single owner of `beyo.admin.auth-state`. The shared API client
 * never touches it directly — it goes through the active-session adapter in
 * `sessionStorage.ts`, so a token refresh only ever rewrites the active user's
 * entry, never the whole trusted-device collection.
 */
export class AuthStateStorage {
  private listeners = new Set<AuthStateListener>()
  private cached: AuthStateSnapshot | null = null
  private hydrated = false

  getState(): AuthStateSnapshot | null {
    if (!this.hydrated) {
      this.cached = this.read()
      this.hydrated = true
    }
    return this.cached
  }

  setState(state: AuthStateSnapshot): void {
    const next: AuthStateSnapshot = { ...state, updatedAt: Date.now() }
    this.write(next)
  }

  getActiveSession(): StoredUserSession | null {
    return deriveActiveSession(this.getState())
  }

  /**
   * Writeback path used by the API client when it refreshes the active user's
   * access/socket token. Only the active slot is touched.
   */
  updateActiveSession(next: Omit<SessionSnapshot, 'updatedAt'>): void {
    const now = Date.now()
    const nextSession: StoredUserSession = { ...next, updatedAt: now }
    const state = this.getState()

    if (!state) {
      // Edge: a direct setSession before any login state exists — bootstrap a
      // single-user state so the client keeps working.
      const clientId = resolveSingleUserClientId(next.user)
      this.write({
        authenticationMode: 'single_user',
        activeUserClientId: clientId,
        sessionsByUserClientId: { [clientId]: nextSession },
        updatedAt: now,
      })
      return
    }

    this.write({
      ...state,
      sessionsByUserClientId: {
        ...state.sessionsByUserClientId,
        [state.activeUserClientId]: nextSession,
      },
      updatedAt: now,
    })
  }

  setActiveUser(userClientId: string): void {
    const state = this.getState()
    if (!state || !state.sessionsByUserClientId[userClientId]) {
      return
    }
    if (state.activeUserClientId === userClientId) {
      return
    }
    this.write({ ...state, activeUserClientId: userClientId, updatedAt: Date.now() })
  }

  updateSession(
    userClientId: string,
    updater: (session: StoredUserSession) => StoredUserSession,
  ): void {
    const state = this.getState()
    const existing = state?.sessionsByUserClientId[userClientId]
    if (!state || !existing) {
      return
    }
    const updated: StoredUserSession = {
      ...updater(existing),
      updatedAt: Date.now(),
    }
    this.write({
      ...state,
      sessionsByUserClientId: {
        ...state.sessionsByUserClientId,
        [userClientId]: updated,
      },
      updatedAt: Date.now(),
    })
  }

  removeSession(userClientId: string): void {
    const state = this.getState()
    if (!state || !state.sessionsByUserClientId[userClientId]) {
      return
    }

    const remaining = { ...state.sessionsByUserClientId }
    delete remaining[userClientId]

    const fallbackId = selectFallbackActiveUserClientId(remaining)
    if (!fallbackId) {
      this.clear()
      return
    }

    const activeUserClientId =
      state.activeUserClientId === userClientId
        ? fallbackId
        : state.activeUserClientId

    this.write({
      ...state,
      activeUserClientId,
      sessionsByUserClientId: remaining,
      updatedAt: Date.now(),
    })
  }

  clear(): void {
    this.cached = null
    this.hydrated = true
    if (isBrowser) {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    this.emit(null)
  }

  subscribe(listener: AuthStateListener): () => void {
    this.listeners.add(listener)
    listener(this.getState())
    return () => {
      this.listeners.delete(listener)
    }
  }

  private write(state: AuthStateSnapshot): void {
    this.cached = state
    this.hydrated = true
    if (isBrowser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
    this.emit(state)
  }

  private read(): AuthStateSnapshot | null {
    if (!isBrowser) {
      return null
    }

    const rawNew = window.localStorage.getItem(STORAGE_KEY)
    if (rawNew) {
      try {
        const state = parseStoredAuthState(JSON.parse(rawNew), Date.now())
        if (state) {
          return state
        }
      } catch (error) {
        console.warn('Failed to parse stored auth state, clearing it.', error)
      }
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }

    // Migrate a legacy single-session payload, if any.
    const rawLegacy = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!rawLegacy) {
      return null
    }
    window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    try {
      const migrated = migrateLegacySession(JSON.parse(rawLegacy), Date.now())
      if (migrated) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
        return migrated
      }
    } catch (error) {
      console.warn('Failed to migrate legacy session, clearing it.', error)
    }
    return null
  }

  private emit(value: AuthStateSnapshot | null): void {
    this.listeners.forEach((listener) => listener(value))
  }
}

export const authStateStorage = new AuthStateStorage()
