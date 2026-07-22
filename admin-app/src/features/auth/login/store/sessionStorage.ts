import type { SessionSnapshot } from '@shared-api'

import { deriveActiveSession } from '@/features/auth/login/domain/authState'
import { authStateStorage } from '@/features/auth/login/store/authStateStorage'

export type { SessionIdentity, SessionSnapshot, SessionUser } from '@shared-api'

type SessionListener = (session: SessionSnapshot | null) => void

/**
 * Active-session adapter that implements the shared-api `SessionAccessor`
 * contract over the normalized multi-session `AuthStateStorage`.
 *
 * `getSession()` returns the currently-acting session, and `setSession()`
 * (called by the API client on token refresh) rewrites ONLY the active user's
 * entry — so refreshing user A never disturbs stored sessions B, C, D.
 *
 * The exported singleton keeps the historical name (`sessionStorage`) and its
 * `subscribe(session)` semantics so realtime and `useTeamMemberMeta` are
 * unaffected by the multi-session migration.
 */
export class ActiveSessionAccessor {
  getSession(): SessionSnapshot | null {
    return authStateStorage.getActiveSession()
  }

  setSession(session: Omit<SessionSnapshot, 'updatedAt'>): void {
    authStateStorage.updateActiveSession(session)
  }

  clear(): void {
    // Full clear = logout / device logout. Terminal refresh failure is handled
    // separately (mode-aware eviction) via the store, not through clear().
    authStateStorage.clear()
  }

  subscribe(listener: SessionListener): () => void {
    return authStateStorage.subscribe((state) =>
      listener(deriveActiveSession(state)),
    )
  }
}

export const sessionStorage = new ActiveSessionAccessor()
