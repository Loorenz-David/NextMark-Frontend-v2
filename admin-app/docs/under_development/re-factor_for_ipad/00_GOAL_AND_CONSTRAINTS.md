# 00 — Goal, target devices, constraints

**Project:** make `Front_end/admin-app` fully usable on iPads held in landscape, installed as a home-screen web app.
**Created:** 2026-10-24. **Status:** context vault complete, implementation not started.
**Owner of the folder:** every session (Claude or Codex) working on this refactor reads `README.md` first, then only the documents it needs.

---

## 1. What "usable on iPad" means for the client

An operator at a counter or in a warehouse, holding a 10"–13" iPad in landscape with a finger (no mouse, no keyboard, often no trackpad), can:

1. Open the admin app from the home screen, full screen, no Safari chrome, with the session surviving relaunches.
2. See the home workspace (orders, plans, map) without any panel being clipped, overlapping, or reduced to a sliver.
3. Scroll every list with a finger without a drag starting by accident, and start a drag on purpose without the list scrolling instead.
4. Move orders into plans, reorder stops, and reorder settings lists by touch, or by an explicit non-drag path when drag is not practical.
5. Reach every action that is hover-only on desktop (card actions, menus, warnings, stats, dismiss buttons) with a tap.
6. Hit every control with a finger: no target smaller than 44×44 CSS px on primary surfaces, and no text below the readable threshold set in `02_HOME_SHELL_GEOMETRY.md`.
7. Print item labels and route sheets from the iPad (path chosen in `05_PRINTING_AND_BLUETOOTH.md`).

## 2. Target devices and widths

iPadOS reports CSS pixel widths in landscape as below. All are **≥ 1000px**, so today the app treats every landscape iPad as a desktop (see `src/app/viewport/viewport.config.ts`, `MOBILE_MAX_WIDTH = 999`).

| Device | Landscape CSS width × height | Notes |
|---|---|---|
| iPad 9th/10th gen (10.2"/10.9") | 1080 × 810 (10.2": 1080×810, 10.9": 1180×820) | Most likely client device |
| iPad Air 11" / iPad Pro 11" | 1180 × 820 / 1194 × 834 | |
| iPad Pro 12.9" / 13" | 1366 × 1024 / 1376 × 1032 | |
| iPad mini (landscape) | 1133 × 744 | Shortest height |
| Any iPad, Split View 50/50 | 500–683 | Falls into today's phone shell |
| Any iPad, Slide Over companion | 320–375 | Phone shell |

Standalone (installed) mode removes Safari chrome. The status bar still occupies the top safe area (`env(safe-area-inset-top)` ≈ 20–24px) and there is a home indicator at the bottom; `index.html` already sets `viewport-fit=cover`.

**Height matters as much as width.** 744–834px tall is short for a layout with a header plus stacked panels. Keep both axes in every check.

## 3. Input facts on iPad Safari (verify on the device in hand)

- `(pointer: coarse)` matches; `(hover: none)` matches without a trackpad. With a Magic Keyboard/trackpad attached Safari reports `hover: hover` and a fine pointer. The viewport provider already exposes `isCoarsePointer` and `hasHover`; the design must not assume either is stable across a session.
- Pointer events are supported. `@dnd-kit` `PointerSensor` loses drags inside scrollable lists (browser takes the gesture for scrolling and fires `pointercancel`); the repo already switched to `MouseSensor` + `TouchSensor` with a 250ms long-press for order drags (commit `ca2be09`). Settings sortables were switched later (mobile shell notes).
- iOS long-press on text/images shows a callout/selection magnifier unless `-webkit-touch-callout: none` / `user-select: none` is set on the pressed element (class `.dnd-touch-source` in `src/index.css:689`).
- Focused inputs smaller than 16px font zoom the page. The existing rule only applies below 1000px (`src/index.css:1282`). iPads in landscape are not covered.
- Rubber-band overscroll on the document and nested scroll chaining happen unless `overscroll-behavior` is set; today it is set only on `.admin-mobile-shell`.
- The `a[download]` + blob URL pattern used by `downloadBlob.controller.ts` fails silently in installed home-screen web apps (long-standing WebKit/iOS issue). See `05_PRINTING_AND_BLUETOOTH.md`.
- Web Bluetooth, Web Serial and WebUSB are **not available** in Safari/WebKit on iPadOS (WebKit position: negative). Any Bluetooth printing needs a different path. See `05`.

## 4. Hard constraints (acceptance gates for every phase)

1. **Desktop ≥ 1440px stays visually identical** unless a phase explicitly says otherwise. The client also uses wide monitors. Recorded exception: the drag press/lift cue (D8).
2. **The phone shell (< 1000px) keeps working.** It was built on 2026-10-07 (`docs/under_development/ADMIN_APP_MOBILE_SHELL_PLAN_2026-10-07.md`) and Split View on an iPad lands in it.
3. **Layer rules hold** (`Front_end/AGENTS.md`): viewport facts in `src/app/viewport`, shell chrome in `features/home-app`, workspace layout in `features/home-route-operations`, primitives in `src/shared`. Feature → feature imports only through barrels.
4. **One viewport owner.** New breakpoints or input-class facts are added to `src/app/viewport/viewport.config.ts` and `ViewportProvider.tsx`, never measured locally in components.
5. **The external-form PWA contract is preserved**: `npm run check:external-form-pwa` must pass or be revised deliberately in the PWA phase. `public/admin-notifications-sw.js` must stay a notification-only worker (no `fetch` handler, no Cache API) unless that script is changed in the same phase with a written reason.
6. **Gates after every phase:** `npm run build`, `npm run lint`, `npm run check:popup-contract`, `npm run theme:regression`, `npm run check:external-form-pwa`. Pre-existing failures are fixed in Phase 0 step 0 (user decision K2); afterwards every gate must be green.
7. **No new dependency without checking existing ones** (`@dnd-kit`, `framer-motion`, `@floating-ui/react` are already present).
8. **Device verification is part of the phase**, not an afterthought: the user has an iPad and tests each phase; results go into `07_DEVICE_TEST_MATRIX.md`.

## 5. Non-goals

- Rebuilding the phone shell or the desktop workspace from scratch.
- Supporting portrait iPad as a first-class layout (it falls into the phone shell at 744–1024px wide; portrait 820×1180 and 834×1194 are < 1000 wide, portrait 1024×1366 is a desktop at 1024 — treat it like landscape 1024).
- Offline mode or caching in the service worker.
- Native wrapper (Capacitor) unless the printing decision in `05` forces it.
- Zone drawing on touch (stays desktop-only unless the client asks).
