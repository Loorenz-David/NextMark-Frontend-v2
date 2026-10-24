# 08 — Session log and decisions

Append-only. Newest session at the top. Every implementing session (Claude or Codex) adds an entry **before ending**, even if the work is partial. Keep entries short; link files by path.

## Decision register

| # | Date | Decision | Why | Where it lives |
|---|---|---|---|---|
| D1 | 2026-10-24 | **Approved by the user.** iPad landscape is a third viewport class, `tablet` = `1000px ≤ width < 1440px`; `desktop` ≥ 1440 stays pixel-identical; touch facts come from `isCoarsePointer`/`hasHover`. | iPads are ≥ 1000px wide so they fall into the desktop branch today; the desktop grid needs 1370–1450px of fixed tracks. | `01_APP_GRAPH_MAP.md` §viewport, `06_PLAN.md` Phase 0 |
| D2 | 2026-10-24 | Touch adaptations key off **`isCoarsePointer` / `hasHover`**, geometry adaptations key off **width**. Never mix the two. | A Mac with a touchscreen-less narrow window is not a tablet; an iPad with a trackpad still has a short screen. | `06_PLAN.md` Phase 0 |
| D3 | 2026-10-24 | **Revised by the user.** Safari cannot do Bluetooth, so Bluetooth printing goes through a **native bridge app** we build and sideload (wrapper shell with a `navigator.bluetooth` polyfill, WebBLE Apache-2.0 as the base; `nextmarkBridge` for MFi/TCP). The web app keeps a transport layer: share/AirPrint first (works everywhere), bridge transports when present. Parallel native project, separate repo. | WebKit does not ship Web Bluetooth/Serial/USB; a sideloaded WKWebView app can. | `05_PRINTING_AND_BLUETOOTH.md` §6 |
| D4 | 2026-10-24 | Service worker stays notification-only; admin PWA gets a second manifest with `scope: "/"`. | Guard script + live-deployment requirement. | `04_PWA_AND_PLATFORM.md` |
| D5 | 2026-10-24 | Desktop ≥ 1440px must stay pixel-identical unless a phase says otherwise. | Client also works on monitors. | `00_GOAL_AND_CONSTRAINTS.md` |
| D8 | 2026-10-24 | The drag **press and lift cue** (squeeze while held, preview lifts with shadow and accent ring) applies to **every pointer, desktop included**. Mouse **activation** is unchanged (press and move 6px, no hold). | The user liked the cue on touch and wants the same feel on PC. A hold for the mouse was not adopted: no scroll conflict to solve, and it would swallow slow clicks. | `11_TOUCH_DRAG_INTENT.md` §6, `shared/dnd/CueMouseSensor.ts` |
| D7 | 2026-10-24 | Content-priority decisions (`09`) are made **after Phases 0–5**, when the user can use the app on the iPad; implemented as Phase 6b before the bridge project. | Decisions need the real device experience. | `06_PLAN.md` Phase 1b/6b |
| D6 | 2026-10-24 | The native bridge app is **deferred to after the full iPad refactor**. The web app ships share/AirPrint printing and keeps a transport port open for it. | The user wants to explore the bridge as a reusable project for several PWAs. | `06_PLAN.md` Phase 6, `05` §6 |

## Open questions for the client / user

| # | Question | Needed by |
|---|---|---|
| Q1 | Exact iPad model(s) and iPadOS version in use. | Phase 0 (breakpoint range) |
| Q2 | Which label printer (model; BLE GATT printing supported? MFi-certified with protocol string? Wi-Fi port 9100? AirPrint?) — decides renderer (ZPL/ESC-POS/TSPL/raster) and transport. | Phase 6 |
| Q6 | Apple Developer Program membership available for the bridge app? Who owns it (us or the client)? How many iPads (Ad Hoc ≤100 UDIDs)? | Bridge project kick-off |
| Q3 | Is the map needed on the iPad home screen at all times, or can it be a toggled panel by default? | Phase 1 |
| Q4 | Is zone drawing needed on iPad? (Assumed no.) | Phase 3 |
| Q5 | Do operators use a keyboard/trackpad case? | Phase 2 |

## Kick-off answers needed from the user (asked 2026-10-24)

| # | Needed before | Question | Default if unanswered |
|---|---|---|---|
| K1 | Phase 0 | Git workflow | **Answered:** one branch per phase (`ipad/phase-N-<slug>`). Commit only when the user says so. |
| K2 | Phase 0 | Pre-existing gate failures | **Answered: fix them in Phase 0** (`theme-codemod --check` at `OrderCard.tsx:82`, functional-color-guard counts) as the first commit-sized step, so every later gate run is meaningful. |
| K3 | Phase 0 | Test runner | **Answered: add vitest** (dev dependency + `test` script; wrap the 96 existing `run…Tests` files with one glob spec). |
| K4 | Phase 0 | Device testing | **Answered:** iPad on the same Wi-Fi; the user reaches the dev server through **VS Code port forwarding (GitHub dev tunnel, HTTPS)**. That tunnel is also usable for Phase 5 install tests (HTTPS origin). If Vite answers "Blocked request. This host is not allowed", add the tunnel host to `server.allowedHosts` in `vite.config.ts`. Model/iPadOS: read from the device at the first test. |
| K5 | Phase 1 | Tablet default view | **Answered: map folded** on first run (plan + orders visible). |
| K6 | Phase 1 | Parallel sessions | **Answered: yes**, Phases 1, 2, 3 may run in parallel on their own branches; each stays inside its file list; merge 1 before 4. |
| K7 | Phase 5 | App name / icon | **Answered: name "NextMark Admin"**, short name "NextMark" (default). Icon artwork still to be provided; generate from the favicon meanwhile. |
| K8 | Phase 6 | Printer | **Deferred by the user** until the printing phase. Test with "Save to Files" meanwhile. |

## Session entries

### 2026-10-24 — Phase 2b reviewed; drag cue extended to desktop (Claude)

- Phase 2b review: sensor on the public dnd-kit API, pure decision with 8 cases, direction-free, cue attribute owned by the sensor, mouse unchanged, null drop is a no-op. Gates green; committed.
- User tested in Chrome emulation: "looks great". Decision D8: keep the cue on PC and wide screens.
- Implemented: `shared/dnd/dragCue.ts` (one `data-drag-cue` attribute + `PRESS_CUE_DELAY_MS` 80), `shared/dnd/CueMouseSensor.ts` (MouseSensor with the cue, added by wrapping the public sensor callbacks; activation unchanged), the touch sensor now uses the same helper, CSS moved out of `(pointer: coarse)` and renamed (`data-drag-cue`, `.drag-preview-lift`, `drag-cue-lift`), the home preview lifts for every pointer (the up-left offset stays touch-only). Tests: `CueMouseSensor.vitest.test.ts` (no flash on quick clicks, press → active → cleared, 6px activation unchanged).
- Desktop watch item (E rows): a click held longer than 80 ms shows a brief squeeze before the card opens; raise `PRESS_CUE_DELAY_MS` if it feels busy.

### 2026-10-24 — Phase 2b touch drag intent (Codex)

- Branch `ipad/phase-2b-touch-intent`; no commit. Re-grepped the drag sensor, draggable cue, overlay, logger and drop symbols before editing. Kept the temporary dev logger and wired `onIntentDecision` to its `intent` entries in dev.
- Added `shared/dnd/domain/touchDragIntent.ts` and eight vitest cases for hold timing, tolerance, flick, press-pause-move in both vertical directions, rest-then-flick, non-cancelable movement, post-decision behavior and sparse samples. Direction is absent from the decision rule. The speed helper uses recent sampled movement, so a late flick is not diluted by the earlier rest.
- Added `PressIntentTouchSensor` against dnd-kit 6.3.1's public sensor contract, without subclassing its sensors or reading private members. It decides on the first move outside tolerance, prevents that move only for an activation, aborts pending gestures on scroll, suppresses long-press native actions, and owns the press/active attribute. All four drag contexts use `useAppDragSensors`; MouseSensor remains at distance 6. Added the source and overlay cues with reduced-motion handling; kept the Phase 2 preview offset. Home `onDragEnd` returns without a change when `over` is null.
- Values retained from `11`: hold 220 ms, tolerance 8 px, dwell 120 ms, speed 0.8 px/ms, recent window 50 ms, press cue 80 ms. These need iPad tuning after B16–B20.
- Gates: lint ✅ (0 errors, 52 existing warnings); tests ✅ (151/151); build ✅; popup contract ✅; theme regression ✅; external-form PWA ✅; `git diff --check` including untracked files ✅. No check or lint rule changed. Chrome was not used. B16–B20 and E1–E2 remain pending; E3 automated gates ✅.

### 2026-10-24 — Touch drag diagnosed with logs; Phase 2b specified (Claude)

- User report: in Chrome iPad mini emulation (1024 wide) taps work but drag-and-drop does not. First test ran on the wrong checkout (`ipad/phase-0-foundations` served from `NextMark-app-v2/Front_end/admin-app`); retested on the stack tip — same result.
- Added a temporary dev-only logger (`src/app/debug/`, committed as `TEMPORARY…` on `ipad/phase-2b-touch-intent`). Evidence: the finger left the 8 px tolerance at 159–237 ms, before the 250 ms hold; dnd-kit cancelled, the browser took the pan (`pointercancel`, later moves non-cancelable). Holding still ≥ 250 ms works (`dnd:start` at 253 ms, moves `defaultPrevented`). A long press also fired `selectstart`/`contextmenu`.
- Root cause: not a wiring bug — the hold works, but nothing tells the user when the card is ready, so they move too early.
- Decision (user): option 1 (hold with a clear pick-up cue) + option 4 (press-pause-move: slow deliberate movement after a short rest starts the drag; a flick scrolls). Direction-based intent rejected: route stops are reordered vertically. Spec `11_TOUCH_DRAG_INTENT.md`, plan section Phase 2b, rows B16–B20.
- Worktree note: `NextMark-ipad/phase-5b` is now on `ipad/phase-2b-touch-intent` (the user's dev server runs there).

### 2026-10-24 — Phases 4 and 5b reviewed; full stack committed (Claude)

- Final stack (linear, nothing on `main` yet): `phase-0-foundations` → `phase-0c-baseline` → `phase-1-geometry` → `phase-2-touch` → `phase-3-typography` → `phase-4-popups` → `phase-5-pwa` (+ deploy workflow cache headers) → `phase-5b-auto-update`. Test and merge from the 5b tip.
- Gates on the tip: lint 0 errors / 52 warnings, tests 143/143, build, popup contract, theme regression, PWA checks, `git diff --check` ✅. `dist/version.json` id equals the id inlined in the bundle.
- Phase 4 review: desktop keeps the original `FeaturePopupShell`/`ClassicLayout` trees and classes; tablet-only branches add the gutter, scrollable overlay and full-screen rule; `vh`→`dvh` is identical on desktop browsers. No changes needed.
- Phase 5b review: never reloads on a failed/malformed check or a failed `index.html` refetch; blockers re-checked after the refetch; loop guard per target build; service worker only gets `update()`. No changes needed.
- Deploy workflow (§4 of `10`) approved by the user and committed on `ipad/phase-5-pwa`: assets first, immutable, no `--delete`; entry files `no-cache`; manifests with the manifest content type. Separate buckets for driver/external apps, so nothing else deletes kept assets. After the first deploy from `main`, check:
  - `curl -sI https://<admin-host>/ | grep -i cache-control` → `no-cache`
  - `curl -sI https://<admin-host>/version.json | grep -i cache-control` → `no-cache`
  - `curl -sI https://<admin-host>/assets/<any file>.js | grep -i cache-control` → `immutable`
  - `curl -sI https://<admin-host>/external-form/x | grep -i cache-control` (CloudFront error-page fallback; note the result)
- Later: S3 lifecycle rule to expire old `assets/` objects after ~30 days.
- Install icons replaced (user: reuse the driver-app icon): source is the 1024px PNG inside `driver-app/public/pwa-icon.svg`, cropped to the dark tile and made full-bleed (corners filled from the adjacent gradient) so iOS applies its own rounding instead of showing a white square; `maskable-512.png` has the artwork at 80% so the logo stays inside the launcher safe zone.
- Open for the user: device rows for every phase; removal of the finished worktrees.

### 2026-10-24 — Phase 5b silent auto-update, app side (Claude)

- Scope: `10_AUTO_UPDATE.md` §3, §3.1, §3.2 and the optional §5 build stamp. Branch `ipad/phase-5b-auto-update`; no commit. **`.github/workflows/deploy-admin.yml` (§4) untouched** — it needs the user's confirmation. Symbols re-grepped before every edit. Chrome not used.
- New `src/app/version/`: `domain/appVersion.ts` (`parseVersionPayload`, `shouldApplyUpdate`, throttle, editable-element check), `domain/buildStamp.ts`, `reloadBlockers.ts` (`registerReloadBlocker` / subscribe), `useReloadBlocker.ts`, `appVersionChecker.ts` (throttle, deferral, loop guard; ports injected so it runs without a DOM), `appVersion.runtime.ts` (`startAppVersionMonitor`: browser listeners, fetches, storage), `buildInfo.ts`, `index.ts`. Started from `main.tsx`; it returns at once unless `import.meta.env.PROD`, so dev does nothing. `main.tsx` now reads the build id from `buildInfo.ts` instead of declaring the globals itself.
- `vite.config.ts`: build-only plugin emits `dist/version.json` `{ buildId, builtAt }` from the same constants as `define`. Verified: `dist/version.json` id `1792864634402` equals the id inlined in `dist/assets/index-*.js` (the value `window.__NEXTMARK_BUILD_INFO__.buildId` reports).
- Behaviour: checks on visible, `pageshow` (persisted), `online`, `focus`, every 5 min while visible, and **once at start** (a cold launch can itself come from a stale cached `index.html`). 30 s throttle; a throttled trigger still applies an update an earlier check found. Fetch `no-store`/`credentials: 'omit'`; any failure, non-OK, empty, HTML or malformed body → no reload. A failed check also does not apply an earlier finding. Before reloading: refetch `/` with `cache: 'reload'` (must be OK or **no reload**, so an offline installed app never lands on an error page), current deep path best-effort; blockers re-checked after the refetch. Loop guard in `sessionStorage` `beyo.admin.version.reload-target` (memory fallback when storage throws); at boot logs `[app-version] reload did not take effect` or clears the marker. `vite:preloadError` → `preventDefault()` + forced check through the same path. All three router lazy routes are wrapped in `__vitePreload` in the build, so their failures reach that event — no extra router catch added. The notification worker only gets `getRegistration()` + `update()` (`refreshAdminNotificationsServiceWorker` in `adminWebPush.runtime.ts`, lookup only); no fetch handler, no cache.
- Blockers wired: order form (`OrderForm.provider.tsx`, `hasUnsavedChanges`); every feature popup that reports unsaved changes via the shared `useFeaturePopupCloseController` (covers ItemForm, plan and route-group forms, order filter); `EditOrderNotePopup`, `FailureNotePopup` and the send-client-form-link controller (they pass `hasUnsavedChanges: false` to the close prompt, so they block on their own text/submit state; close-prompt behaviour unchanged); external form while preparing/collecting/submitted (idle signage reloads); home drag (`HomeRouteOperationsManagersProvider`, `activeDrag`); settings sortables in `ItemStatesPage`, `ClientFormRulesPage`, `ClientFormMediaPlacementGroup`. Generic: focused editable element; file-input click or print within 10 s.
- Judgment calls: (1) when the last registered blocker clears, the retry waits 5 s (`BLOCKER_RELEASE_SETTLE_MS`) so a save sent as the form closes can finish — for C10 this means a reload ≈5 s after saving/closing if an update was already found, otherwise on the next trigger. (2) Clearing a focused field does not trigger a retry by itself; the next trigger applies it. (3) The share sheet (`navigator.share`, Phase 6) is not detected as a system dialog yet.
- Build stamp: `SettingsBuildStamp` ("Build 634402 · 2026-10-24 17:57 UTC") under Log out in the desktop sidebar and the phone settings index. Adds one small line to desktop Settings (E-row watch item).
- Tests: `src/app/version/domain/appVersion.vitest.test.ts` (truth table incl. loop guard, 13 malformed payloads incl. captive-portal HTML, throttle window, editable check, stamp) and `appVersionChecker.vitest.test.ts` (two triggers in 30 s → one fetch, in-flight sharing, forced check, failed check/refetch never reloads, deferral + retry, blocker appearing during refetch, loop guard, registry counting). Mutations of the loop guard, the post-refetch blocker re-check and the failed-check rule each fail the suite.
- Gates: `npm run lint` ✅ (0 errors, 52 existing warnings); `npm test` ✅ (143/143, was 97); `npm run build` ✅ with `dist/version.json`; `check:popup-contract` ✅; `theme:regression` ✅; `check:external-form-pwa` ✅; `git diff --check` ✅ with new files included via intent-to-add. No check or lint rule changed.
- Device matrix: C9–C12 ⏳ need a real deploy. Until §4 lands, uploads still carry no `Cache-Control` and `--delete` removes old chunks, so C12 can only pass via "reloads once", and the `cache: 'reload'` refetch is what keeps C9 honest.
- Left for next: user decision on §4 `deploy-admin.yml`, then post-deploy `curl -sI` header checks from §4; commit when the user asks.

### 2026-10-24 — Phases 3 and 5 reviewed and stacked; Phase 4 and 5b opened (Claude)

- Stack now: 0 → 0c → 1 → 2 → 3 (`ipad/phase-3-typography`) → 5 (`ipad/phase-5-pwa`, rebased on 3). Gates on the Phase 5 tip: lint 0 errors, tests 97/97, build, popup contract, theme regression, PWA checks, `git diff --check` ✅.
- Phase 3 review fixes and Phase 5 logo issue: see their entries below.
- User requirement (2026-10-24): installed apps must update automatically on every deploy, with no prompt, reliably on Apple devices. Hosting verified as S3 `delivery-frontend-app` + CloudFront `E16F4UEPFT2P6Y` via `Front_end/.github/workflows/deploy-admin.yml` (not nginx; the EC2 nginx only serves the API). Spec written: `10_AUTO_UPDATE.md`; plan section Phase 5b; device rows C9–C12.
- Opened `ipad/phase-4-popups` (from Phase 3 tip) and `ipad/phase-5b-auto-update` (from Phase 5 tip), worktrees `NextMark-ipad/phase-4` and `phase-5b`. They run in parallel; merge order 4 → 5 (rebased on 4) → 5b.

### 2026-10-24 — Phase 5 admin PWA (Codex)

- Branch `ipad/phase-5-pwa`; no commit. Re-grepped PWA, viewport and back-layer symbols before editing. Phase 3 typography and `index.css` remain untouched.
- Added `admin.webmanifest` and favicon-derived admin icons, a root admin contract and route-aware head selection. The form manifest and `/external-form` containment remain scoped. Kept `ExternalFormPwaProvider` as named. The admin head uses `default` status bar style and the dark page tone `#182224`.
- Extended `check:external-form-pwa` to verify the admin contract, icons and root scope while retaining the notification-only service-worker guard. Added standalone tablet history handling for popup, section and sheet stacks by reusing the phone shell's stack-count/back flow; no second history owner or service worker was added. This uses the existing stack registry rather than individual `useBackLayerRegistration` calls because the managers already expose all popup and section entries to that flow.
- Gates: `npm run lint` ✅ (0 errors, 52 existing warnings); `npm test` ✅ (97/97); `npm run build` ✅; `check:popup-contract` ✅; `theme:regression` ✅; `check:external-form-pwa` ✅; `git diff --check` ✅ with new files included via intent-to-add. No check or lint rule changed.
- Device matrix: C1–C6 and D2–D3 ⏳ pending on the iPad. C3 requires logging in once inside the installed app because iPadOS partitions its storage from Safari. C6 requires the installed app's push permission tap and a delivered push. Chrome was not used.
- Claude review (2026-10-24): manifest, head tags, guard-script extension and the standalone-tablet back flow match `04` §3–5; the service worker is still notification-only. **Open asset issue:** the admin icons are a small low-resolution logo on a white square inside a dark frame, and `maskable-512.png` is a byte copy of `icon-512.png` (no safe-zone padding). Needs a proper source logo (SVG or ≥1024px PNG) from the user before the client installs it. Silent auto-update follows as Phase 5b (`10_AUTO_UPDATE.md`).
### 2026-10-24 — Phase 4 popups, forms and settings at tablet height (Claude)

- Branch: `ipad/phase-4-popups` (from the Phase 3 tip `9952997`); no commit. Re-grepped every symbol before editing. Geometry keys off `isTablet`, touch off `isCoarsePointer`, insets off `isStandalone`; no new `text-[Npx]` literals.
- **Inset rule used throughout:** whatever touches the screen edge takes the inset. Centred popups get it on their overlay container through a new `.safe-p-4` helper (`index.css`, next to `.safe-*`: each side pads by `max(1rem, inset)`). `.safe-bottom` is unlayered CSS and *replaces* Tailwind bottom padding, so surfaces that already have bottom padding use `pb-[calc(N+env(safe-area-inset-bottom,0px))]` (the existing `FeaturePopupFooter` pattern). Home surfaces add the inset only when `isStandalone && !isMobile`, because the phone tab bar already owns it.
- Order form (`OrderFormShell.tsx`): `w-[min(950px,calc(100vw-2rem))]`, `h-[min(92dvh,900px)]`, plus `max-h-full` on tablet; the overlay uses `safe-p-4` when standalone. `OrderFormDesktop.layout.tsx`: the 560 column is `shrink` instead of `shrink-0`. This is the flex equivalent of `minmax(0,560px)`, and it has no effect while the shell is 950 wide. The same dvh, standalone and tablet `max-h-full` treatment goes on `CostumerFormShell.tsx` and `RouteGroupEditFormShell.tsx`. They are outside the plan's file list, but row A7 names them.
- MainPopup (`ClassicLayout.tsx`, Settings popups): on tablet the container gets `p-4` (`safe-p-4` when standalone), so `h-full max-h-[800px]` resolves to `min(800px, 100dvh-2rem)`. `autoHeight` uses `max-h-full`, and the min width is `min(500px,100%)`. Desktop classes are unchanged. `PopupFooter.tsx` adds the bottom inset only in the phone full-screen branch, the one place the footer touches the edge; line 31 stays put for the `theme-map.json` anchor. `PopupBody.tsx` already destructures `const { isMobile } = useMobile()`, so it needed no fix.
- `FeaturePopupShell.tsx`: the size map uses `dvh`. On tablet, `lg`/`full` go full screen, and centred popups sit in a scroll-safe overlay: `fixed inset-0 overflow-y-auto overscroll-contain` › `relative flex min-h-full items-center justify-center p-4` › backdrop + panel. A content-sized (`mdNoHeight`) popup taller than the screen scrolls with its footer reachable instead of being clipped at both ends, and it stays centred when it fits. Desktop keeps the original tree and classes.
- **Per-popup tablet decisions (11 users, all `variant="center"`; none is `lg`/`full`):**

| Popup | Size | Tablet | Why |
|---|---|---|---|
| `EditOrderNotePopup` | sm | centred | `min(86dvh,760px)` = 640px at 744 tall; short note form |
| `SendClientFormLinkPopup` | sm | centred | same height; short form |
| `ItemForm` | md | centred | `min(88dvh,820px)` = 655px at 744 tall; body scrolls inside |
| `FailureNotePopup` | mdNoHeight | centred | one note field |
| `OrderFilterPopup` | mdNoHeight | centred | its body caps itself at `min(70vh,640px)` |
| `SwitchActingUserPopup` | mdNoHeight | centred | short user list |
| `PlanObjectiveMismatchPopup` | mdNoHeight | centred | decision prompt |
| `OrderAssignmentContactWarningPopup` | mdNoHeight | centred | choice prompt; the overlay scroll covers its longer views |
| `PlanFormPopup` | mdNoHeight | centred | content-sized form, 600px wide; full screen would stretch fields to ~1150px; the overlay scroll covers short screens |
| `CreateRouteGroupFormPopup` | mdNoHeight | centred | same reasoning as the plan form |
| `ZoneForm` | mdNoHeight | centred | small form; zone drawing stays desktop-only (Q4) |
| *(rule)* any `lg`/`full` | lg/full | **full screen** | no current user; the Phase 6 PDF viewer (`lg`) will get it |

- Settings (`SettingsDesktopView.tsx`): on tablet the sidebar is `w-60` and its nav list scrolls (`min-h-0 overflow-y-auto`), so Log out stays on screen at 744 tall. Back, nav rows, sub-rows and Log out are `min-h-11` on coarse pointers, and the Log out block is `.safe-bottom` when standalone.
- Bottom insets when standalone (tablet/desktop branch): `RouteGroupStatsOverlayShell.tsx` (both states; the map-inset observer measures the extra padding), `RouteGroupReadyFooter.tsx` (`pb-25` → `calc(6.25rem+inset)`), `OrderLinkedDeviceLiveWidget.tsx` (`bottom-4` → `calc(1rem+inset)`) and the order list "Show more" pager in `orderMain.page.tsx`.
- Plan deviation: the order-form footer did not get `.safe-bottom`. On tablet the modal never reaches the bottom edge (it leaves at least 30px at 744 tall), so the inset goes on its overlay instead. The unconditional `vh` → `dvh` changes render identically on desktop browsers.
- Gates: `npm run lint` ✅ (0 errors, 52 existing warnings); `npm test` ✅ (97/97); `npm run build` ✅ (Tailwind emits every new arbitrary class, checked in `dist`); `check:popup-contract` ✅; `theme:regression` ✅ (typography codemod `--check` 0 replacements); `check:external-form-pwa` ✅; `git diff --check` ✅ (no untracked files). No check or lint rule was changed.
- Device matrix: A6–A8 ⏳, D1 ⏳, C2 ⏳ (needs the installed app, so it can only run after Phase 5 is merged), E1–E2 ⏳ desktop visual comparison. Chrome was not used, as directed. E3 ✅.
- Left for the next session / device watch items: D1 depends on Safari scrolling the focused field into view; no keyboard-specific code was added. A8: Phase 3 already capped the notifications list height; its `w-[360px]` popover position was not in the Phase 4 list. `RouteGroupStatsOverlayShell` `max-h-[40vh]` was left as is. On the iPad, check that a tall `PlanFormPopup` scrolls with a finger dragged in the side margins.

### 2026-10-24 — Phase 3 typography and density tokens (Codex)

- Branch: `ipad/phase-3-typography`; no commit. Re-grepped typography, icon-size, height and badge tokens before editing. Source changes stay in the Phase 3 surfaces and codemod-eligible files.
- Added `text-nano`, `text-micro`, `text-2xs` and exact-value aliases for existing arbitrary px/rem sizes. Desktop values remain unchanged; coarse pointers raise sub-12px text to 12px and `text-xs` to 13px. The codemod replaced 295 uses across 134 files; its `--check` runs in `theme:regression`. Removed all nine no-op `text-md` uses. Interactive SVGs with `h-2`/`h-2.5`/`h-3` have coarse-pointer minimums of 14/14/16px.
- Added coarse-pointer viewport-height caps to the four order-detail panels, delivery-window calendar and notifications list, preserving their desktop heights. Moved the three Phase 0 badge colors to light/dark theme variables.
- Judgment: the plan's nearest-token rem conversion would slightly change desktop sizes, so fractional sizes keep exact desktop values through aliases. The two no-op `text-md` spans and raw button use `text-base/normal` to preserve inherited 16px with normal line height; BasicButton cases use its existing `text-sm` size.
- Gates: `npm run lint` ✅ (0 errors, 52 existing warnings); `npm test` ✅ (97/97); `npm run build` ✅; `npm run check:popup-contract` ✅; `npm run theme:regression` ✅; `npm run check:external-form-pwa` ✅; codemod `--check` ✅; `git diff --check` ✅ including the new script. No check or lint rule was relaxed.
- Device matrix: A1–A7 readability ⏳; E1–E2 desktop visual comparison ⏳. Chrome was not used, as directed; iPad device review remains pending. E3 automated gates ✅.
- Claude review (2026-10-24): codemod mapping verified value-for-value (295 replacements, 195 colour classes intact, no `text-[Npx|rem]` left outside the excluded folders). Two desktop regressions fixed: the light theme's missing-info badge had moved to `--warning-soft`/`--ink` (amber/near-black instead of the original yellow/brown) — restored the original values in the light block; `--text-nano/micro/2xs--line-height: normal` made converted text stop inheriting its line height — removed, so the utilities emit font-size only, exactly like the arbitrary classes they replace. Desktop watch item for E1: the nine `text-md` no-ops now resolve to `text-sm`/`text-base`.

### 2026-10-24 — Stack committed, second wave opened (Claude)

- Committed and stacked in merge order: `ipad/phase-0-foundations` → `ipad/phase-0c-baseline` (0c) → `ipad/phase-1-geometry` (1) → `ipad/phase-2-touch` (2). Nothing merged to `main`; that waits for the iPad rows.
- Integration found two defects the separate branches could not show, fixed in the commit that caused them: 0c's typed `MapInstanceManager` rejected Phase 1's `gestureHandling` because the repo's own Maps typings (`packages/shared-google-maps/googleMaps.globals.ts`) lacked the field — added to the Phase 1 commit; a 0c file had trailing whitespace (`git diff --check` ignores untracked files) — fixed in the 0c commit.
- Gates on the stack tip: lint 0 errors / 52 warnings ✅, tests 97/97 ✅, build ✅, popup contract ✅, theme regression ✅, external-form PWA ✅, `git diff --check` ✅. Phase 1 builds on its own ✅.
- **Gate rule from now on:** the baseline is green, so every phase must leave the full gates green. A failure in a file outside the phase list is reported, not fixed.
- Second wave: **Phase 3** (`ipad/phase-3-typography`) and **Phase 5** (`ipad/phase-5-pwa`) run in parallel from the stack tip; **Phase 4** (`ipad/phase-4-popups`) starts from Phase 3's tip because the codemod rewrites the same popup files. Merge order stays 3 → 4 → 5 (5 rebases last).
- Codex's Chrome tool fails on setup (`node:process` in `node_repl`); sessions skip it and leave Chrome rows pending for Claude or the user.
- Device check (user, next day): Phase 0 rows first, then A/B rows for 1 and 2 on the stack tip, then whatever of 3–5 is committed.

### 2026-10-24 — Phase 2 touch (Codex, reviewed by Claude)

- Branch: `ipad/phase-2-touch`; no commit. Re-grepped the Phase 2 symbols before editing and kept source edits to the named Phase 2 files. `PlanCard` and `ItemTypeCountsPill` already use `useViewport()` from Phase 0.
- Implemented tap paths for the route-group warning, missing-info notifier, delivery-window days, and driver markers; coarse-pointer button and listed small-control hit areas; settings drag-source callout suppression and Edit event isolation; calmer coarse-pointer auto-scroll, lifted drag previews, longer calendar drag dwell/grace, and scroll-idle snapping fallback. Scoped map hover styles to hover-capable input. This is partial and has not passed device review.
- Gates: `npm run build` ✅; `npm run check:popup-contract` ✅; `npm run theme:regression` ✅; `npm run check:external-form-pwa` ✅; `git diff --check` ✅. `npm run lint` ❌: 207 errors and 54 warnings, the same recorded Phase 0c repository baseline. `npm test -- --run` ❌: 89/97, the same eight legacy failures recorded for Phase 0c. No check or lint rule was changed.
- Chrome device-mode geometry at 1024×768, 1180×820 and 1366×1024: ⏳ unverified. The browser connection failed at setup (`Importing module "node:process" is not allowed in node_repl`), before navigation. No iPad available; finger checks remain pending. Desktop E1–E2 visual comparison pending; E3 fails on lint.
- Left for continuation after Phase 0c: finish the Phase 2 file-list audit, run the required visual and finger rows, and verify the touch-specific behavior on an iPad. `SlideCarouselDots` is decorative and has no click handler to enlarge. The package `MessageCard` close control received a local pseudo-element hit-area because package CSS cannot depend on the admin app stylesheet.
- Claude review (2026-10-24): code complete against the Phase 2 list; the stop was the inherited baseline, cleared by 0c. Changed-file lint adds no new errors. Driver-marker tap ids checked against `realtime/driverLive/driverLive.map.ts`. Acceptance greps pass (`matchMedia` in features: only reduced-motion; the one `group-hover` reveal is the hover-gated Phase 0 fix). Merged a duplicate `@/app/viewport` import. Device watch item: every `BasicButton` is ≥ 40px tall on coarse pointers, so check crowded headers on the iPad.

| Device matrix row | Result |
|---|---|
| B1–B9, B14, B15 finger interactions | ⏳ iPad unavailable; no touch pass claimed |
| A1–A9 at 1024×768, 1180×820, 1366×1024 | ⏳ Chrome connection failed before navigation |
| E1–E2 desktop visual comparison | ⏳ Chrome connection failed before navigation |
| E3 automated gates | ❌ lint baseline; build, popup, theme and PWA ✅ |
### 2026-10-24 — Phase 1 geometry (Codex, reviewed by Claude)

- Branch: `ipad/phase-1-geometry`; no commit. Re-grepped each edited symbol and kept source edits within the Phase 1 files.
- Implemented tablet track calculation, 420px base rail / 560px plan rail, initial map fold when no saved preference, reciprocal map/plan folding, 16px tablet map inset, coarse-pointer fold-tab width, calendar day minimum width with horizontal scroll, bounded map overlay widths, and greedy map gesture handling. Desktop track formulas and widths stay unchanged. Added domain cases for 1024, 1180, 1366, 1440 and 1920.
- Gates: build ✅; popup contract ✅; theme regression ✅; external-form PWA ✅; full lint ❌ 207 errors / 54 warnings (unchanged Phase 0c baseline); npm test ❌ 89/97 (same eight Phase 0c legacy failures). Changed-file ESLint is clear apart from the 11 pre-existing `no-explicit-any` errors in `MapInstanceManager.ts`, also assigned to Phase 0c. No check or lint rule was relaxed.
- Chrome device-mode geometry at 1024×768, 1180×820, 1366×1024: ⏳ pending. The browser connection failed during initialization (`Importing module "node:process" is not allowed in node_repl`), before any page opened. A1–A5, B10, and desktop E1 remain unverified; touch rows await the iPad.
- Stopped because the required lint gate cannot be made green within the Phase 1 file list. Phase 0c owns the repository baseline. Follow-up: merge/rebase the completed Phase 0c cleanup, rerun all gates, complete Chrome geometry and desktop comparisons, then review the Phase 1 changes before marking this phase implemented.
- Claude review (2026-10-24): code complete against the Phase 1 list; the stop was the inherited baseline, now cleared by 0c. Reverted the four map popup width changes (`min(Npx, calc(100% - 2rem))` can shrink content-sized popups on desktop, and the tablet map is never narrower than 464px when shown, so the popups already fit). Moved the saved-preference check into `homeDesktopLayout.storage.ts`. Replaced the domain test's viewport loop (width was not an input) with rail 420/560 cases. Chosen tablet widths: order rail 420, plan rail 560, map inset 16.
### 2026-10-24 — Phase 0c lint and legacy-test baseline cleanup (Codex)

- Branch: `ipad/phase-0c-baseline`; no commit. Worked within the Phase 0c lint/test baseline scope.
- Lint: fixed type, hook, unused-code, and React-refresh violations without changing lint rules or adding suppressions. Split non-component context and helper exports into sibling files, preserving package and feature boundaries. `npm run lint`: 0 errors / 52 warnings (down from 207 errors / 54 warnings).
- Tests: `npm test` passes 97/97. Updated stale legacy fixtures and three map tests for the current map manager and a jsdom environment; added `jsdom` as a dev dependency. Fixed a real order-form submit bug: missing item IDs are rejected before the submit continues.
- Gates: `npm run build`, `npm run check:popup-contract`, `npm run theme:regression`, `npm run check:external-form-pwa`, and `git diff --check` pass. The theme map's PlanForm line anchor moved from 118 to 114 after unused-import cleanup; the exact color assertion remains unchanged.
- Chrome geometry at 1024×768, 1180×820, and 1366×1024 with `?viewport=tablet&pointer=coarse`: pending. Chrome browser setup failed before navigation with `Importing module "node:process" is not allowed in node_repl`. No iPad is available today; touch rows remain pending.

### 2026-10-24 — Phase 0 committed, next phases opened (Claude)

- No iPad available today; the user moves on and verifies Phase 0 on the device tomorrow. Phase 0 code committed on `ipad/phase-0-foundations` as **device-unverified**; if the device rows fail, fix on that branch and rebase the downstream branches.
- File-overlap check: 0c, 1 and 2 can run in parallel; Phase 3 waits for them (plan updated, "Parallel run" in `06`).
- Branches created from the Phase 0 tip: `ipad/phase-0c-baseline`, `ipad/phase-1-geometry`, `ipad/phase-2-touch`.
- Without an iPad, geometry is checked in Chrome device mode with `?viewport=tablet&pointer=coarse` at 1024×768, 1180×820, 1366×1024; touch rows stay pending until the device is back.

### 2026-10-24 — Review of Phase 0 (Claude)

- Verified independently: `npm run build` ✅, `check:popup-contract` ✅, `theme:regression` ✅, `check:external-form-pwa` ✅, `git diff --check` ✅, ESLint on every changed file ✅. `eslint .` = 207 errors / 54 warnings in 110 files, none of them touched by Phase 0 → pre-existing debt, scheduled as **Phase 0c** in `06`. `npm test` = 89/97, the 8 failures are legacy tests in untouched code paths (5 assertion failures that may be real bugs, 3 map tests with environment problems) → also Phase 0c.
- Diff review against the Phase 0 plan: viewport size class + `isStandalone` + dev override ✅ (`isStandalone` read once at mount, no `app/pwa` → `app/viewport` cycle); pointer-scoped CSS baseline ✅; `h-screen` → `h-dvh` in the three files ✅; BottomSheet drag moved to the 44px handle with `useDragControls`, `dragListener={false}`, `touch-none` ✅; notification dismiss visible when `!hasHover` ✅; `PlanCard` / `ItemTypeCountsPill` now read the viewport owner ✅; `--vh` writer removed ✅; vitest + glob runner ✅; theme gate fixed at the cause (stale line overrides, stale allowlist counts tightened, `text-white` / `bg-yellow-300` replaced by `@theme inline` tokens).
- Nit, not blocking: the new `--color-notification-badge-ink`, `--color-missing-info-badge(-ink)` tokens are fixed hex values in `@theme inline`, not tied to the light/dark variables (same as the palette classes they replaced, so no visual change). Consider mapping them to theme variables in Phase 3.
- Verdict: ready for the device rows B6, B9, B11, B12, B13 and desktop E1/E2. Commit after the device pass.

### 2026-10-24 — Session 1: Phase 0 foundations (Codex)

- Branch: `ipad/phase-0-foundations`; no commit. The user reconfirmed the 1440px desktop boundary.
- Scope: fixed the theme regression baseline; added viewport size class, standalone fact, coarse-pointer CSS, dynamic viewport height, handle-only BottomSheet drag, visible notification dismissal without hover, and a development-only tablet/coarse override. Replaced the two remaining local touch media queries with the viewport owner. Removed the unused `--vh` writer.
- Vitest: installed as a dev dependency; one glob runner invokes all 96 legacy test files, including the one with top-level assertions. Added a viewport boundary test. Vitest's include list names the runner and `*.vitest.test.ts` because including all legacy `*.test.ts` as independent Vitest files would report “No test suite found” for each file.
- Files: `package.json`, `package-lock.json`, `vitest.config.ts`, `src/tests/legacy-runner.test.ts`, `src/app/viewport/*`, `src/app/pwa/index.ts`, `src/index.css`, `src/main.tsx`, `src/app/router/AppRouterSkeleton.tsx`, `src/features/home-app/pages/HomeAppPage.tsx`, `src/features/settings/pages/SettingsPage.tsx`, `src/shared/overlays/bottomSheet/BottomSheet.tsx`, `src/realtime/notifications/AdminNotificationItem.tsx`, the two local touch-detection components, theme map/allowlist, and the three theme-gate component files. This log, README and plan status were updated.
- Gates: `npm run build` ✅; `npm run lint` ❌ (208 errors, 54 warnings across the repository; scoped ESLint on all touched TS/TSX files ✅); `npm run check:popup-contract` ✅; `npm run theme:regression` ✅ (initially failed at stale `OrderCard` override and three stale color counts, then exposed additional stale override lines, four notification `text-white` values, two colors and two radii); `npm run check:external-form-pwa` ✅. `git diff --check` ✅. Acceptance grep for `innerWidth|matchMedia` is limited to the allowed locations.
- New test runner: 89/97 tests pass; eight legacy tests fail in customer form submit, order map markers, order delivery windows, order form submit, plan date filter, and three map tests. Two map tests require `document` despite the planned Node environment; one map test reads a missing internal `layers` property. These failures are exposed by running legacy tests for the first time; the Phase 0 code does not change those paths. No assertions were weakened.
- Decision: left the unrelated repository lint errors and legacy test failures for a separately scoped cleanup. They keep the full gate set from being green. Device and visual verification remain pending; iPad model/iPadOS/trackpad status have not been recorded yet.

| Device matrix row | Result |
|---|---|
| B6 three-dot menu tap and items | ⏳ user iPad check pending |
| B9 notification dismissal | ⏳ user iPad check pending |
| B11 button/tab double-tap zoom and tap flash | ⏳ user iPad check pending |
| B12 popup scroll containment and document rubber-band | ⏳ user iPad check pending |
| B13 input focus zoom | ⏳ user iPad check pending |
| E1 desktop home comparison at 1440/1920 | ⏳ desktop visual check pending |
| E2 desktop popups, sections, settings | ⏳ desktop visual check pending |
| E3 automated gates | ❌ lint baseline; other four gates ✅ |

### 2026-10-24 — Session 0: analysis and context vault (Claude)

- Built this folder. No source code changed.
- Explored: shell (`HomeAppPage`, `HomeDesktopView`, `HomeDesktopLayout`, `useHomeDesktopLayout`, `homeDesktopLayout.domain`), viewport (`src/app/viewport`), PWA (`src/app/pwa`, guard script, SW), printing (`features/templates/printDocument`), DnD commit `ca2be09`, the phone-shell plan of 2026-10-07.
- Web research recorded in `04` and `05`.
- Gates not run (no code change). Known pre-existing gate failures from the 2026-10-07 notes: `theme-codemod --check` at `OrderCard.tsx:82`; `theme-functional-color-guard` three `rgba(0,0,0,…)` counts. Re-verify at Phase 0 start.
- User feedback same day: tablet size class approved (D1); Bluetooth to be solved with a native bridge app as a parallel project (D3 revised, `05` §6).
- Kick-off answers K1–K8 received (table above), vitest approved.
- Estimate given to the user for Phases 0–5 (2026-10-24): 10–12 agent sessions incl. fix rounds, ≈20–30 agent-hours, ≈6–10 user-hours of device testing; calendar ≈2 weeks sequential or 5–7 working days with Phases 1–3 in parallel. Tokens ≈3–4M fresh input, 1–2M output (thinking included), 40–60M cache reads. API cost at list prices: Fable 5.1 ≈ $100–180, Opus 5.5 ≈ $50–90, Sonnet 5.5 ≈ $25–45 (flat if on a subscription plan). Track actuals per session here.
- Next session starts at `06_PLAN.md` Phase 0 on branch `ipad/phase-0-foundations`.

<!-- Template for new entries:
### YYYY-MM-DD — Session N: <phase / fix> (<agent>)
- Scope taken:
- Files created/modified:
- Gates: build / lint / popup-contract / theme / pwa → results
- Device matrix rows run (07) → results
- Deviations from the plan and why:
- Left for the next session:
-->
