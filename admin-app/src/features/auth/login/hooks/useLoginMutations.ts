import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { authLoginApi } from '@/features/auth/login/api/authLoginApi'
import type {
  LoginPayload,
  TrustedDeviceLoginResponse,
} from '@/features/auth/login/types/authLogin'
import {
  normalizeSingleUserResponse,
  normalizeTrustedDeviceResponse,
} from '@/features/auth/login/domain/normalizeLoginResponse'
import {
  classifyLoginFailure,
  TRUSTED_DEVICE_CREDENTIAL_ERROR,
} from '@/features/auth/login/domain/loginFailure'
import { useAuthSessionStore } from '@/features/auth/login/store/authSessionStore'
import { authStateStorage } from '@/features/auth/login/store/authStateStorage'

const resolveError = (error: unknown, fallback: string) => ({
  message: error instanceof ApiError ? error.message : fallback,
  status: error instanceof ApiError ? error.status : 500,
})

const TRUSTED_DEVICE_USERS_EXCLUDED =
  'Some users assigned to this device are unavailable in the admin application.'

/**
 * Non-blocking, identity-safe message for backend warnings. Excluded-user
 * identities are intentionally not in the response, so nothing is exposed.
 */
const resolveWarningMessage = (warnings: string[]): string | null => {
  if (!warnings.length) {
    return null
  }
  if (warnings.some((warning) => warning.includes('trusted_device_users_excluded'))) {
    return TRUSTED_DEVICE_USERS_EXCLUDED
  }
  return null
}

export function useLoginMutations() {
  const { showMessage } = useMessageHandler()

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { setLoading, setError, setSingleUserSession, setTrustedDeviceSessions } =
        useAuthSessionStore.getState()
      setLoading(true)
      setError(undefined)

      try {
        const response = await authLoginApi.login(payload)
        const data = response.data
        const now = Date.now()

        if (!data) {
          setError('Login response was empty.')
          return null
        }

        // Branch on the discriminant only. A browser enrolled as a trusted
        // device still receives `single_user` when the signing-in user is not
        // assigned to it, so the presence of a stored device credential says
        // nothing about the response shape.
        if (data.authentication_mode === 'trusted_device') {
          const normalized = normalizeTrustedDeviceResponse(
            data as TrustedDeviceLoginResponse,
            now,
          )
          if (!normalized.ok) {
            setError(normalized.error)
            return null
          }
          setTrustedDeviceSessions(normalized.state)
        } else {
          // single_user (and legacy responses without the discriminant).
          const normalized = normalizeSingleUserResponse(data, now)
          if (!normalized.ok) {
            setError(normalized.error)
            return null
          }
          setSingleUserSession(normalized.state)
        }

        const warningMessage = resolveWarningMessage(response.warnings ?? [])
        if (warningMessage) {
          showMessage({ status: 200, message: warningMessage })
        }

        return data
      } catch (error) {
        const resolved = resolveError(error, 'Unable to login.')
        console.error('Failed to login', error)
        // A 410 on /login is a failed login, never an expired session — the
        // backend maps every ValidationFailed to 410. Separate "wrong password"
        // from "this browser's device credential is dead", because the latter
        // fails EVERY login here until the credential is cleared.
        const kind = classifyLoginFailure(resolved.status, resolved.message)
        const message =
          kind === 'trusted_device_credential'
            ? TRUSTED_DEVICE_CREDENTIAL_ERROR
            : resolved.message
        setError(message, kind)
        showMessage({ status: resolved.status, message })
        return null
      } finally {
        setLoading(false)
      }
    },
    [showMessage],
  )

  const clearError = useCallback(() => {
    useAuthSessionStore.getState().setError(undefined)
  }, [])

  /**
   * Full device logout. Clears every stored user session (the whole
   * `sessionsByUserClientId` map and the active pointer), then hard-navigates to
   * login so the entire in-memory context — feature stores, cached queries,
   * socket subscriptions — is discarded with the document. This is the same
   * reset strategy `switchActiveUser` uses, and it is what keeps the previous
   * user's data from surviving into the next user's session.
   *
   * The trusted-device credential is deliberately KEPT: enrollment is
   * device-level, not user-level.
   */
  const logOutDevice = useCallback(() => {
    const { clearAuthenticationState, setError } = useAuthSessionStore.getState()
    setError(undefined)
    clearAuthenticationState()
    if (typeof window !== 'undefined') {
      window.location.replace('/auth/login')
    }
  }, [])

  /**
   * Logs out only the currently-acting user. On a trusted device with other
   * sessions present, a deterministic fallback becomes active and the app
   * reloads as that user; otherwise this is a full device logout.
   */
  const logOutCurrentUser = useCallback(() => {
    const state = authStateStorage.getState()
    if (
      state?.authenticationMode === 'trusted_device' &&
      Object.keys(state.sessionsByUserClientId).length > 1
    ) {
      const { removeUserSession } = useAuthSessionStore.getState()
      removeUserSession(state.activeUserClientId)
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
      return
    }
    logOutDevice()
  }, [logOutDevice])

  return { login, logout: logOutDevice, logOutDevice, logOutCurrentUser, clearError }
}
