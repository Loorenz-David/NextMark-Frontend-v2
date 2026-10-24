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
