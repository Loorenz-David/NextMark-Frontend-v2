import type { SessionSnapshot, SessionUser } from '@shared-api'

import type {
  SingleUserLoginResponse,
  TrustedDeviceLoginResponse,
  TrustedDeviceSessionResponse,
} from '@/features/auth/login/types/authLogin'
import type { AuthStateSnapshot, StoredUserSession } from './authState'
import { resolveSingleUserClientId } from './authState'

export type NormalizeResult =
  | { ok: true; state: AuthStateSnapshot }
  | { ok: false; error: string }

type LoginLocationFields = {
  country_code?: string | null
  city?: string | null
  default_country_code?: string | null
  default_city_key?: string | null
}

const fail = (error: string, reason: string): NormalizeResult => {
  // Safe diagnostic only — never log tokens or the raw response body.
  console.warn('Login response normalization failed.', { reason })
  return { ok: false, error }
}

const mergeUserLocation = (
  user: SessionUser,
  location: LoginLocationFields,
): SessionUser => ({
  ...user,
  default_country_code:
    location.default_country_code ?? user.default_country_code ?? null,
  default_city_key: location.default_city_key ?? user.default_city_key ?? null,
  country_code: location.country_code ?? user.country_code ?? null,
  city: location.city ?? user.city ?? null,
})

const buildIdentity = (user: SessionUser, location: LoginLocationFields) => ({
  default_country_code:
    location.default_country_code ?? user.default_country_code ?? null,
  default_city_key: location.default_city_key ?? user.default_city_key ?? null,
  country_code: location.country_code ?? user.country_code ?? null,
  city: location.city ?? user.city ?? null,
})

const buildStoredSession = (
  tokens: {
    access_token: string
    refresh_token: string
    socket_token?: string
  },
  user: SessionUser,
  location: LoginLocationFields,
  now: number,
): StoredUserSession => {
  const session: SessionSnapshot = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    user: mergeUserLocation(user, location),
    identity: buildIdentity(user, location),
    updatedAt: now,
  }
  if (tokens.socket_token) {
    session.socketToken = tokens.socket_token
  }
  return session
}

export const normalizeSingleUserResponse = (
  data: SingleUserLoginResponse | null | undefined,
  now: number,
): NormalizeResult => {
  if (!data?.access_token || !data?.refresh_token) {
    return fail('Login response missing tokens.', 'missing_tokens')
  }

  const user = data.user ?? null
  if (!user) {
    return fail('Login response missing user.', 'missing_user')
  }

  const clientId = resolveSingleUserClientId(user)
  const session = buildStoredSession(data, user, data, now)

  return {
    ok: true,
    state: {
      authenticationMode: 'single_user',
      activeUserClientId: clientId,
      sessionsByUserClientId: { [clientId]: session },
      updatedAt: now,
    },
  }
}

export const normalizeTrustedDeviceResponse = (
  data: TrustedDeviceLoginResponse,
  now: number,
): NormalizeResult => {
  const device = data.trusted_device
  if (
    !device ||
    typeof device.client_id !== 'string' ||
    !device.client_id.trim()
  ) {
    return fail('Invalid trusted-device information.', 'invalid_device')
  }

  const activeUserClientId =
    typeof data.active_user_client_id === 'string'
      ? data.active_user_client_id.trim()
      : ''
  if (!activeUserClientId) {
    return fail('Trusted-device response missing active user.', 'missing_active')
  }

  if (!Array.isArray(data.sessions) || data.sessions.length === 0) {
    return fail('Trusted-device response has no sessions.', 'empty_sessions')
  }

  const sessionsByUserClientId: Record<string, StoredUserSession> = {}

  for (const raw of data.sessions as TrustedDeviceSessionResponse[]) {
    const sessionUserClientId =
      typeof raw.user_client_id === 'string' ? raw.user_client_id.trim() : ''
    const userClientId =
      typeof raw.user?.client_id === 'string' ? raw.user.client_id.trim() : ''

    if (!sessionUserClientId) {
      return fail(
        'A trusted-device session is missing its user identifier.',
        'session_missing_id',
      )
    }
    if (!userClientId) {
      return fail(
        'A trusted-device session user is missing client_id.',
        'user_missing_client_id',
      )
    }
    if (sessionUserClientId !== userClientId) {
      return fail(
        'A trusted-device session identifier mismatch.',
        'client_id_mismatch',
      )
    }
    if (!raw.access_token || !raw.refresh_token) {
      return fail(
        'A trusted-device session is missing tokens.',
        'session_missing_tokens',
      )
    }
    if (sessionsByUserClientId[sessionUserClientId]) {
      return fail('Duplicate trusted-device session.', 'duplicate_session')
    }

    sessionsByUserClientId[sessionUserClientId] = buildStoredSession(
      raw,
      raw.user,
      raw,
      now,
    )
  }

  if (!sessionsByUserClientId[activeUserClientId]) {
    return fail(
      'Active user is not present in trusted-device sessions.',
      'active_not_in_sessions',
    )
  }

  return {
    ok: true,
    state: {
      authenticationMode: 'trusted_device',
      activeUserClientId,
      sessionsByUserClientId,
      trustedDevice: { clientId: device.client_id, name: device.name },
      updatedAt: now,
    },
  }
}
