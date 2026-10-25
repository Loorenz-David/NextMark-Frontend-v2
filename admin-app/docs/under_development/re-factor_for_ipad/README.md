# Re-factor for iPad — context vault

Everything a session (Claude or Codex) needs to make `Front_end/admin-app` fully usable on iPads in landscape, without re-reading the codebase. Built 2026-10-24 from a read-only analysis; no source changed yet.

**Read order for a new session:** this file → `00` → the phase you are implementing in `06` → only the inventory sections that phase cites. Do not load `01`–`03` whole unless you are re-planning; they are reference maps, 10–60 KB each.

| File | What it holds | Load when |
|---|---|---|
| `00_GOAL_AND_CONSTRAINTS.md` | Target devices and widths, iPad input facts, hard acceptance gates, non-goals | always |
| `01_APP_GRAPH_MAP.md` | Entry/bootstrap, router, provider tree, feature catalogue, shared infra, realtime, home composition, order→plan→route data flow, printing, scripts, tests, driver-app reference | you need to find where something lives |
| `02_HOME_SHELL_GEOMETRY.md` | Breakpoints, home grid math with width tables per iPad, fixed sizes by surface, popups, typography/density scale, safe areas, settings, theme hooks, 12 worst geometry problems | Phases 1, 3, 4 |
| `03_TOUCH_INTERACTION_INVENTORY.md` | DnD contexts/sensors/targets, long press, hover-only affordances, scroll traps, tap targets, keyboard-only paths, map gestures, 15 ranked pain points | Phases 0, 2, 7 |
| `04_PWA_AND_PLATFORM.md` | Existing external-form PWA, guard script, admin manifest design, SW decision, standalone behaviours, how to verify on the iPad | Phase 5 (and `.safe-*` work in 0/4) |
| `05_PRINTING_AND_BLUETOOTH.md` | What prints today, iPad constraints (no Web Bluetooth, blob download broken in standalone), options ranked, recommendation, sources | Phase 6 |
| `09_CONTENT_PRIORITY.md` | Element-by-element inventory of the key surfaces with the user's Keep / Collapse / Hide decision per row; spec for tablet content variants | Phase 1b (decide), Phases 3–4 (implement) |
| `10_AUTO_UPDATE.md` | Silent auto-update for installed apps: why Apple devices go stale, version check + safe reload, S3/CloudFront cache headers (Phase 5b) |
| `11_TOUCH_DRAG_INTENT.md` | Touch drag: why drags failed (logged evidence), hold-with-cue + press-pause-move design, custom dnd-kit sensor spec (Phase 2b) |
| `12_ORDER_CARD_REDESIGN.md` | Order card redesign: target screenshot, decisions, components in scope, layout spec, preview rule (Restyle R1) |
| `13_ORDER_PANEL_HEADER.md` | Order search to the top header via a header slot, actions to a compact panel header, phone row scrolls with the list (Restyle R2) |
| `06_PLAN.md` | Architecture decision (size class + input class), Phases 0–7 with file lists and acceptance, sequencing, session protocol | always (your phase) |
| `07_DEVICE_TEST_MATRIX.md` | Manual checks A–E to run on the iPad and on desktop after each phase | end of every phase |
| `08_SESSION_LOG.md` | Decision register, open client questions, append-only session entries | start and end of every session |

## Status

| Phase | Status | Session |
|---|---|---|
| 0 Foundations + BottomSheet scroll trap + hover-reveal bug | committed on `ipad/phase-0-foundations`; device check pending; lint baseline moved to Phase 0c | Session 1 |
| 0c Lint + legacy-test baseline cleanup | committed on `ipad/phase-0c-baseline`; lint 0 errors, tests 97/97, all gates green | 2026-10-24 Codex |
| 1 Home geometry for tablets | committed on `ipad/phase-1-geometry` (stacked on 0c); Chrome geometry + iPad rows pending | 2026-10-24 Codex + Claude review |
| 1b Content priority decisions (user, after Phase 5) → 6b tablet content variants | inventory done; decisions deferred until the iPad is usable | |
| 2 Touch parity, tap targets, drag tuning | committed on `ipad/phase-2-touch` (stacked on 1); Chrome + iPad rows pending | 2026-10-24 Codex + Claude review |
| 3 Typography and density tokens | committed on `ipad/phase-3-typography`; A/E visual rows and iPad pending | 2026-10-24 Codex + Claude review |
| 4 Popups, forms, settings at tablet height | committed on `ipad/phase-4-popups` (stacked on 3); A6–A8, D1, C2, E rows pending | 2026-10-24 Claude session + review |
| 5 Installable admin PWA | committed on `ipad/phase-5-pwa` (stacked on 4) + deploy workflow cache headers (user-approved); C/D rows pending | 2026-10-24 Codex + Claude review |
| 5b Silent auto-update (`10_AUTO_UPDATE.md`) | committed on `ipad/phase-5b-auto-update` (stacked on 5); C9–C12 need a deploy or `npm run preview` | 2026-10-24 Claude session + review |
| 2b Touch drag intent (`11_TOUCH_DRAG_INTENT.md`) | committed on `ipad/phase-2b-touch-intent` (stacked on 5b; carries the temporary dev logger); cue on every pointer (D8); B16–B20 pending | 2026-10-24 Codex |
| R1 Order card redesign (`12_ORDER_CARD_REDESIGN.md`) | committed on `ipad/r1-order-cards`, plus D10 (info buttons hidden on phone/iPad); visual rows pending | 2026-10-25 Codex + Claude review |
| R2 Order panel header (`13_ORDER_PANEL_HEADER.md`) | implemented, uncommitted on `ipad/r2-order-panel-header`; automated gates green; desktop/iPad/phone visual and card-count checks pending | 2026-10-25 Codex |
| R3 Panel widths | waits for the user's card-width measurement | |
| 6 Printing from the iPad | not started | |
| 7 Optional (map drawing, AI panel, timeline) | not started | |

## The problem in one paragraph

iPads in landscape report 1024–1376 CSS px, so the app's single breakpoint (`< 1000px` = phone) sends them to the desktop layout. That layout is a grid of fixed JS widths (map `1fr` | plan 450 | rail 450/550, plus a 320 map rail in calendar view) that sum to 1320px, so at 1024 the map is 24–124px and the calendar 154–254px. On top of that the device is coarse-pointer with no hover: Tailwind v4 makes all 242 `hover:` utilities inert, a few controls are only revealed on hover, controls are 28–32px, text runs 9–11px in 150+ places, the BottomSheet used by every three-dot menu blocks its own scrolling, the desktop shell has no safe-area or touch CSS, and the admin app has no manifest so it cannot install standalone. Web Bluetooth does not exist on iPadOS, so label printing must go through AirPrint/share sheet or a backend relay.

## Conventions

- Paths in these docs are relative to `Front_end/admin-app/src` unless prefixed (`AA/` = `admin-app/src`, `PK/` = `packages`). Line numbers are from 2026-10-24; re-grep.
- Architecture rules: `Front_end/AGENTS.md` (summarised in `01` §0) and `Front_end/CLAUDE.md`. Layer order `packages → app → features/api → actions → flows → controllers → pages/components`; features import each other only via barrels.
- Related earlier work: `docs/under_development/ADMIN_APP_MOBILE_SHELL_PLAN_2026-10-07.md` (phone shell, `< 1000px`) — the iPad work builds beside it, not on top of it.
