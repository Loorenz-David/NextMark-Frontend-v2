# 07 — Device test matrix (manual, on the iPad in hand)

Run after every phase. Copy the table into `08_SESSION_LOG.md` under the session entry with results (✅ / ❌ + note). Record the device model, iPadOS version, orientation, and whether a trackpad was attached.

## Setup

- Dev: `npm run dev` in `Front_end/admin-app` (binds `host: true`). The user reaches it from the iPad through **VS Code port forwarding (GitHub dev tunnel, HTTPS)**; LAN `http://<mac-lan-ip>:5173` also works. If Vite blocks the tunnel host, add it to `server.allowedHosts`.
- Installed-app checks (section C) need an HTTPS origin: the dev tunnel qualifies, but the tunnel URL changes per session and the dev-tunnel sign-in cookie may not carry into the installed app; prefer the deployed staging URL when available.
- Inspector: iPad Settings → Safari → Advanced → Web Inspector; Mac Safari → Develop → <iPad>.
- Desktop regression: Chrome on the Mac at 1440 and 1920 wide, both themes.
- Simulated iPad widths in Chrome devtools (1024×768, 1180×820, 1366×1024) are good for geometry, useless for touch. Touch checks are device-only.

## A. Shell and geometry (landscape, no keyboard)

| # | Check | 1024 (10.2") | 1180 (Air) | 1366 (12.9") |
|---|---|---|---|---|
| A1 | Home loads with header, order rail, plan panel, map; nothing clipped; map ≥ 1/3 of width or deliberately folded | | | |
| A2 | Open a plan (base panel) → rail widens; map still usable or folded by design | | | |
| A3 | Open order details (section stack) on top of an open plan; the stack is readable and closable | | | |
| A4 | Open a route-group page; stop list, rail avatars, action bar all visible | | | |
| A5 | Plan list in calendar view: readable, no horizontal clipping | | | |
| A6 | Settings: sidebar + content readable; tables don't overflow | | | |
| A7 | Order form, customer form, route-group edit form popups fit the height; footer reachable | | | |
| A8 | Notifications popover opens inside the viewport | | | |
| A9 | Both themes: no unreadable contrast introduced | | | |

## B. Touch (finger, no trackpad)

| # | Check | Result |
|---|---|---|
| B1 | Fast swipe on the order list scrolls; nothing is picked up | |
| B2 | Press-and-hold an order card ≈ 0.3 s → card lifts, list does not scroll, no text-selection magnifier | |
| B3 | Drag the lifted card onto a plan and drop; assignment happens; same with multi-select batch drag | |
| B4 | Reorder stops in a route group by touch | |
| B5 | Settings sortables (item states, client form rules, media placement) reorder by touch | |
| B6 | Every three-dot menu opens on tap and its items are tappable | |
| B7 | OrderCard quick actions reachable without hover | |
| B8 | Route-group rail avatar stats, stop/solution warnings, InfoHover tooltips open on tap and close on tap-outside | |
| B9 | Notification dismiss reachable | |
| B10 | Map: one-finger pan, two-finger zoom, marker tap opens the expected panel, no accidental drawing | |
| B11 | No double-tap zoom on buttons/tabs; no grey tap flash | |
| B12 | Scroll inside a popup does not scroll the page behind it; no rubber-band at the document edges | |
| B13 | Focusing an input does not zoom the page | |
| B14 | Long-press on non-draggable text does not pop the system callout in shell chrome | |
| B15 | Resizable/draggable panels (plan panel drag, split view) can be adjusted by touch | |
| B16 | Hold a card still ~0.25 s → it squeezes while held, then the preview lifts and follows the finger (order list, route stop, settings sortable) | |
| B17 | Press a card, pause briefly, then move slowly → drag starts without waiting for the full hold | |
| B18 | Quick swipe starting on cards (order list, route stops, settings lists) → the list scrolls; no drag, no squeeze flash | |
| B19 | Reorder route stops up and down by hold and by press-pause-move; drop on nothing → nothing changes | |
| B20 | Long press on a draggable never shows the iOS callout or selects text | |

## C. Installed app (standalone)

| # | Check | Result |
|---|---|---|
| C1 | Add to Home Screen from `/` shows the admin name/icon; launches full screen into `/` or `/auth/login` | |
| C2 | Status bar/notch area and home indicator do not cover controls | |
| C3 | Session survives relaunch; logging in inside the installed app keeps you logged in | |
| C4 | Swipe-from-left-edge (history back) closes the top layer instead of leaving the app or doing nothing surprising | |
| C5 | External form installed app still works and stays contained to `/external-form` | |
| C6 | Web push permission prompt can be triggered and a push arrives | |
| C7 | Print item labels → share sheet appears with Print/AirPrint; PDF page size equals label size | |
| C8 | Print route sheet → share sheet / in-app viewer | |
| C9 | Installed app: deploy a new build, reopen from the home screen → new build runs, no prompt (build stamp / `__NEXTMARK_BUILD_INFO__`) | |
| C10 | Same with the order form open and edited → no reload until saved or closed; reloads on the next reopen | |
| C11 | C9 on iPhone home-screen app and Mac Safari Dock web app | |
| C12 | Long-open old session after a deploy: a screen never opened before still loads (old chunk kept) or reloads once | |

## D. Keyboard and dynamic size

| # | Check | Result |
|---|---|---|
| D1 | Software keyboard up in the order form: focused field visible, footer not lost | |
| D2 | Split View 50/50 → phone shell appears, nothing crashes; back to full → desktop layout restored | |
| D3 | Rotate to portrait and back: layout re-measures (map resizes) | |
| D4 | Trackpad attached: hover affordances return; tap fallbacks still work | |

## E. Desktop regression (Mac, 1440 and 1920)

| # | Check | Result |
|---|---|---|
| E1 | Home layout pixel-identical to `main` before the phase | |
| E2 | Popups, sections, settings unchanged | |
| E3 | Gates: `npm run build`, `lint`, `check:popup-contract`, `theme:regression`, `check:external-form-pwa` | |
