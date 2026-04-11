import { createContext, useContext } from 'react'
import type { SessionSnapshot } from '@shared-api'
import type { DriverSessionState } from '../contracts/driverSession.types'
import type { LoginPayload, LoginResponse } from '../services/auth.api'

export type SessionContextValue = {
  session: SessionSnapshot | null
  sessionState: DriverSessionState
  error?: string
  login: (payload: LoginPayload) => Promise<boolean>
  applyTokenResponse: (payload: LoginResponse) => void
  clearSession: () => void
  syncSession: () => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}
