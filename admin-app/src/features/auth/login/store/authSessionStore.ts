import { create } from 'zustand'

import type { SessionSnapshot } from '@/features/auth/login/store/sessionStorage'
import type { AuthStateSnapshot } from '@/features/auth/login/domain/authState'
import { deriveActiveSession } from '@/features/auth/login/domain/authState'
import type { LoginFailureKind } from '@/features/auth/login/domain/loginFailure'
import { authStateStorage } from '@/features/auth/login/store/authStateStorage'
import { setAuthNotice } from '@/features/auth/login/store/authNotice'
import { apiClient } from '@/lib/api/ApiClient'

const isBrowser = typeof window !== 'undefined'

const PREVIOUS_ACCOUNT_UNAVAILABLE =
  'The previous account is no longer available on this device.'

export type AuthSessionState = {
  authState: AuthStateSnapshot | null
  /** Derived active session — what existing consumers of `useAuthSession()` receive. */
  session: SessionSnapshot | null
  isLoading: boolean
  error?: string
  /** Why the last login failed — drives the recovery affordance on the form. */
  errorKind?: LoginFailureKind

  setAuthenticationState: (state: AuthStateSnapshot) => void
  setSingleUserSession: (state: AuthStateSnapshot) => void
  setTrustedDeviceSessions: (state: AuthStateSnapshot) => void
  switchActiveUser: (userClientId: string) => void
  updateUserAccessToken: (userClientId: string, accessToken: string) => void
  updateUserSocketToken: (userClientId: string, socketToken: string) => void
  removeUserSession: (userClientId: string) => void
  clearAuthenticationState: () => void
  syncAuthenticationState: () => void
  /**
   * Terminal refresh-failure handler. Returns true when it evicted the active
   * user and reloaded (trusted-device with sessions remaining); false when the
   * caller should redirect to login.
   */
  handleTerminalAuthFailure: () => boolean

  setLoading: (loading: boolean) => void
  setError: (error?: string, errorKind?: LoginFailureKind) => void
}

const initialState = authStateStorage.getState()

/** Persist the state, then normalize the active session's identity via the
 * shared client (decodes its JWT and writes the normalized session back into
 * the active slot). Only the active user is normalized; others are stored as
 * returned by the backend. */
const applyAuthState = (state: AuthStateSnapshot): void => {
  authStateStorage.setState(state)
  const active = deriveActiveSession(state)
  if (active) {
    apiClient.setSession(active)
  }
}

export const useAuthSessionStore = create<AuthSessionState>((set) => ({
  authState: initialState,
  session: deriveActiveSession(initialState),
  isLoading: false,
  error: undefined,
  errorKind: undefined,

  setAuthenticationState: (state) => {
    applyAuthState(state)
    set({ error: undefined, errorKind: undefined })
  },

  setSingleUserSession: (state) => {
    applyAuthState(state)
    set({ error: undefined, errorKind: undefined })
  },

  setTrustedDeviceSessions: (state) => {
    applyAuthState(state)
    set({ error: undefined, errorKind: undefined })
  },

  switchActiveUser: (userClientId) => {
    const state = authStateStorage.getState()
    if (!state || !state.sessionsByUserClientId[userClientId]) {
      return
    }
    if (state.activeUserClientId === userClientId) {
      return
    }

    authStateStorage.setActiveUser(userClientId)
    // Normalize the newly-active user's identity from its own access token.
    const active = authStateStorage.getActiveSession()
    if (active) {
      apiClient.setSession(active)
    }

    // Local, synchronous context replacement. The reload re-boots the API
    // client, socket identity, entity stores, popups and bootstrap as the
    // selected user — no login request, no cross-user data leak.
    if (isBrowser) {
      window.location.reload()
    }
  },

  updateUserAccessToken: (userClientId, accessToken) => {
    authStateStorage.updateSession(userClientId, (existing) => ({
      ...existing,
      accessToken,
    }))
  },

  updateUserSocketToken: (userClientId, socketToken) => {
    authStateStorage.updateSession(userClientId, (existing) => ({
      ...existing,
      socketToken,
    }))
  },

  removeUserSession: (userClientId) => {
    authStateStorage.removeSession(userClientId)
  },

  clearAuthenticationState: () => {
    apiClient.clearSession()
  },

  syncAuthenticationState: () => {
    const state = authStateStorage.getState()
    set({ authState: state, session: deriveActiveSession(state) })
  },

  handleTerminalAuthFailure: () => {
    const state = authStateStorage.getState()
    if (state?.authenticationMode === 'trusted_device') {
      const remaining = Object.keys(state.sessionsByUserClientId).length
      if (remaining > 1) {
        setAuthNotice(PREVIOUS_ACCOUNT_UNAVAILABLE)
        // Remove only the failed active user; a deterministic fallback becomes
        // active. Other trusted-device sessions are preserved.
        authStateStorage.removeSession(state.activeUserClientId)
        if (isBrowser) {
          window.location.reload()
        }
        return true
      }
    }
    // Single-user, or the last trusted-device session: clear and let the caller
    // redirect to login.
    authStateStorage.clear()
    return false
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error, errorKind) => set({ error, errorKind }),
}))

// Keep the zustand mirror in sync with every storage-level mutation — including
// those originating outside the store (e.g. the API client's token-refresh
// writeback through the active-session adapter).
authStateStorage.subscribe((state) => {
  useAuthSessionStore.setState({
    authState: state,
    session: deriveActiveSession(state),
  })
})

export const selectAuthSession = (state: AuthSessionState) => state.session
export const selectAuthState = (state: AuthSessionState) => state.authState
export const selectAuthLoading = (state: AuthSessionState) => state.isLoading
export const selectAuthError = (state: AuthSessionState) => state.error
export const selectAuthErrorKind = (state: AuthSessionState) => state.errorKind
