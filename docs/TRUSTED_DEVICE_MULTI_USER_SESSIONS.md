# Trusted-Device Multi-User Sessions & Instant User Switching

> Scope: `admin-app` frontend only. This document describes what was implemented,
> how it works at runtime, and what is intentionally deferred or still missing.

---

## 1. Why this exists

The backend `POST /auths/login` response is now discriminated by a top-level field:

```
authentication_mode: 'single_user' | 'trusted_device'
```

- **Normal device** → `single_user`: one operator, one session (unchanged behavior).
- **Trusted device** (e.g. a shared front-desk machine) → `trusted_device`: the
  backend returns **all** authorized operator sessions in a single login response.
  The operator can then switch the acting user instantly from the desktop header
  **without logging in again**.

The frontend **must branch on `authentication_mode`**. It must never infer the
mode from the presence of `sessions`, `trusted_device`, or any individual field.

---

## 2. Core mental model

Everything is built around **one normalized, persisted auth-state object** and a
**derived active session**.

```ts
type AuthStateSnapshot = {
  authenticationMode: 'single_user' | 'trusted_device'
  activeUserClientId: string
  sessionsByUserClientId: Record<string, StoredUserSession> // StoredUserSession = SessionSnapshot
  trustedDevice?: { clientId: string; name: string }
  updatedAt: number
}

// The one rule every consumer follows:
activeSession = sessionsByUserClientId[activeUserClientId]
```

- **Sessions are keyed by `user.client_id`** (which must equal `session.user_client_id`).
  Never keyed by database id, email, username, array index, or `session_scope_id`.
- **Single-user mode** stores exactly one entry.
- **Trusted-device mode** stores every returned session; the initial active user is
  chosen by the explicit `active_user_client_id` — never `sessions[0]`.
- Persisted in `localStorage` under **`beyo.admin.auth-state`** (replacing the old
  single-session key `beyo.admin.session`).

### Why the shared API client didn't change

`@shared-api`'s `SessionAccessor` is a 3-method contract (`getSession` / `setSession`
/ `clear`) shared by all apps and has no concept of "which user". Instead of
rewriting it, admin-app provides an **active-session adapter**: the API client always
reads/writes the *active* slot, so refreshing user A's token only ever rewrites A's
entry — B, C, D are untouched.

---

## 3. What was implemented (file map)

### Domain (pure, testable — no I/O)
| File | Responsibility |
|---|---|
| `features/auth/login/domain/authState.ts` | State types + helpers: `deriveActiveSession`, `selectFallbackActiveUserClientId`, `resolveSingleUserClientId`, `listAvailableAuthUsers` |
| `features/auth/login/domain/normalizeLoginResponse.ts` | `normalizeSingleUserResponse` / `normalizeTrustedDeviceResponse` → `AuthStateSnapshot` or a typed error. All validation lives here |
| `features/auth/login/domain/authStatePersistence.ts` | `parseStoredAuthState` (validate + repair on read) and `migrateLegacySession` (old key → new shape) |
| `features/auth/trusted-device/domain/resolveUserLabel.ts` | Display-name helper for the UI |

### Storage & store
| File | Responsibility |
|---|---|
| `features/auth/login/store/authStateStorage.ts` | Owns `beyo.admin.auth-state`. In-memory cache + `subscribe`. Per-user mutations, active-user switch, fallback, clear |
| `features/auth/login/store/sessionStorage.ts` | **Rewritten**: `ActiveSessionAccessor` adapter implementing `SessionAccessor` over the active session. Keeps the historical `sessionStorage` export + `subscribe(session)` contract |
| `features/auth/login/store/authSessionStore.ts` | **Rewritten** zustand store. Normalized state + all multi-session actions |
| `features/auth/login/store/authNotice.ts` | One-shot, non-sensitive message that survives a reload (used after involuntary eviction) |

### Hooks, types, API
| File | Responsibility |
|---|---|
| `features/auth/login/types/authLogin.ts` | **Rewritten** as a discriminated union (`SingleUserLoginResponse | TrustedDeviceLoginResponse`) |
| `features/auth/login/hooks/useAuthSelectors.ts` | `useAuthSession` (active), `useActiveAuthUser`, `useAuthenticationMode`, `useTrustedDevice`, `useAvailableAuthUsers`, `useCanSwitchAuthUser`, `useActiveAuthUserClientId` |
| `features/auth/login/hooks/useLoginMutations.ts` | Branches on mode; surfaces warnings; `logOutDevice` / `logOutCurrentUser` / `logout` alias |
| `lib/api/ApiClient.ts` | Documented **seam** for trusted-device request headers (deferred) |
| `app/providers/AppProviders.tsx` | Mode-aware terminal-refresh-failure handler + eviction-notice surfacing |

### Account-switch UI — `features/auth/trusted-device/`
| File | Responsibility |
|---|---|
| `components/ActingUserButton.tsx` | Global header action. Renders only in trusted-device mode: switcher (>1 user) or static indicator (1 user) |
| `components/ActingUserCard.tsx` / `ActingUserAvatar.tsx` | One selectable user row / avatar (profile picture or initials) |
| `popups/SwitchActingUserPopup.tsx` | The switch popup. Derives users from the store — never from a payload |
| `hooks/useTrustedDeviceUserSwitch.ts` | Thin orchestration → `switchActiveUser` |
| `registry/actingUserPopups.registry.ts` | Registers `switchActingUser` popup |
| `index.ts` | Public surface: `ActingUserButton`, `actingUserPopupRegistry` |

### Wiring
- `features/home-route-operations/registry/homePopups.ts` — spreads `actingUserPopupRegistry`.
- `features/home-app/components/HomeDesktopHeader.tsx` — renders `<ActingUserButton />`.
- `features/home-app/pages/HomeAppPage.tsx` — **relocated `HomeOverlays`** (the popup
  render host) up to `HomeAppShell` so the popup renders on **every** home workspace;
  removed from `HomeRouteOperationsPage.tsx`.

### Tests (framework-less, repo convention: `run…Tests()` + local `assert`)
- `features/auth/login/domain/tests/normalizeLoginResponse.test.ts`
- `features/auth/login/store/tests/authStateStorage.test.ts`

---

## 4. How it works at runtime

### 4a. Login
```
LoginForm → useLoginMutations.login(payload)
  → authLoginApi.login()  (POST /auths/login, requiresAuth:false)
  → branch on data.authentication_mode
      trusted_device → normalizeTrustedDeviceResponse() → setTrustedDeviceSessions()
      else           → normalizeSingleUserResponse()   → setSingleUserSession()
  → persist AuthStateSnapshot to beyo.admin.auth-state
  → apiClient.setSession(activeSession)   // normalizes the ACTIVE user's identity from its JWT
  → non-blocking warning message (if any)
  → LoginForm navigates to "/"
```
Legacy responses **without** the discriminant fall into the single-user branch, so
current single-user login keeps working.

### 4b. Session restore on page load / refresh
`AuthStateStorage` reads `beyo.admin.auth-state` on first access:
1. Valid → repaired if needed (drops corrupt sessions; falls back to a deterministic
   active user if the stored active id no longer resolves).
2. Missing → tries to **migrate** a legacy `beyo.admin.session` payload.
3. Nothing usable → returns `null` (user must log in).

The zustand store seeds from this and subscribes for later changes.

### 4c. Switching the acting user (the headline feature)
```
Header (ActingUserButton, trusted-device & >1 user)
  → popupManager.open({ key: 'switchActingUser' })
  → SwitchActingUserPopup lists useAvailableAuthUsers()
  → select same user  → close only (no reset)
  → select other user → switchActiveUser(user.client_id):
        1. validate target exists
        2. authStateStorage.setActiveUser(id)   // persist new active selection
        3. apiClient.setSession(newActive)       // normalize new user's identity
        4. window.location.reload()              // <-- clean context swap
```

**Why reload?** The admin-app data cache is ~56 hand-rolled zustand singletons with
**no global clear registry** (there is no TanStack Query). A full page reload is how
the app already avoids cross-user data leaks (the existing team-switch precedent), and
it guarantees the socket identity, entity stores, popups, and bootstrap all
re-initialize as the newly-selected user — with **no login request**. The auth-state
swap itself is synchronous and local; the reload just re-boots everything cleanly.

### 4d. Per-user token refresh isolation
The shared API client refreshes tokens via `POST /auths/refresh_token` and writes the
result back through the accessor. Because the accessor is the **active-session
adapter**, the writeback lands only in `sessionsByUserClientId[activeUserClientId]`.
Refreshing user A never disturbs B/C/D.

### 4e. Terminal refresh failure (revoked / expired)
`AppProviders` installs a mode-aware unauthenticated handler:
- **Trusted-device with >1 session** → evict only the failed active user, pick a
  deterministic fallback, set a one-shot notice, and reload as the fallback user. The
  other sessions survive.
- **Single-user or last session** → clear auth state and redirect to `/auth/login`
  (preserves single-user logout-on-failure behavior).

### 4f. Logout semantics
- `logOutDevice()` — clears **all** stored sessions + auth state (full device logout).
- `logOutCurrentUser()` — trusted-device with others present: removes only the active
  user and reloads as a fallback; otherwise a full device logout.
- `logout` remains exported as an alias of `logOutDevice` for back-compat.

---

## 5. Validation & safety guarantees

Trusted-device normalization rejects a response (and persists nothing) unless:
`trusted_device` present · non-empty `active_user_client_id` · non-empty `sessions` ·
every session has `user_client_id` **and** `user.client_id` that are equal · every
session has access + refresh tokens · no duplicate ids · active id present in the map.

- On structural failure: no partial state is written; a generic error is shown; only
  **safe diagnostics** (a reason code) are logged — never tokens or the raw body.
- The device secret (once enrollment exists) must never be logged, rendered, or placed
  in query strings, router state, error messages, or analytics.

---

## 6. What is intentionally deferred (not a bug)

| Item | Status | Note |
|---|---|---|
| **Trusted-device request headers** (`X-Trusted-Device-Id` / `-Secret`) | Deferred | A documented seam exists in `lib/api/ApiClient.ts`. `@shared-api`'s `createApiClient` has no request interceptor yet, so wiring needs a small addition to the shared client's header composition. |
| **Device enrollment flow** | Out of scope | The design assumes the device is already registered and credentials are available. |
| **Socket-token refresh endpoint** | N/A by design | There is no `/auths/refresh_socket_token`; socket tokens ride on `/auths/refresh_token`. The realtime client auto-reauths when `session.socketToken` changes (and a reload fully re-establishes it). |

---

## 7. Known limitations / what to watch

1. **Switch = full reload.** By design (see 4c). If a future requirement demands a
   flash-free in-memory switch, it requires building a global store-clear registry +
   `closeAll()` on every `StackActionManager` + forced socket disconnect/connect +
   re-bootstrap. That was explicitly chosen against for robustness.
2. **Account switcher is desktop-only.** It lives in `HomeDesktopHeader`. The mobile
   home shell has no header, so there is no mobile switch entry point yet (the popup
   *renderer* is available on mobile, only the trigger is not).
3. **Warnings are string-based.** The API envelope exposes `warnings: string[]`. Only
   the `trusted_device_users_excluded` code is mapped to a friendly, identity-safe
   message; other warning codes are currently ignored (login still succeeds).
4. **Single-user key fallback.** If a single-user login response lacks `user.client_id`
   (during rollout), a stable fallback key is used so login never breaks. Legacy
   *migration*, by contract, does **not** synthesize a key — it clears and requires
   re-login. This asymmetry is intentional.
5. **Non-active sessions store the backend `user` as-is.** Only the active user's
   identity is JWT-normalized (on login and on switch). Non-active sessions carry
   enough for the switcher UI; they get normalized when they become active.
6. **Pre-existing lint debt (unrelated):** `features/home-app/providers/HomeAppProvider.tsx`
   has a `react-refresh/only-export-components` error that predates this work and was
   not introduced here.

---

## 8. Verification status

- `tsc -b` — passes (0 errors).
- `node scripts/check-feature-popup-architecture.mjs` — passes.
- ESLint on all changed/added files — clean.
- Both new test suites — pass (`normalizeLoginResponse`, `authStateStorage`).

### Manual verification checklist
- **Single-user:** login → behaves as before; refresh restores session; logout unchanged.
- **Trusted-device** (needs backend returning the mode, or a stubbed response):
  - login → all sessions under `beyo.admin.auth-state`; header shows switcher when >1 user.
  - open the popup on route-operations / store-pickup / international-shipping.
  - select another user → reload → API + socket + header act as user B.
  - refresh page → sessions still present, B still active.
  - expired B token → only B refreshed. Revoked B refresh → B removed, A remains.
  - full device logout → `beyo.admin.auth-state` cleared.
- **Legacy migration:** seed old `beyo.admin.session`, load app → migrated to new key,
  still logged in (or cleared if the legacy user lacked `client_id`).

---

## 9. Acceptance criteria coverage

| # | Criterion | Status |
|---|---|---|
| 1 | Branch on `authentication_mode` | ✅ |
| 2 | Single-user login compatible | ✅ |
| 3 | Trusted-device stores every session | ✅ |
| 4 | Sessions keyed by `user.client_id` | ✅ |
| 5 | Explicit `active_user_client_id` selects initial | ✅ |
| 6 | Sessions survive refresh | ✅ |
| 7 | API client always uses active session | ✅ (adapter) |
| 8 | Switch from header, no login request | ✅ |
| 9 | Switch UI via global popup registry | ✅ |
| 10 | Per-user token refresh updates only that user | ✅ |
| 11 | Revoked user's failure removes only that user | ✅ |
| 12 | No previous-user data/socket/resource leak | ✅ (via reload) |
| 13 | Warnings non-blocking | ✅ |
| 14 | Full device logout clears everything | ✅ |
| 15 | App-scope / identity / routing / normal auth preserved | ✅ |
| — | Trusted-device request headers attached centrally | ⏳ Deferred (seam ready) |
