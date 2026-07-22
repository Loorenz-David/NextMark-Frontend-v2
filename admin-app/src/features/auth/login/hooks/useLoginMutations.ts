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
        setError(resolved.message)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      } finally {
        setLoading(false)
      }
    },
    [showMessage],
  )

  /** Full device logout — clears every stored user session and auth state. */
  const logOutDevice = useCallback(() => {
    const { clearAuthenticationState, setError } = useAuthSessionStore.getState()
    setError(undefined)
    clearAuthenticationState()
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

  return { login, logout: logOutDevice, logOutDevice, logOutCurrentUser }
}
