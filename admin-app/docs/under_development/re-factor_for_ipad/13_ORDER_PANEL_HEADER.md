# 13 — Order panel header: search to the top header, actions to the panel header (restyle R2)

**Created:** 2026-10-25. **Status:** requested and decided by the user 2026-10-25. Branch `ipad/r2-order-panel-header`, stacked on `ipad/r1-order-cards`. Goal: more vertical room for orders in the main order panel. Panel widths stay as they are; they become R3.

Paths relative to `Front_end/admin-app/src`.

---

## 1. Decisions

| Topic | Desktop and iPad (tablet + desktop size classes) | Phone |
|---|---|---|
| Search field, filter button, active filter pills | Move to the **top header** (`HomeDesktopHeader`), **centred horizontally**; the pills sit under the search, inside the header. The user may remove the pills later if they look odd. | Stay where they are, but the whole action row becomes **part of the order list's scroll container** (it scrolls away with the orders). |
| "+ Order" button and the three-dot menu | Move to the **right side of the order panel header** (the `SectionPanel` header with icon, "Orders" and counts). | Stay in the action row next to the search (the phone has no panel header). |
| Panel header icon, "Orders" title, counts, info | **Shrink** (compact header) to make room for the two actions. | — |
| Other workspaces (store pickup, international shipping) | The header centre is **empty**: the search exists only while the main order list (route operations) is mounted. | — |
| Search result location | Unchanged: the search still filters the main order list. The user knows that a header search far from its list is ambiguous; that is a later fix. | — |
| Selection-mode bar (Clear selection / Select all filtered / Exit) | Stays in the order panel, at the top of the list area, as today. | Same, inside the scroll container. |

## 2. Design

### 2.1 Header slot — `shared/layout/headerSlot/` (new, framework-level, no feature imports)

A tiny portal-target mechanism so the order feature can render into the top header without the home header importing order code and without moving search state out of the order feature.

- `HeaderSlotProvider`: holds a `Map<slotName, HTMLElement | null>` in state; context exposes `register(name, el)` and `getTarget(name)`.
- `HeaderSlotTarget({ name, className })`: renders a `div` and registers it (ref callback); unregisters on unmount.
- `HeaderSlotPortal({ name, children })`: `createPortal(children, target)` when the target exists, otherwise renders nothing.
- Slot name constant: `HOME_HEADER_CENTER_SLOT = 'home-header-center'` (exported from the same folder).
- Pure helpers only if needed; keep it under ~60 lines total. Add a vitest (jsdom) test: the portal renders into a registered target, renders nothing without one, and moves when the target re-registers.

### 2.2 Top header — `features/home-app/components/HomeDesktopHeader.tsx` and `features/home-app/pages/HomeAppPage.tsx`

- `HomeAppShell`'s desktop/tablet branch wraps the header **and** the workspace in `HeaderSlotProvider` (the phone branch does not need it).
- `HomeDesktopHeader` becomes three columns: left (theme, acting user) `shrink-0`; centre `<HeaderSlotTarget name={HOME_HEADER_CENTER_SLOT} className="flex min-w-0 flex-1 justify-center" />`; right (notifications, settings) `shrink-0`. The centre content is capped `w-full max-w-[560px]` and must not push the side groups: at 1024 px it has roughly 500 px.
- When the slot is empty the header looks exactly as today.

### 2.3 Order panel — `features/order/components/pageHeaders/OrderMainHeader.tsx`, `features/order/pages/orderMain.page.tsx`

Desktop and iPad (`!isMobile`):
- Render `<HeaderSlotPortal name={HOME_HEADER_CENTER_SLOT}>` with a column: `SearchFilterBar` (unchanged props) and, under it, `ActiveFilterPills` (only when there are pills). Search placeholder and behaviour unchanged.
- `setHeader({ ..., size: 'compact', customHeaderButton: <actions> })` where `<actions>` = the "+ Order" primary button and the three-dot menu (same options as today). Menu trigger: vertical dots with a 44px tap area (`touch-hit-area h-11 w-11`, like the R1 card).
- The in-panel action stack keeps only the selection-mode bar. The scroll-hide behaviour (`useScrollHideActionBar`) keeps working on what remains; with no selection mode the stack is empty and reserves no space.

Phone (`isMobile`):
- Keep today's action row (search + filter, "+ Order", menu, pills, selection bar), moved **inside** the scroll container as the first child of the list content, so it scrolls with the orders. No floating/absolute positioning on phone.

### 2.4 Compact panel header — `shared/section-panel/SectionPanelContext.ts(x)` and `SectionPanel.tsx`

- Add optional `size?: 'default' | 'compact'` to `SectionHeaderConfig`. `default` renders exactly as today (other panels unchanged).
- `compact`: header row `py-2`, icon box `p-2 rounded-lg` (icon `h-5 w-5`, set by the caller), title `text-base`; the order title's counts line stays `text-xs` muted. The right side holds `customHeaderButton` as today.

## 3. Acceptance

- Desktop 1440 and iPad 1024 (coarse): search, filter button and pills are centred in the top header in route operations; empty centre in store pickup and international shipping; typing still filters the main order list; the filter button still opens the filter panel; removing a pill still works.
- Order panel header: compact icon/title/counts, "+ Order" and the menu on the right; "+ Order" opens the create form; the menu's two options work; selection mode bar still appears and works.
- More orders visible than before at the same height (record before/after card counts at 1440×900 and 1024×768 in `08`).
- Phone 390: the action row scrolls away with the list; everything in it still works.
- Other panels using `SectionPanel` look exactly as before.
- Gates green (lint 0 errors, tests incl. the header slot test, build, popup contract, theme regression, PWA checks, `git diff --check`).

## 4. Revisions after the user's review (2026-10-25)

- **Filter pills removed** on every size, header and phone alike. The number of active filters shows only as the count beside the filter icon (as before). `orderFilterLabelFormatter.ts` (`formatOrderFilterPill`) became unused; left in place pending the user's OK to delete.
- **Compact panel header padding** raised from `py-2` to `py-3.5`; the order panel header felt too tight.
- **Header search narrower and shorter:** the header slot content is capped at `max-w-[360px]` (was 560), and `SearchFilterBar` gained an opt-in `size="compact"` (32px, matching the toolbar buttons; on coarse pointers it grows with them). The phone and the other search bars (customer, order case) keep the default size.
- **Header rearranged (user, 2026-10-25):** theme, acting user, notifications and Settings sit together on the left; the slot (renamed `HOME_HEADER_END_SLOT`) is at the right end and reaches the screen edge. The order search takes the order panel's measured width (`shared/hooks/useElementWidth.ts`, ResizeObserver) with the list's 16px inner padding, so it sits directly above the order list (450 desktop / 420 tablet; 360 fallback before the first measurement). This also eases the search-result ambiguity. The notifications popover now opens `bottom-start` since its trigger is on the left.
