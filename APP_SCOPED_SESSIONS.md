# App-Scoped Sessions

This document explains how frontend session handling now works across `admin-app` and `driver-app`.

## Goal

Each app now owns its own authenticated session.

That means:
- admin and driver can both be open at the same time
- switching workspace in one app does not invalidate the other app
- each app refreshes only its own tokens

## Session Model

Both apps still use the same backend auth endpoints, but they log in with different `app_scope` values:

- `admin-app` sends `app_scope: 'admin'`
- `driver-app` sends `app_scope: 'driver'`

Returned tokens and user/session payload now include:
- `app_scope`
- `session_scope_id`
- `current_workspace`
- `active_team_id`
- `has_team_workspace`
- role fields such as `base_role`

## Separate Storage

Sessions are intentionally stored under different browser keys.

Current keys:
- admin app:
  - `beyo.admin.session`
- driver app:
  - `beyo.driver.session`

This isolation is required.
Do not reuse one app's storage accessor in another app.

## Shared Session Types

Shared API session types live in:
- `packages/shared-api/http/types.ts`

Important fields:
- `SessionIdentity.app_scope`
- `SessionIdentity.session_scope_id`
- `SessionIdentity.current_workspace`
- `SessionIdentity.active_team_id`
- `SessionIdentity.has_team_workspace`

The shared API client merges token claims back into the stored user/session in:
- `packages/shared-api/http/createApiClient.ts`

That merge now prefers:
- `active_team_id` over raw `team_id`

## Driver App

Driver login:
- `driver-app/src/app/services/auth.api.ts`

Driver login caller:
- `driver-app/src/features/auth/controllers/useLoginController.controller.ts`

Driver workspace derivation:
- `driver-app/src/app/lib/driverWorkspace.ts`

Important behavior:
- driver workspace is read from session claims
- it is no longer inferred from role alone
- `resolveTeamId(...)` prefers `active_team_id`

Driver workspace switching still uses:
- `POST /drivers/workspace/switch`

## Admin App

Admin login:
- `admin-app/src/features/auth/login/api/authLoginApi.ts`
- `admin-app/src/features/auth/login/forms/LoginForm.tsx`

Admin session store:
- `admin-app/src/features/auth/login/store/authSessionStore.ts`
- `admin-app/src/features/auth/login/store/sessionStorage.ts`

Admin workspace switching now uses:
- `POST /users/workspace/switch`

If the admin app later gets a dedicated workspace context provider, it should derive from the same session claims:
- `current_workspace`
- `active_team_id`
- `has_team_workspace`
- role fields

## Current Backend Contract

Frontend should assume:
- app scope is a hard security boundary
- refresh preserves both:
  - `app_scope`
  - `session_scope_id`
- old refresh tokens without those fields are invalid and require re-login

## Rules For New Apps

When building a future `assistant-app`, follow these rules:

1. Add a new app-specific storage key.
2. Send an explicit `app_scope` during login.
3. Keep refresh isolated to that app's stored session.
4. Derive workspace from session claims, not from guessed role/team logic.
5. Use `active_team_id` as the runtime team context.
6. Do not share auth session state objects between apps.

## Suggested Assistant App Checklist

If `assistant-app` is created later, it should have:

1. Its own session storage accessor.
2. Its own auth API wrapper that sends its `app_scope`.
3. A workspace derivation helper like `driverWorkspace.ts`.
4. A workspace switch flow only if that app needs personal/team switching.
5. Router/backend support for that app scope before frontend routes are opened.

## Files To Read First

Shared frontend files:
- `packages/shared-api/http/types.ts`
- `packages/shared-api/http/createApiClient.ts`

Driver app:
- `driver-app/src/app/services/auth.api.ts`
- `driver-app/src/app/providers/SessionProvider.tsx`
- `driver-app/src/app/lib/driverWorkspace.ts`
- `driver-app/src/app/providers/WorkspaceProvider.tsx`

Admin app:
- `admin-app/src/features/auth/login/types/authLogin.ts`
- `admin-app/src/features/auth/login/forms/LoginForm.tsx`
- `admin-app/src/features/auth/login/store/sessionStorage.ts`
- `admin-app/src/lib/api/ApiClient.ts`
