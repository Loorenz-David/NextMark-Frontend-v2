import {
  selectAuthError,
  selectAuthLoading,
  selectAuthSession,
  useAuthSessionStore,
} from '@/features/auth/login/store/authSessionStore'

export const useAuthSession = () => useAuthSessionStore(selectAuthSession)

export const useAuthLoading = () => useAuthSessionStore(selectAuthLoading)

export const useAuthError = () => useAuthSessionStore(selectAuthError)
