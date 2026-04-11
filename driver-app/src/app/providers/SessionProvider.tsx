import type { PropsWithChildren } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SessionSnapshot } from '@shared-api'
import type { DriverSessionState } from '../contracts/driverSession.types'
import type { LoginPayload, LoginResponse } from '../services/auth.api'
import { authApi } from '../services/auth.api'
import { driverApiClient } from '../services/client'
import { SessionContext } from './session.context'
import { sessionStorage } from '../storage/sessionStorage'

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<SessionSnapshot | null>(() => sessionStorage.getSession())
  const [sessionState, setSessionState] = useState<DriverSessionState>(
    sessionStorage.getSession() ? 'authenticated' : 'anonymous',
  )
  const [error, setError] = useState<string>()

  const handleUnauthenticatedSession = useCallback(() => {
    driverApiClient.clearSession()
    setSession(null)
    setSessionState('anonymous')
    setError('Session expired. Please sign in again.')
  }, [])

  useEffect(() => {
    return sessionStorage.subscribe((nextSession) => {
      setSession(nextSession)
      setSessionState(nextSession ? 'authenticated' : 'anonymous')
    })
  }, [])

  useEffect(() => {
    driverApiClient.setUnauthenticatedHandler(handleUnauthenticatedSession)

    return () => {
      driverApiClient.setUnauthenticatedHandler(undefined)
    }
  }, [handleUnauthenticatedSession])

  const applyTokenResponse = useCallback((payload: LoginResponse) => {
    driverApiClient.setSession({
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      socketToken: payload.socket_token,
      user: payload.user ?? null,
      identity: null,
    })
    setSession(sessionStorage.getSession())
    setSessionState('authenticated')
    setError(undefined)
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    setSessionState('authenticating')
    setError(undefined)

    try {
      const response = await authApi.login(payload)
      if (!response.data?.access_token || !response.data?.refresh_token) {
        setSessionState('anonymous')
        setError('Login response did not contain session tokens.')
        return false
      }

      applyTokenResponse(response.data)
      return true
    } catch (loginError) {
      console.error('Driver login failed', loginError)
      setSessionState('anonymous')
      setError('Unable to sign in.')
      return false
    }
  }, [applyTokenResponse])

  const clearSession = useCallback(() => {
    driverApiClient.clearSession()
    setSession(null)
    setSessionState('anonymous')
    setError(undefined)
  }, [])

  const syncSession = useCallback(() => {
    const next = sessionStorage.getSession()
    setSession(next)
    setSessionState(next ? 'authenticated' : 'anonymous')
  }, [])

  const value = useMemo(() => ({
    session,
    sessionState,
    error,
    login,
    applyTokenResponse,
    clearSession,
    syncSession,
  }), [applyTokenResponse, clearSession, error, login, session, sessionState, syncSession])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
