# 06 — Implementation plan: admin-app usable on iPad landscape

**Created:** 2026-10-24. **Status:** architecture decision approved by the user 2026-10-24; Phase 0 code implemented, device verification pending; Phases 0c and 1 committed and stacked; Chrome geometry and device rows pending (session log 2026-10-24). Phases are ordered by value ÷ risk and are independently shippable. Each phase is sized for one or two focused agent sessions and ends with the gates in `00_GOAL_AND_CONSTRAINTS.md` §4 plus the device rows named below (from `07_DEVICE_TEST_MATRIX.md`).

Paths relative to `Front_end/admin-app/src` unless stated. Line numbers are in `02`/`03`; re-grep before editing.

---

## 0. Architecture decision: a third size class, plus input class

Today `ViewportProvider` exposes `isMobile` (< 1000px), `isCoarsePointer`, `hasHover`. iPads in landscape are ≥ 1000px, so they get the desktop branch of every `isMobile` switch (113 lines, 52 files) and the fixed-width desktop grid.

**Decision (D1, D2 in `08_SESSION_LOG.md`):**

| Fact | Source | Drives |
|---|---|---|
| `sizeClass: 'phone' \| 'tablet' \| 'desktop'` | width: `< 1000` / `1000–1439` / `≥ 1440` | geometry: grid tracks, panel widths, popup sizes, fixed heights |
| `isCoarsePointer`, `hasHover` (existing) | `(pointer: coarse)`, `(hover: hover)` | touch: hit areas, hover fallbacks, sheet gestures, touch CSS, DnD tuning |
| `isStandalone` (new, from `app/pwa` `isStandaloneDisplay`) | `navigator.standalone` / `display-mode` | safe areas, history back layers, status bar |

- `isMobile` stays `sizeClass === 'phone'`; no existing call site changes meaning.
- A 1280px laptop window will receive the `tablet` geometry. That is acceptable (the map is 380px there today) and keeps monitors ≥ 1440 pixel-identical. **The user confirmed the 1440px boundary in Phase 0.**
- Never branch geometry on `isCoarsePointer`, never branch touch behaviour on width.

---

## Phase 0 — Foundations and the two blocking bugs (1 session)

**Status (2026-10-24):** code implemented on `ipad/phase-0-foundations`; device rows and desktop visual comparison await the user; repository-wide lint fails on 208 existing errors. No commit made, per K1.

**Goal:** one source of truth for size class and standalone; tablet-wide touch CSS baseline; fix the two defects that break touch everywhere.

**Step 0 (first, own commit-sized unit): fix the pre-existing gate failures** so the gates mean something afterwards: `theme-codemod --check` stop at `features/order/components/cards/OrderCard.tsx:82`; `theme-functional-color-guard` three `rgba(0,0,0,…)` counts (see `scripts/theme-functional-color-allowlist.json`). Run `npm run theme:regression` before and after. (User decision K2.)

**Step 0b (approved, K3): wire vitest.** `npm i -D vitest`, `"test": "vitest run"` in `package.json`, `vitest.config.ts` that reuses `vite.config.ts` aliases (`mergeConfig`), `environment: 'node'`, `include: ['src/**/*.test.ts']`. Existing files export `run…Tests()` and use a local `assert`; make them runnable with **one** wrapper spec per file or a single `src/tests/legacy-runner.test.ts` that imports and invokes every `run…Tests` export (`import.meta.glob`), so nothing needs rewriting. New domain tests use `describe/it/expect`.

**Create / modify**
- `app/viewport/viewport.config.ts`: add `TABLET_MIN_WIDTH = 1000`, `DESKTOP_MIN_WIDTH = 1440`, `TABLET_MEDIA_QUERY`, `WIDE_DESKTOP_MEDIA_QUERY`.
- `app/viewport/ViewportContext.ts` + `ViewportProvider.tsx`: add `sizeClass`, `isTablet` (derived), `isStandalone` (read once via `readStandaloneDisplayEnvironment` from `app/pwa`; `app/pwa` must not import `app/viewport` to avoid a cycle). Keep `DESKTOP_VIEWPORT_FALLBACK` shape-compatible.
- `index.css`: add `@theme { --breakpoint-tablet: 1000px; --breakpoint-wide: 1440px; }` so templates can use `tablet:` / `wide:` (keep `desk:` as an alias of the 1000 boundary; do not rename existing uses). Add a **pointer-scoped** baseline, not width-scoped:
  ```css
  @media (pointer: coarse) {
    html, body, #root { overscroll-behavior: none; -webkit-tap-highlight-color: transparent; }
    button, [role="button"], a, label, summary { touch-action: manipulation; -webkit-touch-callout: none; }
    input:not([type=checkbox]):not([type=radio]):not([type=range]), select, textarea { font-size: max(16px, 1em); }
  }
  ```
  and move the existing `(max-width: 999px) and (pointer: coarse)` input rule into it. Keep `.admin-shell-aurora` hidden only on phones (GPU cost on 12.9" iPads is acceptable; revisit if the device test shows jank).
- `features/home-app/pages/HomeAppPage.tsx`, `features/settings/pages/SettingsPage.tsx`, `app/router/AppRouterSkeleton.tsx`: `h-screen` → `h-dvh` (verify desktop unchanged).
- **Bug 1 — BottomSheet scroll trap** (`shared/overlays/bottomSheet/BottomSheet.tsx`): move the framer `drag="y"` to the grab handle only (`dragListener={false}` + `useDragControls()` started from the handle's `onPointerDown`), or keep whole-sheet drag but set `dragListener` off while the body is scrolled past 0. Body keeps `overscroll-contain`. Unblocks every `ActionSheet` (three-dot menus) on coarse pointers.
- **Bug 2 — Tailwind hover reveal** (`realtime/notifications/AdminNotificationItem.tsx` `opacity-0 group-hover:opacity-100`): make the button always visible when `!hasHover` (prop or `useViewport()`). This is the only `group-hover` that gates visibility; the other six are decorative.
- `main.tsx`: delete the unused `--vh` writer (nothing reads it) — optional, zero-risk cleanup inside scope.
- **Dev-only override** in `ViewportProvider`: `?viewport=tablet&pointer=coarse` (read once, `import.meta.env.DEV` only) forces `sizeClass` / `isCoarsePointer` / `hasHover`, so geometry and density can be iterated in Chrome's device toolbar before each iPad check. Never shipped in production builds.

**Acceptance:** `grep -rn "innerWidth\|matchMedia" src` shows only `app/viewport`, `app/pwa`, `lib/utils/useMediaQuery.ts`, `ZoneDetailsPopover.tsx`, `prefersReducedMotion.flow.ts`. Device rows B6, B11, B12, B13, B9. Desktop E1–E3. Gates green (record pre-existing failures).

---

## Phase 0c — Lint and legacy-test baseline cleanup (1 session, mechanical, any model)

**Status (2026-10-24):** code complete on `ipad/phase-0c-baseline`; lint has 0 errors / 52 warnings, tests pass 97/97, build and all three checks pass. Chrome viewport verification is pending because the browser connection fails during setup; iPad touch rows remain pending. No commit made.

**Found during Phase 0 (2026-10-24):** `npm run lint` fails on `main` with 207 errors in 110 files that Phase 0 did not touch (70 `no-explicit-any`, 65 `no-unused-vars`, 43 `react-refresh/only-export-components`, 8 `rules-of-hooks`, 7 `no-unused-expressions`, 5 `prefer-const`, …). The new vitest runner also exposes 8 legacy test failures that had never run: `costumerFormSubmit.actions`, `orderMapMarkers.flow`, `orderFormDeliveryWindows.flow`, `orderFormSubmit.controller`, `planDateFilter.utils` (assertion failures — each may be a stale test **or a real bug**, decide per case), and three `shared/map` tests (`circleSelection` needs `document`, `layers` reads a missing internal property, `markerLayerManager.dotContent`).

**Goal:** make `npm run lint` and `npm test` green on `main` so later phases have a real gate. No behaviour changes except where a legacy test reveals an actual bug (then fix the bug, log it in `08`).

- Lint: fix by rule family; `no-explicit-any` gets real types, not `unknown` casts; `only-export-components` splits non-component exports into sibling files; `rules-of-hooks` violations are reviewed one by one (they can be real bugs). Do not add eslint-disable comments and do not weaken `eslint.config.js`.
- Tests: for each failing legacy test, read the test and the code; if the code is right, fix the test; if the test is right, fix the code; for the two DOM-dependent map tests, give them a `// @vitest-environment jsdom` file pragma (add `jsdom` as a dev dependency) or convert them to `*.vitest.test.ts` with that environment.
- Branch `ipad/phase-0c-baseline`. Can run in parallel with Phases 1–3; merge before Phase 4.

**Acceptance:** `npm run lint` 0 errors (warnings may remain, record the count); `npm test` 97/97; build and the three check scripts green.

## Phase 1 — Home geometry for tablets (1–2 sessions)

**Goal:** at 1024–1439px no panel is narrower than it is on a phone; the map is either useful or deliberately folded; the calendar is readable.

**Rule: two of three.** On `tablet`, at most two of {map, plan column, rail} are expanded. Default on first run: plan + rail expanded, map folded (`homeDesktopLayout.store` default becomes size-class aware; persisted key stays). Showing the map folds the plan; opening the plan folds the map. The existing invariant "never both centre panels folded" stays.

**Modify**
- `features/home-route-operations/domain/homeDesktopLayout.domain.ts`: `resolveHomeDesktopTracks` gains `sizeClass` (and `viewportWidth` if needed). For `tablet`: plan column = `calc(100vw - rail)` when the map is folded (already exists), map gets `minmax(0,1fr)` with plan folded otherwise; the `DESKTOP_MAP_RAIL_WIDTH` (320) calendar case is desktop-only. For `desktop` the output is byte-identical to today. Add tests next to the existing `domain/tests` in the repo's `run…Tests` style covering 1024 / 1180 / 1366 / 1440 / 1920 for each state.
- `hooks/useHomeDesktopLayout.ts`: `BASE_WIDTH`/`ORDER_OVERLAY_WIDTH`/`OVERLAY_WIDTH` become size-class aware (`tablet`: rail 420 for the order list, 560 when a plan is open; confirm on the device, these are starting values). Enforce the two-of-three rule in `toggleMap` / `openPlan`.
- `layout/HomeDesktopLayout.tsx`: no structural change; grid template still comes from the hook.
- `views/HomeDesktopView.tsx`: `SAFE_GUTTER` map insets 24 → 16 on tablet; plan toggle / `MapToggleTab` hit area ≥ 44px wide on coarse pointer.
- Map overlays (`order/components/OrderMapOverlay.tsx`, `shared/map/components/MapMultiSelectOverlay.tsx` `w-72`, `zone/components/ZoneMapOverlay.tsx` `w-52`, `order/components/overlays/OrderMarkerGroupOverlay.tsx` `w-[320px]`, `plan/routeGroup/.../RouteGroupMarkerGroupOverlay.tsx` `w-[300px]`): widths become `w-[min(Npx, calc(100% - 2rem))]`.
- `shared/map/infrastructure/core/MapInstanceManager.ts`: set `gestureHandling: 'greedy'` (the map is inside a non-scrolling app shell; one-finger pan is expected).
- `features/plan/calendar/components/PlanCalendarBody.tsx`: give the 7-day grid a min cell width (`minmax(44px, 1fr)`) and `overflow-x-auto` as a fallback so a narrow column scrolls instead of collapsing.
- `features/plan/routeGroup/components/routeGroupRail/RouteGroupRail.tsx` `md:w-[100px]`: keep; the rail content width follows the new 560.

**Acceptance:** device rows A1–A5, B10. Desktop E1 (1440, 1920 identical). Domain tests pass. Record chosen widths in `08`.

---

## Phase 1b — Content priority evaluation (product decision, no code) — **scheduled after Phase 5**

**Timing (user decision 2026-10-24):** the user fills `09_CONTENT_PRIORITY.md` once the app is comfortable to use on the iPad, i.e. after Phases 0–5 land, and before the bridge project. Phase 3 therefore ships the token sizes only; the tablet content variants are implemented in a follow-up **Phase 6b** driven by the marked table.

**Goal:** decide, surface by surface, which information must stay visible on a tablet, which collapses behind a tap, and which hides, so that the crucial information can grow in Phase 3 instead of everything shrinking together. Added 2026-10-24 at the user's request.

- Input: `09_CONTENT_PRIORITY.md` lists every visible element of the key surfaces (order card, plan card, calendar chip, route stop card, route-group header/rail/action bar, order details, home header, notification row, map overlays, customer details) with its data source and current size.
- The **user marks each row** `Keep` / `Collapse` (available behind a tap: InfoHover, ActionSheet, expandable row) / `Hide` (not rendered on tablet). Rule of thumb: an operator at a counter needs identity (who/where/when), status, and the next action; counts, secondary metadata and provenance chips are candidates to collapse.
- Output: the marked table becomes the spec for **tablet content variants**: a component reads `sizeClass` from `useViewport()` and renders its `tablet` variant; data is never removed from stores, only from the render. Shared pills/badges get the variant once.
- Implementation lands in **Phase 6b** (cards, chips, rows, headers, overlays) once the table is marked. Nothing in Phases 0–5 depends on it.

**Acceptance:** every row in `09` has a decision; disputed rows are listed in `08` as open questions.

## Phase 2 — Touch parity, tap targets, drag tuning (1–2 sessions)

**Goal:** every action reachable by tap; primary controls ≥ 44px on coarse pointers; drags start on purpose and land where the finger is.

**Hover-only → tap** (`03` §3): `plan/routeGroup/components/cards/RouteGroupOrderGroupCard.tsx` warning popover (toggle on tap when `!hasHover`); `order/components/OrderMissingInfoNotifier.tsx` (tap shows popover first, second tap opens form; fix the copy "Click"); `DeliveryWindowCalendarCalendar.tsx` day popover (tap toggles); `plan/routeGroup/flows/routeGroupMap.flow.ts` driver-live marker `onClick` opens the preview; `order/flows/orderDriverLiveMap.flow.ts` tap = preview, second tap = navigate; `PlanCard.tsx` and `ItemTypeCountsPill.tsx` replace their private `matchMedia` with `useViewport()`. `map.css` `:hover` scale rules wrapped in `@media (hover: hover)`.

**Tap targets:** `shared/buttons/Button.constants.ts` + `BasicButton`: when `isCoarsePointer`, bump vertical padding so text variants reach ≥ 40px and icon variants ≥ 44px (one place fixes 218 buttons; verify no layout breaks in headers). Apply `.touch-hit-area` to: selection checkbox (`DraggableOrderCard.tsx`), group-overlay closes, map overlay closes, `MapDrawingSideControls` erase, `PlanCalendarHeader` chevrons, `CostumerPanelDetailsMenuAction`, `TeamNameEditorRow`, `SortableClientFormRow` handle, `OrderDetailHeader` Close, `InfoHover` trigger, `SlideCarouselDots`, `MessageCard` close (package). Fix `OrderDetailHeader` `text-[0.66rem]` Close.

**Drag and drop:** add `.dnd-touch-source` to `ItemStatesPage` cards and `SortableClientFormRow`; `ItemStateCard.tsx` Edit stops `mousedown` + `touchstart` like `ThreeDotMenu`; in `HomeRouteOperationsManagersProvider.tsx` soften `autoScroll` on coarse pointer (thresholds y 12%, acceleration 6); in `RouteOperationsDragOverlay.tsx` offset the overlay up/left on touch (`@dnd-kit/modifiers` `snapCenterToCursor` variant or a custom translate) so the finger does not hide the target; `UnscheduleDropTarget` min size 44px tall; calendar `useCalendarDayDragOverlay.controller.ts` leave-delay 220 → 600ms on touch and open the multi-plan overlay on drop-hover of ≥ 300ms.

**Scroll:** `shared/hooks/useScrollHideActionBar.ts` disable the padding animation (or the whole hook) when `isCoarsePointer`; `useSnapScroll.ts` fallback to a scroll-idle timer when `onscrollend` is not in `window`.

**Acceptance:** rows B1–B9, B14, B15. `grep -rn "group-hover" src` has no visibility-gating use; `grep -rn "matchMedia" src/features` returns nothing. Desktop E1–E3.

---

## Phase 3 — Typography and density tokens (1 session + codemod)

**Goal:** text never below 12px and icons never below 14px on coarse pointers, with zero visual change on desktop.

**Note:** content variants (`09_CONTENT_PRIORITY.md`) come later in Phase 6b; this phase only introduces the tokens and raises them on coarse pointers.

**Approach (why tokens, not a global zoom):** three sizing layers are fixed by three different tools. Layout tracks are JS constants → Phase 1 changes the numbers per size class. Controls are shared components → Phase 2 changes `BasicButton`/hit areas once, on coarse pointer. Text and icons are hundreds of literal classes (`text-[10px]`, `h-3`) → Phase 3 replaces the literals with named tokens whose value stays identical on desktop and is raised under `(pointer: coarse)`. A root `font-size` bump (e.g. 16→17px) was considered and rejected as the main tool: it scales every rem-based width as well (panels, `w-72`), leaves `px` literals untouched, and a +6% bump does not lift 10px text to a readable 12px. It may still be used as a final, small, device-tuned adjustment after the tokens land. Values are tuned on the real iPad using the dev-only `?viewport=tablet&pointer=coarse` override (Phase 0) and recorded in `08`.

- `index.css` `@theme`: add `--text-micro: 0.625rem` (10px), `--text-nano: 0.5625rem` (9px), `--text-2xs: 0.6875rem` (11px) with matching line-heights; under `@media (pointer: coarse)` raise them to 12/12/12px (or 12/11/13 after device review) and raise `--text-xs` from 0.75rem to 0.8125rem.
- Codemod (`scripts/typography-tokens-codemod.mjs`, same style as `theme-codemod.mjs`, with `--check`): `text-[10px]`→`text-micro`, `text-[11px]`→`text-2xs`, `text-[9px]`/`text-[8px]`→`text-nano`, rem literals `0.54–0.68rem`→nearest token, `0.7–0.72rem`→`text-2xs`. Exclude `features/templates/printDocument` (PDF drawing), `features/messaging/emailMessage` (email HTML), `shared/map`. Remove the 9 no-op `text-md` uses (→ `text-sm` or `text-base`, check each). Add the check to `theme:regression`.
- Icons: `h-2`/`h-2.5`/`h-3` icon pairs inside interactive elements → `h-3.5`/`h-4` on coarse pointer via a `size` prop or `touch:` utilities; leave decorative ones.
- Fixed heights: `OrderDetailSummary/NotesTab/EventHistory/TimeWindows` `h-[420px]` → `h-[min(420px, 55dvh)]`; `DeliveryWindowCalendarShell.flow.ts` `h-[370px]` likewise; `AdminNotificationsTrigger` `max-h-[420px]` → `max-h-[min(420px, 70dvh)]`.

**Acceptance:** rows A1–A7 re-run (readability), E1–E3. Codemod `--check` green. No `text-[Npx]` literals remain outside excluded folders.

---

## Phase 4 — Popups, forms and settings at tablet height (1 session)

- `OrderFormShell.tsx` `w-[950px]` → `w-[min(950px, calc(100vw - 2rem))]`, inner `OrderFormDesktop.layout.tsx` 560 column → `minmax(0, 560px)`; heights `min(92vh, 900)` → `min(92dvh, 900px)`; footer `.safe-bottom` when `isStandalone`.
- `shared/popups/MainPopup/layoutVariants/ClassicLayout.tsx`: on `tablet` wrap in `p-4`, `max-h-[calc(100dvh-2rem)]`, `min-w-[min(500px, 100%)]`; `PopupBody.tsx` fix `const { isMobile } = useMobile()`; `PopupFooter.tsx` safe-area bottom inset.
- `FeaturePopupShell.tsx`: sizes already `min()`; on `tablet` prefer `variant='fullscreen'` for `lg`/`full` popups (decide per popup; 11 users).
- `features/settings/views/SettingsDesktopView.tsx`: sidebar `w-72` → `w-60` on tablet, nav rows ≥ 44px on coarse pointer; "Log out" `.safe-bottom`.
- `RouteGroupStatsOverlayShell.tsx`, `RouteGroupReadyFooter.tsx`, `OrderLinkedDeviceLiveWidget.tsx`, order list pager: `.safe-bottom` when `isStandalone`.

**Acceptance:** rows A6–A8, D1, C2. E1–E3.

---

## Phase 5 — Installable admin PWA and standalone behaviour (1 session)

Follow `04_PWA_AND_PLATFORM.md` §3–5: `public/admin.webmanifest` + icons in `public/pwa/admin/`; `app/pwa/domain/adminPwa.ts` with `ADMIN_MANIFEST_CONTRACT` and head tags; `resolvePwaHeadState` picks form vs admin by pathname (extend `domain/tests/externalFormPwa.test.ts`); extend `scripts/check-external-form-pwa.mjs` (or add `check-admin-pwa.mjs` and wire into `package.json`) to assert the admin manifest and still forbid a caching SW; rename `ExternalFormPwaProvider` → `PwaProvider` only with the user's agreement. History integration for tablet layers: reuse `useBackLayerRegistration` from `shared/overlays/bottomSheet` for popups and section stack on `isStandalone && isTablet` so the iPad edge-swipe closes the top layer (`04` §5). Status bar style `default` first.

**Acceptance:** rows C1–C6, D2, D3. `npm run check:external-form-pwa` green. Form install still contained (C5).

---

## Phase 6 — Printing from the iPad (1 session, then client decision)

Per `05_PRINTING_AND_BLUETOOTH.md` §4: `features/templates/printDocument/controllers/deliverPdf.controller.ts` chooses Web Share (files) → in-app viewer → download; `downloadByEvent.flow.ts` and `PrintTemplatePreview.tsx` route through it; a small viewer popup (`FeaturePopupShell` `lg`) with the blob in an `<iframe>` and Share/Print buttons. Desktop unchanged (download). Then, per `05` §6: capability detection (`hasWebBluetooth`, `hasNativeBridge`) in `app/`, transport layer in `features/templates/printDocument/transports/`, and printer-language renderers (ZPL/ESC-POS/TSPL) for the client's model once known. The **NextMark Bridge** native app (WKWebView + WebBLE polyfill + `nextmarkBridge` for MFi/TCP) is **deferred until the whole iPad refactor is done** (user decision 2026-10-24, D6): it will serve several of the user's PWAs and deserves its own exploration. Phase 6 therefore ships only the share/AirPrint transport and leaves the transport port ready for `webBluetooth` / `nativeBridge` implementations.

**Acceptance:** rows C7, C8 on the device with the client's printer or any AirPrint printer. E2.

---

## Phase 7 — Optional / later

- Map touch drawing: `DrawingManagerService.ts` circle/rectangle via Pointer Events on the map div (not Google `mousemove`), polygon **Finish** button, larger vertex handles; or disable drawing tools on coarse pointer and keep multi-select via tap-to-toggle markers.
- AI panel touch (when re-enabled): `packages/ai-panel` header visible on `!hasHover`, drag with `touch-action: none` + `pointercancel`.
- Split-mode timeline (`PlanDesktopTimeline` placeholder) as the map-friendly layout on 12.9" iPads.
- Remove unused deps `react-calendar-timeline`, `react-day-picker`, `rechart` (typo package) after confirming no import.

---

## Sequencing and effort

| Phase | Sessions | Depends on | Device time |
|---|---|---|---|
| 0 Foundations + 2 bugs | 1 | — | 20 min |
| 0c Lint + legacy-test baseline | 1 (cheap model) | 0 | — |
| 1 Home geometry | 1–2 | 0 | 45 min |
| 1b Content priority decisions (user) + 6b content variants (code) | user + 1–2 sessions | 0–5 done | 30 min |
| 2 Touch parity | 1–2 | 0 | 45 min |
| 3 Typography tokens | 1 | 0 | 20 min |
| 4 Popups/forms/settings | 1 | 0, 3 | 30 min |
| 5 Admin PWA | 1 | 0 | 30 min (needs HTTPS deploy) |
| 6 Printing | 1 | 5 (standalone test) | 20 min + printer |
| 7 Optional | — | 1, 2 | — |
| Bridge app (native, separate repo) | later | all phases done | — |

**Parallel run (revised 2026-10-24 after measuring file overlap):** Phases **0c, 1 and 2** run in parallel on `ipad/phase-0c-baseline`, `ipad/phase-1-geometry`, `ipad/phase-2-touch`, all branched from `ipad/phase-0-foundations`. Overlap is small: 1 and 2 share 4 files (`OrderMarkerGroupOverlay`, `MapMultiSelectOverlay`, `ZoneMapOverlay`, `HomeDesktopView`); 0c shares 3 with them (`MapInstanceManager` with 11 lint errors, `RouteGroupOrderGroupCard`, `DeliveryWindowCalendarCalendar`). **Phase 3 runs after they merge**, not in parallel: its codemod rewrites 115 files, 10 of them in Phase 1/2 lists, and must also catch literals Phases 1/2 add. Writing the codemod script early is fine; applying it happens on top of the merged result.

**Merge order:** 0 → 0c → 1 → 2 (rebase on 1, resolve the 4 shared files) → 3 → 4 → 5. Each branch merges only after its device rows pass.

**Parallel sessions need separate working trees.** Two agents in one checkout overwrite each other's files. Use `git worktree add` per phase branch, each with its own `npm ci` in `admin-app` (≈400 MB each). Branch naming: `ipad/phase-N-<slug>`; commits only when the user asks (K1).

## Session protocol (every implementing session)

1. Read `README.md` in this folder, `00`, this file's phase section, and only the inventory sections the phase cites.
2. Re-grep every symbol before editing (line numbers drift).
3. Keep the file list of the phase; anything outside goes to `08_SESSION_LOG.md` "left for next session".
4. Run the gates; run the named device rows with the user; log results in `08`.
5. Update this plan's phase status line and `README.md` status table.
