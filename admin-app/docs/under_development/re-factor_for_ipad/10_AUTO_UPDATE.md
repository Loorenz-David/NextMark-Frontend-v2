# 10 — Silent auto-update for the installed admin app (Phase 5b)

**Created:** 2026-10-24. **Status:** spec approved in principle by the user 2026-10-24 ("no update message or trigger; must be reliable on Mac, iPad and iPhone"). Runs on `ipad/phase-5b-auto-update`, branched from the Phase 5 tip; parallel with Phase 4 (no shared files expected except possibly the order-form provider, where 5b only adds a blocker hook).

Paths relative to `Front_end/admin-app` unless stated.

---

## 1. Why the installed app goes stale on Apple devices

The admin app has no caching service worker (guarded by `scripts/check-external-form-pwa.mjs`), so there is no cached app shell. Staleness still happens for three other reasons:

| Cause | What the user sees | Fixed by |
|---|---|---|
| iOS/iPadOS/macOS keep a home-screen web app suspended in memory; reopening it **resumes** the old page with the old JavaScript, no network request | yesterday's build keeps running for days | §3 version check on resume + silent reload |
| S3 objects are uploaded with **no `Cache-Control`**, so Safari applies heuristic caching (≈10% of the file's age) to `index.html`; CloudFront invalidation clears the edge, not the device | even a real reload shows the old `index.html` | §4 headers, plus §3 step 4 cache-busting refetch |
| `aws s3 sync --delete` removes the previous build's hashed chunks; an old page that lazy-loads a route asks for a file that no longer exists | a screen fails to open after a deploy | §4 keep old assets, plus §3 step 5 preload-error reload |

Apple limit that no code can change: the home-screen **icon and name** are captured at install time. Changing them needs a re-add. Everything else updates on its own.

## 2. Hosting facts (verified 2026-10-24)

- Admin app: S3 bucket `delivery-frontend-app` behind CloudFront distribution `E16F4UEPFT2P6Y`, deployed by `Front_end/.github/workflows/deploy-admin.yml` on push to `main` (paths `admin-app/**`). The EC2/nginx in `Back_end/` serves only the API and `/socket.io/`.
- The workflow does `aws s3 sync dist/ s3://delivery-frontend-app --delete` (no cache metadata), then `create-invalidation --paths "/*"`.
- `/external-form/*` is served by the same build (`app/router/AppRouter.tsx`), so customer form tablets get the same mechanism.
- Build id already exists: `vite.config.ts` defines `__APP_BUILD_ID__` (`Date.now()` at build) and `__APP_BUILD_TIMESTAMP__`; `main.tsx` exposes `window.__NEXTMARK_BUILD_INFO__`.

## 3. App side (no service worker involvement)

New module `src/app/version/` (app layer: bootstrap/env concerns). Pure decisions in `domain/`, effects in a runtime file, started once from `main.tsx` in production only.

1. **Emit `/version.json` at build.** Small Vite plugin in `vite.config.ts` (`generateBundle` → `emitFile`) writing `{ "buildId": <same buildId>, "builtAt": <buildTimestamp> }`. One source of truth for the id.
2. **Check triggers** (production only; no-op in dev):
   - `visibilitychange` → `visible` (this is what fires when an iOS home-screen app is reopened from the app switcher or home screen);
   - `pageshow` with `event.persisted` (back-forward cache restore);
   - `online`;
   - `focus` (Mac Safari window switching);
   - an interval every 5 min **only while visible** (clear it when hidden).
   Throttle so two triggers within 30 s do one fetch.
3. **Fetch** `/version.json?t=<now>` with `{ cache: 'no-store', credentials: 'omit' }`. Ignore network errors and non-JSON (offline, captive portal): never reload on a failed check.
4. **Apply silently when the id differs** — at a safe moment only (§3.1). Before reloading, `await fetch('/', { cache: 'reload' })` (and the current path if it is not `/`) so Safari replaces its cached `index.html` even if headers are wrong; then `window.location.reload()`. Loop guard: store the target build id in `sessionStorage`; if after reload the running `__APP_BUILD_ID__` still differs from that target, do not reload again for that target in this session (log `[app-version] reload did not take effect`).
5. **Chunk-load failure:** listen for Vite's `vite:preloadError` on `window`; `event.preventDefault()` and run the same safe-reload path (one attempt per build id, same guard). Also catch a failed `import()` in the router's lazy routes if they don't surface through `vite:preloadError`.
6. **Notification service worker:** on the same trigger, call `registration.update()` on the existing root-scope registration from `realtime/notifications/adminWebPush.runtime.ts` (lookup only; do not register). The worker stays notification-only.

### 3.1 Safe moment (never lose work)

Reload is deferred while any blocker is active, and retried when blockers clear (subscribe) and on the next trigger. No timeout overrides a blocker.

- **Blocker registry** in `src/app/version/`: `useReloadBlocker(isBlocking: boolean, reason: string)` hook for features plus a non-React `registerReloadBlocker` for stores. Features report; the app never reaches into feature internals.
- **Wire these** (re-grep first; these are where the dirty state lives today):
  - order form dirty state (`features/order/forms/orderForm/providers/useOrderFormCloseController.ts` / `OrderForm.provider.tsx`);
  - item form (`features/order/item/popups/ItemForm/ItemForm.provider.tsx`);
  - external client form in progress (`/external-form/*`);
  - note popups with unsaved text (`EditOrderNotePopup`, `FailureNotePopup`, `SendClientFormLinkPopup`);
  - an active home drag (`routeOperationsActiveDrag` from the resource manager) and any settings sortable drag.
- **Generic checks** (no feature wiring needed): `document.activeElement` is an editable element (`input`, `textarea`, `select`, `contenteditable`); a file picker or print dialog was opened in the last 10 s (skip).
- When nothing blocks and the app has just become visible, reload immediately: the user sees one quick reload as the app opens, which is the expected moment.

### 3.2 Tests (vitest, `src/app/version/**/*.vitest.test.ts`)

- `shouldApplyUpdate({ runningId, remoteId, blockers, lastAttemptedId })` truth table, including the loop guard.
- version payload parsing: valid, malformed, empty, HTML (captive portal) → no update.
- throttle: two triggers inside 30 s → one fetch.

## 4. Hosting side (CI/CD change: needs the user's confirmation before editing)

Replace the single `Sync build to S3` step in `Front_end/.github/workflows/deploy-admin.yml` with two steps, **assets first** so a new `index.html` never points at chunks that are not uploaded yet:

```yaml
      - name: Upload hashed assets (cache forever, keep previous builds)
        run: aws s3 sync dist/assets s3://delivery-frontend-app/assets --cache-control "public, max-age=31536000, immutable"
        env: { ...same AWS env... }

      - name: Upload entry files (always revalidate)
        run: aws s3 cp dist/ s3://delivery-frontend-app/ --recursive --exclude "assets/*" --cache-control "no-cache"
        env: { ...same AWS env... }
```

- `assets/` is synced **without `--delete`**: old chunks stay, so a page still running the previous build can lazy-load. Hashed names make this safe; a lifecycle rule can expire old `assets/` objects after 30 days later if the bucket grows.
- Entry files use `cp --recursive` (not `sync`) so unchanged files like the manifest, icons and `admin-notifications-sw.js` get the new `no-cache` metadata on the first run too.
- Removed entry files (rare) are no longer deleted automatically; note it in the deploy doc.
- Keep the CloudFront invalidation step.
- Verify after the first deploy: `curl -sI https://<admin-host>/` and `/version.json` and a deep link like `/external-form/x` show `cache-control: no-cache`; `curl -sI https://<admin-host>/assets/<file>.js` shows `immutable`. The deep link is served through CloudFront's error-page fallback; if it lacks the header, note it (the app side still refetches `index.html` before reloading).

## 5. Acceptance

- Gates green (lint 0 errors, tests, build, popup contract, theme regression, PWA checks, `git diff --check`).
- `dist/version.json` exists after `npm run build` and its id equals `window.__NEXTMARK_BUILD_INFO__.buildId`.
- Device rows in `07`: **C9** installed app on iPad: deploy, reopen from home screen → new build running without any prompt (check `window.__NEXTMARK_BUILD_INFO__` via the app's build info log or a visible build stamp in Settings); **C10** same with the order form open and dirty → no reload until the form is saved or closed, then reload on next reopen; **C11** iPhone home-screen and Mac Safari (Dock web app) same as C7; **C12** a screen opened for the first time after a deploy in a long-open old session loads (old chunk still present) or reloads once.
- Optional but useful for C9–C12: a small build stamp (short id + date) in Settings → About, so the user can see which build is running without dev tools.
