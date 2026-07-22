import type { AuthStateSnapshot } from '@/features/auth/login/domain/authState'
import { AuthStateStorage } from '../authStateStorage'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const makeSession = (clientId: string) => ({
  accessToken: `access-${clientId}`,
  refreshToken: `refresh-${clientId}`,
  socketToken: `socket-${clientId}`,
  user: { client_id: clientId, username: `user-${clientId}` },
  identity: null,
  updatedAt: 1,
})

const makeTrustedState = (
  activeUserClientId: string,
  ids: string[],
): AuthStateSnapshot => ({
  authenticationMode: 'trusted_device',
  activeUserClientId,
  sessionsByUserClientId: Object.fromEntries(
    ids.map((id) => [id, makeSession(id)]),
  ),
  trustedDevice: { clientId: 'device-1', name: 'Front desk' },
  updatedAt: 1,
})

export const runAuthStateStorageTests = () => {
  // getActiveSession resolves the active slot
  {
    const storage = new AuthStateStorage()
    storage.setState(makeTrustedState('u2', ['u1', 'u2']))
    assert(
      storage.getActiveSession()?.accessToken === 'access-u2',
      'active session should resolve the active user slot',
    )
  }

  // switch active user
  {
    const storage = new AuthStateStorage()
    storage.setState(makeTrustedState('u1', ['u1', 'u2']))
    storage.setActiveUser('u2')
    assert(
      storage.getState()?.activeUserClientId === 'u2',
      'setActiveUser should change the active user',
    )
    assert(
      storage.getActiveSession()?.accessToken === 'access-u2',
      'active session should follow the new active user',
    )
  }

  // switching to an unknown user is a no-op
  {
    const storage = new AuthStateStorage()
    storage.setState(makeTrustedState('u1', ['u1', 'u2']))
    storage.setActiveUser('ghost')
    assert(
      storage.getState()?.activeUserClientId === 'u1',
      'switching to an unknown user should be a no-op',
    )
  }

  // updateActiveSession rewrites only the active slot
  {
    const storage = new AuthStateStorage()
    storage.setState(makeTrustedState('u1', ['u1', 'u2']))
    storage.updateActiveSession({
      ...makeSession('u1'),
      accessToken: 'rotated-u1',
    })
    const state = storage.getState()
    assert(
      state?.sessionsByUserClientId.u1?.accessToken === 'rotated-u1',
      'active user access token should be updated',
    )
    assert(
      state?.sessionsByUserClientId.u2?.accessToken === 'access-u2',
      'other users must be untouched when the active token refreshes',
    )
  }

  // updateSession updates a single user only (independent per-user refresh)
  {
    const storage = new AuthStateStorage()
    storage.setState(makeTrustedState('u1', ['u1', 'u2']))
    storage.updateSession('u2', (existing) => ({
      ...existing,
      accessToken: 'rotated-u2',
    }))
    const state = storage.getState()
    assert(
      state?.sessionsByUserClientId.u2?.accessToken === 'rotated-u2',
      'targeted user access token should update',
    )
    assert(
      state?.sessionsByUserClientId.u1?.accessToken === 'access-u1',
      'non-targeted users must be untouched',
    )
    storage.updateSession('u2', (existing) => ({
      ...existing,
      socketToken: 'rotated-socket-u2',
    }))
    assert(
      storage.getState()?.sessionsByUserClientId.u2?.socketToken ===
        'rotated-socket-u2',
      'socket token should update independently',
    )
  }

  // remove an inactive user preserves the rest and the active user
  {
    const storage = new AuthStateStorage()
    storage.setState(makeTrustedState('u1', ['u1', 'u2', 'u3']))
    storage.removeSession('u2')
    const state = storage.getState()
    assert(
      state !== null && !('u2' in state.sessionsByUserClientId),
      'removed user should be gone',
    )
    assert(
      state?.activeUserClientId === 'u1',
      'active user should be unchanged when removing an inactive user',
    )
    assert(
      Object.keys(state?.sessionsByUserClientId ?? {}).length === 2,
      'remaining users should be preserved',
    )
  }

  // remove the active user selects a deterministic fallback
  {
    const storage = new AuthStateStorage()
    storage.setState(makeTrustedState('u1', ['u1', 'u2']))
    storage.removeSession('u1')
    assert(
      storage.getState()?.activeUserClientId === 'u2',
      'removing the active user should fall back to a remaining session',
    )
  }

  // removing the last user clears everything
  {
    const storage = new AuthStateStorage()
    storage.setState(makeTrustedState('u1', ['u1']))
    storage.removeSession('u1')
    assert(
      storage.getState() === null,
      'removing the last session should clear all auth state',
    )
  }

  // clear wipes state
  {
    const storage = new AuthStateStorage()
    storage.setState(makeTrustedState('u1', ['u1', 'u2']))
    storage.clear()
    assert(storage.getState() === null, 'clear should remove all state')
  }

  // subscribers are notified with the latest state
  {
    const storage = new AuthStateStorage()
    const seen: (string | null)[] = []
    const unsubscribe = storage.subscribe((state) => {
      seen.push(state?.activeUserClientId ?? null)
    })
    storage.setState(makeTrustedState('u1', ['u1', 'u2']))
    storage.setActiveUser('u2')
    unsubscribe()
    storage.setActiveUser('u1')
    assert(
      seen[0] === null && seen.includes('u1') && seen[seen.length - 1] === 'u2',
      'subscriber should receive initial + each change until unsubscribed',
    )
  }
}
