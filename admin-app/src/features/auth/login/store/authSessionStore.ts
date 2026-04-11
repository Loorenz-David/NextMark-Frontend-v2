import { create } from 'zustand'

import type { SessionSnapshot } from '@/features/auth/login/store/sessionStorage'
import { sessionStorage } from '@/features/auth/login/store/sessionStorage'
import { apiClient } from '@/lib/api/ApiClient'

export type AuthSessionState = {
  session: SessionSnapshot | null
  isLoading: boolean
  error?: string

  setSession: (session: Omit<SessionSnapshot, 'updatedAt'>) => void
  clearSession: () => void
  syncSession: () => void
  setLoading: (loading: boolean) => void
  setError: (error?: string) => void
}

const initialSession = sessionStorage.getSession()

export const useAuthSessionStore = create<AuthSessionState>((set) => ({
  session: initialSession,
  isLoading: false,
  error: undefined,

  setSession: (session) => {
    apiClient.setSession(session)
    set({ session: sessionStorage.getSession(), error: undefined })
  },

  clearSession: () => {
    apiClient.clearSession()
    set({ session: null })
  },

  syncSession: () => set({ session: sessionStorage.getSession() }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}))

export const selectAuthSession = (state: AuthSessionState) => state.session
export const selectAuthLoading = (state: AuthSessionState) => state.isLoading
export const selectAuthError = (state: AuthSessionState) => state.error
