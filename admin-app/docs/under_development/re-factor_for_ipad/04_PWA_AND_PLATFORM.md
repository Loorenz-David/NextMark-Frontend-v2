# 04 — PWA and iPadOS platform facts

What already exists for installability, what the guard script protects, and what an installable **admin** app needs. Read before touching `src/app/pwa`, `public/*.webmanifest`, `public/admin-notifications-sw.js`, `index.html`, or `vite.config.ts`.

---

## 1. Existing pieces (as of 2026-10-24)

| Piece | Path | What it does |
|---|---|---|
| Viewport meta | `index.html` | `width=device-width, initial-scale=1.0, viewport-fit=cover`. Theme attribute set from `localStorage['beyo.admin.theme']` before React mounts. |
| Dynamic `--vh` | `src/main.tsx` | Sets `--vh` on resize (legacy phone fix). `App.tsx` uses `min-h-dvh`; `HomeAppPage.tsx` desktop branch uses `h-screen w-screen`. |
| External-form manifest | `public/external-form.webmanifest` | `scope`/`start_url` = `/external-form`, `display: standalone`, paper colours, icons in `public/pwa/external-form/`. |
| Route-aware head | `src/app/pwa/useExternalFormPwaHead.ts` → `domain/externalFormPwa.ts` + `domain/managedHead.ts` + `infrastructure/documentHead.port.ts` | Injects manifest link, `apple-touch-icon`, `apple-mobile-web-app-capable`, status-bar style, title **only while the pathname is under `/external-form`**; removes them elsewhere. One owner of `document.head` writes. |
| Standalone detection | `src/app/pwa/domain/standaloneDisplay.ts` | `navigator.standalone === true` (iOS) or `display-mode: standalone|fullscreen|window-controls-overlay`. Pure, testable. Exported as `isStandaloneDisplay` from `src/app/pwa/index.ts`. |
| Containment | `src/app/pwa/useStandaloneContainment.ts` → `domain/standaloneContainment.ts` | If launched standalone **into** `/external-form`, any navigation outside `/external-form` or `/auth` is replaced back to the form. Explicitly designed so an installed admin surface is *not* dragged to the form (`armed` only when the launch path is the form). |
| Provider | `src/app/pwa/ExternalFormPwaProvider.tsx` | Mounts the two hooks. Check `src/app/providers/AppProviders.tsx` for where it sits (needs router context). |
| Notification SW | `public/admin-notifications-sw.js`, registered by `src/realtime/notifications/adminWebPush.runtime.ts` at root scope | `push` + `notificationclick` only. No `fetch`, no caches. |
| Guard script | `scripts/check-external-form-pwa.mjs` (`npm run check:external-form-pwa`) | Asserts: manifest fields equal `EXTERNAL_FORM_MANIFEST_CONTRACT`; `display === 'standalone'`; `start_url === '/external-form'`; `scope` not `/`; icons exist; SW has no `fetch` handler and no `caches`; no `public/sw.js`, `public/service-worker.js`, `public/pwa-sw.js` exist. |
| Tests | `src/app/pwa/domain/tests/externalFormPwa.test.ts` | Hand-rolled `run…Tests` style; **no test runner is wired** in admin-app (no vitest). |
| Pattern reference | `Front_end/driver-app/vite.config.ts` (VitePWA, workbox, `injectRegister: false`), `driver-app/src/main.tsx` (`virtual:pwa-register`, update-on-visibility reload) | Driver app is a full installable PWA with precache. Admin must **not** copy the workbox precache part (guard script + live-deployment requirement). |

## 2. Why the guard script exists and what it means for an admin PWA

The external form is installed on customer-facing tablets. Its contract: the installed app must load the live deployment every time (no cache-first), and it must not be able to wander into the admin console. The guard script enforces that by forbidding a caching SW and a root-scoped manifest **for the external form**.

An installable admin app needs a **second** manifest with `scope: "/"` and `start_url: "/"`. That does not conflict with the script as written, because the script only reads `public/external-form.webmanifest`, but two things do:

1. The head-state rule in `externalFormPwa.ts` (`resolvePwaHeadState`) says "anywhere else advertise nothing". It becomes "anywhere else advertise the admin manifest". The domain test must be extended.
2. iOS reads the manifest of the page the user is on when they tap "Add to Home Screen". So an admin install must be done from an admin route, and a form install from the form route. Both apps can coexist on one iPad because their `id`/`scope` differ.

iOS 26 / iPadOS 26 change: every site added to the Home Screen opens as a web app by default (toggle "Open as web app"), even without a manifest. The manifest is still what controls name, icon, colours, `display`, and `scope`, so it is still required for a good result.

## 3. Admin manifest and head tags (to implement in the PWA phase)

- `public/admin.webmanifest`: `id: "/"`, `name: "NextMark Admin"`, `short_name: "NextMark"`, `start_url: "/"`, `scope: "/"`, `display: "standalone"`, `orientation` **omitted** (iPadOS ignores it and it would hint lock), `background_color`/`theme_color` from the dark theme page token (read `src/index.css` `--color-page` for `data-theme="dark"`; a second `theme_color` for light is not supported by manifest, so use `<meta name="theme-color" media="(prefers-color-scheme: ...)">` only if needed).
- Icons: `public/pwa/admin/icon-192.png`, `icon-512.png`, `maskable-512.png`, `apple-touch-icon-180.png`. Use the existing external-form icon pipeline as the model.
- Head tags for non-form routes: manifest link, `apple-touch-icon`, `apple-mobile-web-app-capable=yes`, `mobile-web-app-capable=yes`, `apple-mobile-web-app-status-bar-style` = `black-translucent` **only if** the shell pads with `.safe-top`; otherwise `default`. Title `NextMark`.
- Place the admin contract next to the form contract: `src/app/pwa/domain/adminPwa.ts`, and make `resolvePwaHeadState` pick form vs admin by pathname. Rename the hook/provider to `usePwaHead` / `PwaProvider` only if the user agrees (it is a rename across `AppProviders.tsx`; low risk).
- Extend `scripts/check-external-form-pwa.mjs` or add `scripts/check-admin-pwa.mjs`: admin manifest fields equal `ADMIN_MANIFEST_CONTRACT`, icons exist, admin `scope` is `/`, and **still** no caching SW.

## 4. Service worker decision

Keep `public/admin-notifications-sw.js` as the single root-scope worker. Do **not** add workbox precaching. Reasons: the guard forbids it; the app ships frequently and `main.tsx` already logs asset drift; a cached shell on a client iPad is a support risk. Installability on iOS does not require a fetch handler.

If "update prompt on new build" is wanted later: compare `__APP_BUILD_ID__` against a `/version.json` fetch on `visibilitychange`, and offer reload. No SW needed.

## 5. Standalone-mode behaviours to handle

| Behaviour | Where | What to do |
|---|---|---|
| No browser back button; swipe-from-left-edge goes back in history | whole app | Phone shell already integrates history (`features/home-app/flows/homeMobileBack.flow.ts`). The desktop layout at iPad widths has no history integration for popups/sections; decide in the plan whether to reuse the back-layer registry on tablets (`shared/overlays/bottomSheet/` `useBackLayerRegistration`). |
| Status bar overlays content at top when `black-translucent` | `HomeDesktopHeader`, popups `fixed inset-0`, `FeaturePopupShell` | Use `.safe-top` on fixed chrome, or keep `default` status bar style (opaque bar above the page, simpler). Recommendation: `default` first, revisit. |
| Home indicator at bottom | sticky footers, `FeaturePopupFooter`, action bars | `.safe-bottom` where a footer is `fixed bottom-0`. |
| `h-screen` vs real height | `HomeAppPage.tsx` desktop branch, `HomeStorePickupPage`, `HomeInternationalShippingPage` | `h-dvh`; on iPad standalone `100vh === innerHeight`, in Safari tab `100vh` includes the collapsed toolbar area. |
| Session storage | `beyo.admin.session` | Installed web apps have their own storage partition on iOS: a user logs in once inside the installed app; a Safari-tab login does not carry over. Document for the client. |
| `a[download]` of a blob fails silently | `features/templates/printDocument/controllers/downloadBlob.controller.ts` | See `05`. |
| Web Push | `adminWebPush.runtime.ts` | iOS allows push **only** for installed home-screen apps. Installing the admin app enables push on the iPad; the permission flow (`Notification.requestPermission`) must be triggered from a tap inside the installed app. |
| Keyboard | forms | Software keyboard shrinks `innerHeight` (visual viewport) in standalone mode; bottom-fixed footers can be covered. Phone shell already handled it for the order form; check `OrderFormShell` desktop layout at 1024×768 with the keyboard up. |
| Text selection on long press | lists, cards, map | `.dnd-touch-source` only covers draggables. A tablet-wide rule for interactive chrome (buttons, tabs, headers) is needed, scoped by `(pointer: coarse)` not by width. |
| Double-tap zoom | everywhere | `touch-action: manipulation` on the shell root (today only `.admin-mobile-shell`). Add for the desktop shell when `isCoarsePointer`. |
| Input zoom on focus | inputs | Lift the `font-size: max(16px, 1em)` rule from `(max-width: 999px) and (pointer: coarse)` to `(pointer: coarse)` only. |

## 6. Verifying on the iPad in hand

1. `npm run dev` already binds `host: true`; open `http://<mac-lan-ip>:5173` in iPad Safari. For Safari install/standalone tests a real HTTPS origin is better; use the deployed staging URL for manifest/icon checks.
2. Safari → Share → Add to Home Screen. Check name, icon, splash colour, that it launches full screen and lands on `/` logged in (or on `/auth/login`).
3. Confirm `isStandaloneDisplay(readStandaloneDisplayEnvironment())` is true in the console (Safari Web Inspector via Mac: Settings → Safari → Advanced → Web Inspector on the iPad; on the Mac, Safari → Develop → <iPad>).
4. Check `window.innerWidth/innerHeight` and `matchMedia('(pointer: coarse)').matches`, `matchMedia('(hover: hover)').matches` with and without a trackpad.
