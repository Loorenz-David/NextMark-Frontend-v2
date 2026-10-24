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
