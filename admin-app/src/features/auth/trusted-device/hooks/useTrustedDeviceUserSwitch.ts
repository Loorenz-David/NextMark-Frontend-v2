import { useCallback } from 'react'

import { useAuthSessionStore } from '@/features/auth/login/store/authSessionStore'

/**
 * Orchestrates switching the acting user. The store action validates the target
 * session, replaces the active session locally (persist + normalize + API client
 * + socket identity), and reloads — no login request. Data reloads happen on the
 * fresh boot as the selected user.
 */
export const useTrustedDeviceUserSwitch = () =>
  useCallback((userClientId: string) => {
    useAuthSessionStore.getState().switchActiveUser(userClientId)
  }, [])
