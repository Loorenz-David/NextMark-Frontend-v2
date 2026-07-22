import type { SessionUser } from '@shared-api'

import type {
  SingleUserLoginResponse,
  TrustedDeviceLoginResponse,
} from '@/features/auth/login/types/authLogin'
import {
  normalizeSingleUserResponse,
  normalizeTrustedDeviceResponse,
} from '../normalizeLoginResponse'
import { migrateLegacySession, parseStoredAuthState } from '../authStatePersistence'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const NOW = 1_700_000_000_000

const makeUser = (clientId: string): SessionUser => ({
  client_id: clientId,
  id: clientId,
  username: `user-${clientId}`,
  email: `${clientId}@example.com`,
})

const singleUserSession = (
  clientId: string,
): TrustedDeviceLoginResponse['sessions'][number] => ({
  user_client_id: clientId,
  access_token: `access-${clientId}`,
  refresh_token: `refresh-${clientId}`,
  socket_token: `socket-${clientId}`,
  user: makeUser(clientId),
})

export const runNormalizeLoginResponseTests = () => {
  // single-user normalization
  {
    const response: SingleUserLoginResponse = {
      authentication_mode: 'single_user',
      access_token: 'a1',
      refresh_token: 'r1',
      socket_token: 's1',
      user: makeUser('u1'),
    }
    const result = normalizeSingleUserResponse(response, NOW)
    assert(result.ok, 'single-user response should normalize')
    if (result.ok) {
      assert(
        result.state.authenticationMode === 'single_user',
        'mode should be single_user',
      )
      assert(
        result.state.activeUserClientId === 'u1',
        'active user should be keyed by client_id',
      )
      assert(
        result.state.sessionsByUserClientId.u1?.accessToken === 'a1',
        'active session should carry the access token',
      )
    }
  }

  // single-user missing tokens -> rejected with the historical message
  {
    const result = normalizeSingleUserResponse(
      {
        authentication_mode: 'single_user',
        access_token: '',
        refresh_token: '',
        user: makeUser('u1'),
      } as SingleUserLoginResponse,
      NOW,
    )
    assert(!result.ok, 'missing tokens should be rejected')
    if (!result.ok) {
      assert(
        result.error === 'Login response missing tokens.',
        'error message should be preserved',
      )
    }
  }

  // trusted-device normalization + active selected by explicit id (not sessions[0])
  {
    const response: TrustedDeviceLoginResponse = {
      authentication_mode: 'trusted_device',
      trusted_device: { client_id: 'device-1', name: 'Front desk' },
      active_user_client_id: 'u2',
      sessions: [singleUserSession('u1'), singleUserSession('u2')],
    }
    const result = normalizeTrustedDeviceResponse(response, NOW)
    assert(result.ok, 'trusted-device response should normalize')
    if (result.ok) {
      assert(
        result.state.authenticationMode === 'trusted_device',
        'mode should be trusted_device',
      )
      assert(
        result.state.activeUserClientId === 'u2',
        'active user must follow explicit active_user_client_id, not sessions[0]',
      )
      assert(
        Object.keys(result.state.sessionsByUserClientId).length === 2,
        'all sessions should be stored',
      )
      assert(
        result.state.trustedDevice?.clientId === 'device-1',
        'trusted-device metadata should be captured',
      )
    }
  }

  // duplicate user_client_id rejection
  {
    const response: TrustedDeviceLoginResponse = {
      authentication_mode: 'trusted_device',
      trusted_device: { client_id: 'device-1', name: 'Front desk' },
      active_user_client_id: 'u1',
      sessions: [singleUserSession('u1'), singleUserSession('u1')],
    }
    assert(
      !normalizeTrustedDeviceResponse(response, NOW).ok,
      'duplicate sessions should be rejected',
    )
  }

  // user_client_id vs user.client_id mismatch rejection
  {
    const mismatched = singleUserSession('u1')
    mismatched.user = makeUser('different')
    const response: TrustedDeviceLoginResponse = {
      authentication_mode: 'trusted_device',
      trusted_device: { client_id: 'device-1', name: 'Front desk' },
      active_user_client_id: 'u1',
      sessions: [mismatched],
    }
    assert(
      !normalizeTrustedDeviceResponse(response, NOW).ok,
      'client_id mismatch should be rejected',
    )
  }

  // missing user.client_id rejection
  {
    const noClientId = singleUserSession('u1')
    noClientId.user = { id: 'u1', username: 'user-u1' }
    const response: TrustedDeviceLoginResponse = {
      authentication_mode: 'trusted_device',
      trusted_device: { client_id: 'device-1', name: 'Front desk' },
      active_user_client_id: 'u1',
      sessions: [noClientId],
    }
    assert(
      !normalizeTrustedDeviceResponse(response, NOW).ok,
      'session user missing client_id should be rejected',
    )
  }

  // active id not present in sessions rejection
  {
    const response: TrustedDeviceLoginResponse = {
      authentication_mode: 'trusted_device',
      trusted_device: { client_id: 'device-1', name: 'Front desk' },
      active_user_client_id: 'u3',
      sessions: [singleUserSession('u1'), singleUserSession('u2')],
    }
    assert(
      !normalizeTrustedDeviceResponse(response, NOW).ok,
      'active user absent from sessions should be rejected',
    )
  }

  // legacy single-session migration
  {
    const legacy = {
      accessToken: 'a1',
      refreshToken: 'r1',
      socketToken: 's1',
      user: makeUser('u1'),
      updatedAt: 123,
    }
    const migrated = migrateLegacySession(legacy, NOW)
    assert(migrated !== null, 'legacy session with client_id should migrate')
    assert(
      migrated?.authenticationMode === 'single_user',
      'migrated state should be single_user',
    )
    assert(
      migrated?.activeUserClientId === 'u1',
      'migrated active user should be the legacy user client_id',
    )
    assert(
      migrated?.sessionsByUserClientId.u1?.accessToken === 'a1',
      'migrated session should carry the legacy tokens',
    )
  }

  // legacy session without client_id -> not migrated (require login)
  {
    const legacy = {
      accessToken: 'a1',
      refreshToken: 'r1',
      user: { id: 'u1', username: 'u1' },
      updatedAt: 123,
    }
    assert(
      migrateLegacySession(legacy, NOW) === null,
      'legacy session lacking client_id must not migrate to an unstable key',
    )
  }

  // persisted round-trip: normalized state survives JSON persistence + reparse
  {
    const response: TrustedDeviceLoginResponse = {
      authentication_mode: 'trusted_device',
      trusted_device: { client_id: 'device-1', name: 'Front desk' },
      active_user_client_id: 'u2',
      sessions: [singleUserSession('u1'), singleUserSession('u2')],
    }
    const normalized = normalizeTrustedDeviceResponse(response, NOW)
    assert(normalized.ok, 'precondition: normalization succeeds')
    if (normalized.ok) {
      const roundTripped = parseStoredAuthState(
        JSON.parse(JSON.stringify(normalized.state)),
        NOW,
      )
      assert(roundTripped !== null, 'stored state should reparse')
      assert(
        Object.keys(roundTripped?.sessionsByUserClientId ?? {}).length === 2,
        'all sessions should survive a persistence round-trip',
      )
      assert(
        roundTripped?.activeUserClientId === 'u2',
        'active user should survive a persistence round-trip',
      )
    }
  }

  // corrupted stored state with a missing active user -> deterministic fallback
  {
    const repaired = parseStoredAuthState(
      {
        authenticationMode: 'trusted_device',
        activeUserClientId: 'gone',
        sessionsByUserClientId: {
          u1: {
            accessToken: 'a1',
            refreshToken: 'r1',
            updatedAt: 1,
          },
        },
        updatedAt: 1,
      },
      NOW,
    )
    assert(repaired !== null, 'partially-corrupt state should be repaired')
    assert(
      repaired?.activeUserClientId === 'u1',
      'missing active user should fall back deterministically to a stored session',
    )
  }
}
