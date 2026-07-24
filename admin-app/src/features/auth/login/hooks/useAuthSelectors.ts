import { useMemo } from 'react'

import type {
  AuthenticationMode,
  AvailableAuthUser,
  TrustedDeviceMetadata,
} from '@/features/auth/login/domain/authState'
import { listAvailableAuthUsers } from '@/features/auth/login/domain/authState'
import type { LoginFailureKind } from '@/features/auth/login/domain/loginFailure'
import type { SessionUser } from '@/features/auth/login/store/sessionStorage'
import {
  selectAuthError,
  selectAuthErrorKind,
  selectAuthLoading,
  selectAuthSession,
  selectAuthState,
  useAuthSessionStore,
} from '@/features/auth/login/store/authSessionStore'

export const useAuthSession = () => useAuthSessionStore(selectAuthSession)

export const useAuthLoading = () => useAuthSessionStore(selectAuthLoading)

export const useAuthError = () => useAuthSessionStore(selectAuthError)

export const useAuthErrorKind = (): LoginFailureKind | undefined =>
  useAuthSessionStore(selectAuthErrorKind)

export const useAuthenticationMode = (): AuthenticationMode =>
  useAuthSessionStore(
    (state) => selectAuthState(state)?.authenticationMode ?? 'single_user',
  )

export const useActiveAuthUser = (): SessionUser | null =>
  useAuthSessionStore((state) => selectAuthSession(state)?.user ?? null)

export const useActiveAuthUserClientId = (): string | null =>
  useAuthSessionStore((state) => selectAuthState(state)?.activeUserClientId ?? null)

export const useTrustedDevice = (): TrustedDeviceMetadata | null =>
  useAuthSessionStore((state) => selectAuthState(state)?.trustedDevice ?? null)

export const useAvailableAuthUsers = (): AvailableAuthUser[] => {
  // Select the stable `authState` reference and derive the array with useMemo.
  // Building the array inside the store selector returns a new reference on every
  // render (new element objects), which breaks useSyncExternalStore's snapshot
  // caching and triggers an infinite update loop.
  const authState = useAuthSessionStore(selectAuthState)
  return useMemo(() => listAvailableAuthUsers(authState), [authState])
}

export const useCanSwitchAuthUser = (): boolean =>
  useAuthSessionStore((state) => {
    const authState = selectAuthState(state)
    return (
      authState?.authenticationMode === 'trusted_device' &&
      Object.keys(authState.sessionsByUserClientId).length > 1
    )
  })
