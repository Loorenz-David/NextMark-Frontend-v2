# Plans panel — month calendar spec

Replaces the vertical list of route-plan cards with a month calendar. The map column shrinks; the calendar takes the freed space.

## Shell / layout

- App body font: `Inter Tight` (fallbacks `-apple-system, Helvetica, sans-serif`); numeric/label accents in `IBM Plex Mono`.
- Page background `#eceded`. Three-column grid filling the viewport below the top bar:
  `grid-template-columns: 320px minmax(0, 1fr) 380px; grid-template-rows: minmax(0, 1fr); overflow: hidden;`
  - left = map (320px), center = Plans calendar, right = Orders rail (380px).
- Every column needs `min-height: 0` + `overflow: hidden`, otherwise the calendar's min-content pushes the row taller than the viewport.
- Column separators: `1px solid #e4e6e6`. Panel surfaces `#fff`; the calendar work area sits on `#f4f5f5`.

## Plans header (center column, `flex: none`)

- White, `border-bottom: 1px solid #e4e6e6`, padding `12px 20px`, single flex row, `gap: 14px`.
- Icon tile: 42×42, `border-radius: 12px`, background `#f1f2f2`.
- Title `Plans` — 21px / 700 / `#1b1e1e` / `letter-spacing: -0.02em`.
- Subtitle — 13px `#8a8f8f`: `{n} plans · {n} orders · {n} items` (aggregated over the visible month).
- Spacer, then right-aligned controls:
  1. **Month stepper** — pill `1px solid #e4e6e6`, `border-radius: 999px`, padding `5px 6px`; `←` / `→` are 28px circles (hover `background: #f1f2f2`); label 14px/600, `min-width: 84px`, centered ("July 2026").
  2. **View toggle** — segmented control on `#f1f2f2`, `border-radius: 999px`, 3px padding; active segment white pill, 12.5px/600 `#1b1e1e`, `box-shadow: 0 1px 2px rgba(20,24,24,0.08)`; inactive 12.5px/500 `#8a8f8f`. Segments: Month | Week.
  3. **+ Plan** — black pill `#1b1e1e`, white 13.5px/500 text, padding `9px 16px`, `border-radius: 999px`.

## Calendar body

- Container padding `14px 16px 16px`, `display: flex; flex-direction: column; min-height: 0`.
- Weekday header: `grid-template-columns: repeat(7, minmax(0,1fr)); gap: 8px`, labels IBM Plex Mono 11px, uppercase, `letter-spacing: 0.08em`, `#9a9f9f`, centered. Week starts Monday (configurable).
- Day grid: same 7 columns, `grid-auto-rows: minmax(0, 1fr); gap: 8px; flex: 1; min-height: 0` — 35 cells (5 rows), rows divide the available height, cells never grow the panel.

### Day cell

- `border-radius: 14px`, `border: 1px solid #e9eaea`, `background: #fff`, `box-shadow: 0 1px 2px rgba(20,24,24,0.04)`, padding 8px, `box-sizing: border-box; overflow: hidden`, flex column `gap: 6px`, `cursor: pointer`, hover `border-color: #cfd2d2`.
- Out-of-month days: background `#f0f1f1`, no shadow, date number `#b6baba`.
- Today: `border-color: #1b1e1e`, date number white on a `#1b1e1e` 22×22 rounded square (`border-radius: 7px`).
- Header row of the cell: date number (IBM Plex Mono 13px/500, 22×22, `border-radius: 7px`), spacer, and — if the day has unscheduled orders — an amber badge: 10.5px/600 `#7a5c05` on `#fdf4d8`, `border-radius: 999px`, padding `3px 7px`, text `"{n} new"`.
- Empty in-month day: dashed placeholder filling the cell — `border: 1px dashed #dfe1e1; border-radius: 10px; min-height: 26px`, centered `+` `#b6baba`; hover `border-color: #1b1e1e; color: #1b1e1e` (click = create plan for that date).

### Plan chip (one per plan in the day)

- `border-radius: 10px`, padding `7px 8px`, flex column `gap: 5px`; background/border tinted by plan status:
  - Open — bg `#fdf4d8`, border `#f4e3ae`, dot `#e5a908`
  - Completed — bg `#eaf6ef`, border `#cfe9da`, dot `#22a45d`
  - Confirmed — bg `#f0f1f1`, border `#e2e4e4`, dot `#9aa0a0`
- Line 1: 6px status dot + `"{n} orders"` (12px/600 `#1b1e1e`, ellipsised) + zone count as compact `"1z"` (10.5px `#8a8f8f`).
- Line 2 — load bar: 4px track `rgba(20,24,24,0.08)`, `border-radius: 999px`, fill in the status dot color at `min(100%, planVolumeCm3 / sumAssignedRouteVehicleCapacityCm3)`; trailing volume label IBM Plex Mono 10px `#6d7272` (`"4.3 m³"`). Each route assignment contributes its assigned vehicle's volume capacity; the bar remains empty when an assignment or capacity is unavailable.
- Line 3: 10.5px `#6d7272`, `line-height: 1.35`, **wrapping** (no nowrap/ellipsis): `"{items} items · {weight} kg"`.

## Interactions expected

- Click a day cell → select the day; map (left) shows that day's route.
- Click a plan chip → open the plan.
- Click `+` on an empty day → create plan for that date.
- Drag an order from the right rail onto a day → schedule it (rail shows the hint `drag onto a day to schedule`, IBM Plex Mono 10.5px uppercase `#9a9f9f`).
- Month stepper changes the visible month; Week toggle swaps to a week view (not yet designed).

## Orders rail (right, for reference)

- `flex: none` on each order card inside the scrolling column (`overflow-y: auto`), otherwise cards compress and their footers clip.
- Card: white, `border: 1px solid #ededed`, `border-radius: 14px`, padding `12px`.
  Row 1: `#id` 16px/700, 20px chevron circle (`border: 1px solid #dbe6f2`, `#7ba4d3`), optional source pill (`SHOPIFY`: 9.5px, uppercase, `letter-spacing: 0.1em`, `#6d7272`, 1px `#e4e6e6` pill), spacer, status pill (11.5px/500, white bg, 1px status-colored border, `border-radius: 8px`), `⋮` button.
  Row 2: address 13px — `#6d7272`, or `#9a9f9f` when "No address".
  Items: first 2 rows, each a 52px thumbnail (`border-radius: 10px`, 1px border; empty state = white tile with a camera glyph `#b6baba`) + item name 14px `#2c3030`; then `"+ {n} more item(s)"` 13px `#8a8f8f`, indented 64px.
  Missing-info footer: full-bleed strip `background: #fdf3e7`, `border-top: 1px solid #f7e4cd`, padding `10px 12px` — 18px `#fbcf5a` circle with `!`, text 13px `#b8752a` "Customer info missing", right-aligned underlined `Add`.
