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
| 3 Typography and density tokens | branch `ipad/phase-3-typography` open (from stack tip), runs parallel with 5 | |
| 4 Popups, forms, settings at tablet height | waits for Phase 3 tip | |
| 5 Installable admin PWA | branch `ipad/phase-5-pwa` open (from stack tip), runs parallel with 3 | |
| 6 Printing from the iPad | not started | |
| 7 Optional (map drawing, AI panel, timeline) | not started | |

## The problem in one paragraph

iPads in landscape report 1024–1376 CSS px, so the app's single breakpoint (`< 1000px` = phone) sends them to the desktop layout. That layout is a grid of fixed JS widths (map `1fr` | plan 450 | rail 450/550, plus a 320 map rail in calendar view) that sum to 1320px, so at 1024 the map is 24–124px and the calendar 154–254px. On top of that the device is coarse-pointer with no hover: Tailwind v4 makes all 242 `hover:` utilities inert, a few controls are only revealed on hover, controls are 28–32px, text runs 9–11px in 150+ places, the BottomSheet used by every three-dot menu blocks its own scrolling, the desktop shell has no safe-area or touch CSS, and the admin app has no manifest so it cannot install standalone. Web Bluetooth does not exist on iPadOS, so label printing must go through AirPrint/share sheet or a backend relay.

## Conventions

- Paths in these docs are relative to `Front_end/admin-app/src` unless prefixed (`AA/` = `admin-app/src`, `PK/` = `packages`). Line numbers are from 2026-10-24; re-grep.
- Architecture rules: `Front_end/AGENTS.md` (summarised in `01` §0) and `Front_end/CLAUDE.md`. Layer order `packages → app → features/api → actions → flows → controllers → pages/components`; features import each other only via barrels.
- Related earlier work: `docs/under_development/ADMIN_APP_MOBILE_SHELL_PLAN_2026-10-07.md` (phone shell, `< 1000px`) — the iPad work builds beside it, not on top of it.
