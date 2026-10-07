# Admin App — Mobile Shell (phone-usable admin)

**Status:** Under development — Phases 0–4 implemented 2026-10-07, awaiting device review. Phases 5–6 not started.
**Author of plan:** Claude (analysis + scoping)
**Date:** 2026-10-07
**Scope:** `Front_end/admin-app` only. No backend changes. No other app changes. `driver-app` is a pattern reference, never an import source.

---

## 1. Objective

Turn the admin app into a **first-class phone experience**. Today "mobile" is a width check that drops the header and shows the plan list; everything else is either unreachable or a desktop surface squeezed to full width. The target is a dedicated mobile shell with its own navigation model (tabs, page stack, bottom sheets, back-button support), while the desktop app stays untouched.

The side "drawers" (the `SectionPanel` rail on desktop) are the wrong model for a phone. On mobile they become **stacked full-screen pages** with a proper top bar and back navigation, and secondary actions (menus, filters, stats) become **bottom sheets**.

### Non-goals

- Do **not** change the desktop layout, behaviour, or appearance. Desktop is `isMobile === false` and must render identically.
- Do **not** redesign feature pages' content (order cards, plan cards, route group lists). Only their chrome, hover affordances, and spacing change.
- Do **not** build an installable PWA in the core phases (see Phase 6, optional, and §8 Risks: it conflicts with `check:external-form-pwa`).
- Do **not** bring zone drawing or map multi-select to mobile.
- Do **not** touch `packages/`.

### Hard constraints (acceptance gates)

1. **Desktop pixel-identical.** Every change is behind `isMobile` / `desk:` or lives in mobile-only files. If a desktop screen changes, the change is wrong.
2. **Layer rules hold.** Shell chrome lives in `features/home-app`, reusable primitives in `shared/`, viewport state in `app/`. No feature imports another feature's internals (barrels only). `npm run check:popup-contract` and `npm run theme:regression` pass.
3. **One source of truth for viewport state.** After Phase 0, `useMobile()` from `app/` is the only way code learns it is on a phone.

---

## 2. Measured current state

### 2.1 Detection

- `src/app/providers/MobileProvider.tsx` — `isMobile = window.innerWidth < 1000`, updated on `resize`.
- `src/app/contexts/MobileContext.tsx` — `useMobile()` falls back to `{ isMobile: false }` when no provider is mounted.
- `src/shared/resource-manager/ResourceManagerContext.tsx` — carries a second `isMobileObject` / `setIsMobileViewport`. Two owners for the same fact.
- Tailwind `md:` starts at 768px, JS mobile ends at 999px. Screens 768–999px get the mobile shell with desktop `md:` styles. `src/shared/hooks/useScrollHideActionBar.ts` uses a third check, `(min-width: 1000px)`.
- No `(pointer: coarse)` / `(hover: none)` detection in `app/`. `InfoHover`, `PlanCard`, `ItemTypeCountsPill` each detect it locally.

### 2.2 Home on a phone

- `src/features/home-app/pages/HomeAppPage.tsx:39-47` — mobile renders only `ActiveWorkspaceView`, `HomeOverlays`, `OrderLinkedDeviceLiveWidget`. **No header**, so no theme toggle, acting-user switcher, notifications, settings link, or Cases button.
- `src/features/home-route-operations/views/HomeMobileView.tsx` — renders `RoutePlanPage` (plan list) as the only root. Tapping a plan slides `PlanWorkspacePanel` in at full width (`framer-motion`, `x: window.innerWidth` read during render, so not resize-safe). `SectionManagerHost` stacks sections at `window.innerWidth`.
- **Unreachable on mobile:** order list (`OrderPage` is mounted only by `HomeDesktopView`), map, calendar, notifications, settings, acting user, Cases, workspace switching (which has no UI anywhere; `HOME_WORKSPACE_OPTIONS` is unused).
- `HomeRouteOperationsPage.tsx:56-81` registers a "Cases" header action via `setHeaderActions`, but nothing renders `headerActions`.

### 2.3 Sections (the "drawers")

- `src/shared/stack-manager/StackActionManager.tsx:262-320` — `renderStack({ variant: 'dynamicSectionPanels', width })` slides each entry in from the right; `w-full md:w-[400px]` unless `width` is given. Already full-width on mobile, which is the right basis for a page stack.
- `src/shared/section-panel/SectionPanel.tsx` — glass panel with an optional header (icon, title, "Close" text button). Not a mobile top bar: no back affordance, no safe-area, no title truncation.
- Section components (`order.main`, `order.details`, `orderCase.*`, `costumer.details`, `RoutePlanPage`, `RouteGroupsPage`) have **no** `isMobile` branches. `RouteGroups.page.tsx` is the only responsive layout (`md:` stacking, horizontal rail).
- Singleton dedupe + stale-entry diagnostics live in `src/features/home-route-operations/components/SectionManagerHost.tsx`.

### 2.4 Popups

- `src/shared/popups/featurePopup/FeaturePopupShell.tsx:39-53` — full screen on mobile, slide-in from right. Good basis. Header/footer have no mobile branch and no safe-area.
- `src/shared/popups/MainPopup/layoutVariants/ClassicLayout.tsx` (settings popups) — full screen on mobile. **Bug:** `src/shared/popups/MainPopup/PopupBody.tsx` does `const isMobile = useMobile()` (object, always truthy).
- Custom shells with real mobile layouts already exist: `OrderFormShell` + `OrderFormMobile.layout.tsx`, `CostumerFormShell` + `CostumerFormMobile.layout.tsx`, `RouteGroupEditFormShell` + `RouteGroupEditFormMobile.layout.tsx`. Pattern: one scrolling column, non-sticky header, `fixed bottom-0` footer, no safe-area padding.

### 2.5 Touch, hover, keyboard

- **DnD is touch-capable.** `src/features/plan/hooks/usePlanOrderDndController.tsx` uses `MouseSensor {distance: 6}` + `TouchSensor {delay: 250, tolerance: 8}`; `.dnd-touch-source` (`index.css` ~689) is applied to draggable cards. But on a phone the drag source (order list) and target (plan list) are never on screen together.
- Settings sortables (`ItemStatesPage.tsx`, `ClientFormMediaPlacementGroup.tsx`, `ClientFormRulesPage.tsx`) use default `PointerSensor` with no touch handling.
- **Hover-only affordances:** `OrderCard` `group-hover` actions and map-hover linking; `RouteGroupRailAvatar` stats popover; `RouteStopWarnings` / `RouteSolutionWarnings` popovers; `AdminNotificationItem` dismiss button; map marker hover previews.
- **Keyboard-only:** Escape handlers in `FeaturePopupShell`, `MainPopupProvider`, `RouteGroupEditFormShell`, `routeGroupPageEscape.flow`; "p" shortcut in `HomeDesktopView`. There is **no back-button (history) integration** on mobile: Android back leaves the app.

### 2.6 Platform CSS

- No width media queries in any `src` CSS. Only `prefers-reduced-motion`.
- Home shell uses `h-screen w-screen` (`HomeAppPage.tsx:50`, `HomeStorePickupPage.tsx`); `App.tsx` uses `min-h-dvh`. iOS Safari toolbar overlap is likely.
- `env(safe-area-inset-*)` used only in `features/externalForm`. `index.html` already has `viewport-fit=cover`.
- `.admin-shell-aurora` blobs (`index.css` ~794–914) are `blur(72px)` layers, expensive on phone GPUs, rendered on mobile today.

### 2.7 Settings

- `src/features/settings/views/SettingsMobileView.tsx` is `<Suspense><Outlet/></Suspense>`: no section navigation, no back-to-home, no logout. Desktop sidebar (`SettingsDesktopView.tsx`, `w-72`, `SETTINGS_SECTIONS`) is the only navigation.

### 2.8 Notifications and acting user

- `AdminNotificationsTrigger` → `FloatingPopover` fixed `w-[360px] max-h-[420px]`; mounted only in `HomeDesktopHeader`.
- `ActingUserButton` (trusted-device mode) mounted only in `HomeDesktopHeader`. `docs/TRUSTED_DEVICE_MULTI_USER_SESSIONS.md:211-213` already records "mobile home shell has no header" as a gap.

### 2.9 Documented precedent

- `Front_end/driver-app/AGENTS.md` (shell owns surfaces, navigation stack, back priority, gestures; features stay layout-agnostic) and `driver-app/src/app/shell/` (`DriverAppShell`, `BottomSheetSurface`, `SideMenuSurface`, `SlidingPageSurface`, `shell.store.ts`, back actions). Borrow the **model**, not the code.

---

## 3. Target architecture

### 3.1 Surfaces (mobile only)

```
┌──────────────────────────────┐
│ TopBar  [user] Title  [🔔][≡] │  ← home-app/components/mobile/HomeMobileTopBar
├──────────────────────────────┤
│                              │
│   Tab root  (Plans | Orders  │  ← registry: homeMobileTabs
│              | Cases)        │
│                              │
│   ┌─ Page stack (full) ────┐ │  ← base panel (plan workspace) + sectionManager
│   │ ‹ Back   Order #123    │ │     entries, slide in/out, hide tab bar while open
│   └────────────────────────┘ │
│   ┌─ Bottom sheet ─────────┐ │  ← shared/overlays/bottomSheet
│   └────────────────────────┘ │     (menus, filters, stats, notifications, menu)
├──────────────────────────────┤
│  Plans    Orders    Cases    │  ← home-app/components/mobile/HomeMobileTabBar
└──────────────────────────────┘
   Popups (popupManager) stay fixed inset-0 z-[100], above everything.
```

**Back priority (highest first):** bottom sheet → popup → top section-stack entry → base panel (plan workspace) → side menu → tab (no-op / leave app). This is the single rule the back flow, the Escape handling, and the UI close buttons all go through.

### 3.2 Ownership

| Concern | Location | Why |
|---|---|---|
| Viewport facts (`isMobile`, `isCoarsePointer`, `hasHover`) | `src/app/viewport/` (replaces `app/contexts/MobileContext` + `app/providers/MobileProvider`, keep the `useMobile` export name) | Environment state is `app/`-owned (AGENTS.md 121-128). |
| Breakpoint constant + Tailwind `desk:` variant | `src/app/viewport/viewport.config.ts` + `index.css` `@theme { --breakpoint-desk: 1000px }` | One number, usable from JS and templates. |
| Mobile shell chrome (top bar, tab bar, menu sheet, page-stack host) | `src/features/home-app/components/mobile/` | `home-app` owns the shared header and cross-workspace shell (archive/ROUTE_OPERATIONS_PLAN_REFACTOR_INTENT.md:112). |
| Shell navigation state (active tab, menu open, active sheet) | `src/features/home-app/stores/homeMobileShell.store.ts` (zustand) | Feature-scoped UI state. Not in `app/`, not in components. |
| Back resolution, tab defaults (pure) | `src/features/home-app/domain/homeMobileShell.domain.ts` + `domain/tests/` | Testable without React. |
| History (back-button) integration | `src/features/home-app/flows/homeMobileBack.flow.ts` | Side effect → flow. |
| Tab → root component map | `src/features/home-app/registry/homeMobileTabs.ts` | Same pattern as `homeSections.ts`. Imports feature barrels only. |
| Bottom sheet, action sheet, mobile page chrome primitives | `src/shared/overlays/bottomSheet/`, `src/shared/section-panel/` (mobile header variant) | Framework-level, feature-agnostic. |
| Route-ops workspace mobile content | `src/features/home-route-operations/views/HomeMobileView.tsx` (rewritten) | Workspace still decides what the base panel / section stack contain. |

### 3.3 What is reused as-is

- `StackActionManager` for popups **and** the page stack (one small change: accept `width: '100%'` so the slide uses percent offsets instead of a pixel snapshot).
- `HomeAppManagersProvider` (global popup/section/base managers).
- `FeaturePopupShell` full-screen branch; custom form shells and their `*Mobile.layout.tsx`.
- `AdminNotification*` bridges, push, click routing.
- Touch-capable DnD sensors inside a single list (route-group stop reordering).

---

## 4. Phases

Each phase is independently shippable and leaves desktop untouched. Phases 0–3 are the core; 4–6 are follow-ups.

### Phase 0 — Foundations (low risk, unblocks everything)

**Create**
- `src/app/viewport/viewport.config.ts` — `MOBILE_MAX_WIDTH = 999`, media query strings.
- `src/app/viewport/ViewportProvider.tsx` — `matchMedia` for `(max-width: 999px)`, `(pointer: coarse)`, `(hover: hover)`. Replaces `MobileProvider`.
- `src/app/viewport/useViewport.ts` — exports `useMobile()` (same shape as today plus `isCoarsePointer`, `hasHover`) so existing call sites keep compiling.

**Modify**
- Re-export from `src/app/contexts/MobileContext.tsx` / `src/app/providers/MobileProvider.tsx` during the move, then delete once all imports point at `app/viewport` (38 files import `useMobile` today).
- `src/shared/resource-manager/ResourceManagerContext.tsx` — remove `isMobileObject` / `setIsMobileViewport` after auditing its consumers.
- `src/shared/hooks/useScrollHideActionBar.ts` — read the breakpoint from `viewport.config`.
- `src/shared/popups/MainPopup/PopupBody.tsx` — fix `const { isMobile } = useMobile()`.
- `src/features/home-route-operations/views/HomeMobileView.tsx` — stop reading `window.innerWidth` during render (use `'100%'` once `StackActionManager` supports it).
- `src/shared/stack-manager/StackActionManager.tsx` — `width?: number | '100%'`; when `'100%'`, animate `x: '100%'`.
- `src/index.css` — `@theme { --breakpoint-desk: 1000px }`; mobile baseline under `@media (max-width: 999px)`: hide `.admin-shell-aurora`, `overscroll-behavior: none` on the shell, `-webkit-tap-highlight-color: transparent`, `font-size: 16px` on text inputs (prevents iOS zoom; confirm against `shared/inputs`).
- `src/features/home-app/pages/HomeAppPage.tsx` and `HomeStorePickupPage.tsx` / `HomeInternationalShippingPage.tsx` — `h-screen` → `h-dvh` (desktop unaffected visually; verify).

**Acceptance**
- `grep -rn "isMobileObject\|setIsMobileViewport" src` returns nothing.
- Only one `innerWidth`/`matchMedia` breakpoint definition in `src`.
- Desktop unchanged; aurora layers absent below 1000px.

### Phase 1 — Mobile shell: chrome, tabs, page stack, back button

**Create**
- `src/features/home-app/domain/homeMobileShell.types.ts` — `HomeMobileTabId = 'plans' | 'orders' | 'cases'`, `HomeMobileLayer` union (`popup | sheet | section | base | menu`), `HomeMobileSheetId`.
- `src/features/home-app/domain/homeMobileShell.domain.ts` — `resolveBackTarget(layers): HomeMobileLayer | null`, `shouldShowTabBar(state)`, tab defaults. Tests in `domain/tests/homeMobileShell.domain.test.ts`.
- `src/features/home-app/stores/homeMobileShell.store.ts` — `activeTab`, `isMenuOpen`, `activeSheet`, setters. Reset on account switch (`closeAll()` compatibility; see TRUSTED_DEVICE doc :207-210).
- `src/features/home-app/flows/homeMobileBack.flow.ts` — subscribes to `popupManager`, `sectionManager`, `baseControlls`, and the shell store; pushes one `history.pushState({ homeMobileDepth })` per layer opened; on `popstate` closes the layer `resolveBackTarget` names; UI close buttons call a `goBack()` that triggers `history.back()` so both paths converge. Guard against double-close.
- `src/features/home-app/registry/homeMobileTabs.ts` — `{ plans: RoutePlanPage, orders: OrderMainPage, cases: CaseMainPage }` via feature barrels (`OrderMainPage` / `CaseMainPage` need barrel exports if missing).
- `src/features/home-app/components/mobile/HomeMobileShell.tsx` — composes top bar, tab root, page-stack host, tab bar, menu sheet. Reads only the shell store and managers; no business logic.
- `src/features/home-app/components/mobile/HomeMobileTopBar.tsx` — `ActingUserButton` (left), title (active tab or top page), `AdminNotificationsAlertToggle` + `AdminNotificationsTrigger` (right; sheet variant comes in Phase 2), menu button. Safe-area top padding.
- `src/features/home-app/components/mobile/HomeMobileTabBar.tsx` — 3 tabs, 44px targets, safe-area bottom padding. Hidden while a page or popup is open.
- `src/features/home-app/components/mobile/HomeMobileMenuSheet.tsx` — workspace switcher (`HOME_WORKSPACE_OPTIONS`), `ThemeToggle`, Settings (`navigate('/settings')`), Cases shortcut, logout.
- `src/features/home-app/components/mobile/HomeMobilePageStackHost.tsx` — renders the base panel (`PlanWorkspacePanel`) and `SectionManagerHost` at `width: '100%'` inside the content area; pushes/pops are what the back flow observes.

**Modify**
- `src/features/home-app/pages/HomeAppPage.tsx` — mobile branch renders `<HomeMobileShell />`; keep `HomeOverlays` and `OrderLinkedDeviceLiveWidget` as today. Import `HomeOverlays` via the `home-route-operations` barrel (today it is a deep import).
- `src/features/home-route-operations/views/HomeMobileView.tsx` — becomes the workspace's contribution to the shell: supplies the base panel + section stack for route operations and nothing else (the plan list root moves to the `plans` tab).
- `src/features/home-route-operations/pages/HomeRouteOperationsPage.tsx` — `RouteOperationsHeaderActionsRegistrar` either renders into the mobile top bar or is removed (today it renders nowhere). Decide in-phase; recommended: remove and let the menu sheet own Cases.
- `src/shared/section-panel/SectionPanel.tsx` + `SectionHeader.tsx` — mobile header variant: back chevron + title + optional primary action, sticky, safe-area aware. Selected by `isMobile`; desktop header unchanged.
- `src/shared/popups/featurePopup/FeaturePopupHeader.tsx` — same back-chevron treatment on mobile.

**Acceptance**
- On a 390px-wide viewport: tabs switch roots; tapping a plan pushes the plan workspace; tapping an order pushes order details; Android back / browser back pops one layer at a time and never leaves the app while a layer is open.
- Acting-user switch, notifications, settings, theme toggle, and workspace switch are reachable.
- Desktop snapshot unchanged.

### Phase 2 — Mobile primitives and tap parity

**Create**
- `src/shared/overlays/bottomSheet/BottomSheet.tsx`, `useBottomSheetDrag.ts`, `bottomSheet.types.ts` — framer-motion drag-to-dismiss, snap points (`'auto' | number[]`), backdrop, safe-area bottom padding, scroll-lock of the page behind.
- `src/shared/overlays/bottomSheet/ActionSheet.tsx` — list of actions (icon + label + destructive flag) for menus.

**Modify**
- `src/shared/buttons/ThreeDotMenu.tsx` — on `isCoarsePointer` render `ActionSheet` instead of the 190px portal popover. One change fixes every card menu.
- `src/realtime/notifications/AdminNotificationsTrigger.tsx` — on mobile open the list in a `BottomSheet` (`w-[360px]` popover stays for desktop). `AdminNotificationItem.tsx`: dismiss button always visible when `!hasHover`.
- `src/shared/layout/InfoHover/` — read `hasHover` from `useMobile()` instead of its own media query; apply the same tap fallback to `RouteGroupRailAvatar`, `RouteStopWarnings`, `RouteSolutionWarnings`.
- `src/features/order/components/cards/OrderCard.tsx` — `group-hover` actions always visible on `!hasHover`; skip map-hover linking when the map is not mounted.
- `src/features/plan/routeGroup/components/overlays/RouteGroupStatsOverlay/` — on mobile, expose stats as a `BottomSheet` opened from the route-group header instead of returning `null`.
- Plan date filter / `OrderFilterPopup` — keep full-screen popup (already works); optional sheet variant later.

**Acceptance**
- No hover-only action remains on a coarse-pointer device (checklist in §7).
- Sheets dismiss by drag, backdrop tap, and back button (via Phase 1 back flow).

### Phase 3 — Workflows that need a non-drag path

- **Assign orders to a plan.** Source and target are never co-visible on a phone. Add a mobile path: in order selection mode, a sticky bottom action "Assign to plan…" opens a plan-picker `BottomSheet` (reuses the plan list query from `features/plan`) and dispatches the same assignment command the drop handler in `usePlanOrderDndController.tsx` uses. Expose that command as an action (`features/plan/actions/assignOrdersToPlan.action.ts`) if it is currently inline in the DnD handler (verify in-phase). Same for "Unschedule".
- **Route group page on mobile.** Keep the existing `md:` stacking; replace the fixed-height action bar logic (`RouteGroupsPageContent.page.tsx` 138/82px) with a mobile sticky bottom bar + safe-area; optimize/assign actions move into it. Stop reordering within the list stays as touch drag (already works with `TouchSensor`).
- **Order detail, case pages, customer detail.** Audit each section page for widths, `grid-cols-2` forms, and tables; add `desk:` variants where content overflows. No structural rewrites.
- **Form shells.** `OrderFormMobile.layout.tsx`, `CostumerFormMobile.layout.tsx`, `RouteGroupEditFormMobile.layout.tsx`: sticky header, footer with `env(safe-area-inset-bottom)`, `pb-28` replaced by measured footer height. `ZoneFormFields` `grid-cols-2` → single column below `desk`.
- **Plan list header** (`features/plan/components/headers/`): compact layout below `desk` (search collapses into an icon, create button in the top bar's primary slot).

**Acceptance**
- An operator can: find an order, open it, assign it to a plan, open the plan, reorder stops, and open a case — all on a phone without drag between screens.

### Phase 4 — Settings on mobile

- `src/features/settings/domain/settingsSections.ts` — move `SETTINGS_SECTIONS` out of `SettingsDesktopView.tsx:34` (it is defined inline there today) so both views share it.
- `src/features/settings/views/SettingsMobileView.tsx` — index route renders a section list; section routes render a top bar (back to list, title) + `Outlet`; logout and "Back to home" at the bottom. Safe-area, `h-dvh`.
- Settings sortables (`ItemStatesPage.tsx`, `ClientFormMediaPlacementGroup.tsx`, `ClientFormRulesPage.tsx`) → `MouseSensor` + `TouchSensor` like `usePlanOrderDndController`, plus `.dnd-touch-source`.
- `ClassicLayout` popups already go full screen; add the mobile header back chevron.

### Phase 5 — Map tab (optional)

- Fourth tab "Map": mount `MapPanel` full-screen with `gestureHandling: 'greedy'` (`shared/map/.../MapInstanceManager.ts`), marker **tap** → push order details, overlays stay `null` on mobile, no drawing. `HomeRouteOperationsManagersProvider` must stop skipping `preloadMapExtras` when the map tab is active. The map container must persist across tab switches (keep it mounted, toggle visibility) to avoid re-creating the Google map.
- Only start after Phases 1–3 are stable; the map runtime (`RouteGroupWorkspaceRuntime`, viewport insets, reframe flows) was written for the desktop grid.

### Phase 6 — Installable PWA (optional)

- Needs an admin manifest, a head-state entry in `app/pwa/domain`, and a decision on service-worker scope. `scripts/check-external-form-pwa.mjs` forbids a root-scope SW and requires the manifest to be scoped to `/external-form`; that script must be revised first. Out of scope until the user asks for home-screen install.

---

## 5. Decisions needed (recommendation first)

| # | Decision | Recommendation |
|---|---|---|
| 1 | Tab set | **Plans / Orders / Cases**, everything else in the menu sheet. Add Map as a fourth tab only in Phase 5. |
| 2 | Tab bar while a page is pushed | **Hide it.** Standard iOS/Android pattern; more room, fewer mis-taps. |
| 3 | Mobile cutoff | **Keep 1000px** (portrait tablets get the mobile shell), but make it one constant and add the `desk:` Tailwind variant so templates stop using `md:` to mean "desktop". |
| 4 | Order → plan assignment on mobile | **Selection mode + plan-picker sheet** (Phase 3). No cross-screen drag. |
| 5 | Back-button model | **History-integrated** (`pushState` per layer). Without it Android users leave the app on every back press. |
| 6 | Cases entry point | **Menu sheet + Cases tab.** Remove the dead `setHeaderActions` registrar. |

---

## 6. Verification

- `npm run build` (`tsc -b && vite build`), `npm run lint`, `npm run check:popup-contract`, `npm run theme:regression` — all green after every phase.
- Domain tests for `homeMobileShell.domain.ts` (back resolution, tab bar visibility) next to the existing `domain/tests/*.test.ts` files. Note: no `test` script exists and no vitest/jest binary is installed in `admin-app` or the workspace root, so the existing `*.test.ts` files currently have no runner. Adding `vitest` (dev dependency + `test` script) is a Phase 1 prerequisite if the domain tests are to be a gate.
- Manual matrix per phase: Chrome device toolbar (iPhone 14 Pro 393×852, Pixel 7 412×915, iPad portrait 820×1180) and a real iOS Safari device over `vite --host` (already enabled in `vite.config.ts`). Check: safe areas, keyboard-open layout, back button, both themes.
- Desktop regression: open every section and popup at 1280px and 1920px before/after; nothing may move.

---

## 7. Tap-parity checklist (Phase 2 exit criteria)

- [ ] `OrderCard` actions visible without hover
- [ ] `ThreeDotMenu` opens an action sheet on coarse pointer
- [ ] `RouteGroupRailAvatar` stats open on tap
- [ ] `RouteStopWarnings` / `RouteSolutionWarnings` open on tap
- [ ] `AdminNotificationItem` dismiss visible on coarse pointer
- [ ] No `onMouseEnter`-only behaviour left on reachable mobile surfaces (`grep -rn "onMouseEnter" src/features`)
- [ ] All tappable targets ≥ 44×44px in the shell chrome

---

## 8. Risks

- **Two viewport owners today.** If Phase 0 is skipped, the shell and the resource manager can disagree on `isMobile`. Do Phase 0 first.
- **History integration loops.** A UI close that also pops history, or a `popstate` that closes a layer which then pops history again, double-closes. Keep the rule "UI close → `history.back()` → `popstate` → close" and unit-test `resolveBackTarget`.
- **Account switch** is a full reload with `closeAll()` on every stack manager; the shell store must reset too, or a stale `activeSheet` survives.
- **Aurora/blur layers** on low-end phones cause jank; they are disabled below 1000px in Phase 0. Theme regression scripts do not scan `.css`, so review the media query by eye in both themes.
- **PWA checks** (`check:external-form-pwa`) assume the external form is the only installable surface. Phase 6 cannot start without changing that contract.
- **`md:` vs `desk:`** — existing `md:` rules (e.g. `RouteGroups.page.tsx`, `StackActionManager`) stay as they are; only new mobile work uses `desk:`. Mixed prefixes in one file are acceptable during the transition but should not be introduced casually.

---

## 9. Out of scope / noted but not planned

- `src/features/home/views/HomeDesktopView.tsx` is unreferenced (dead file). Delete in a separate cleanup.
- `features/*/registry/popupRegistry.ts` duplicates (facility, vehicle, integrations, item, team, user) are type-only and unused; not touched here.
- `docs/README.md:31` points `ZONE_CREATION_MODE_PLAN.md` at `under_development/` but the file is in `archive/`.

---

## 10. Implementation notes (2026-10-07)

What landed, where it deviates from the phases above, and what to check on a device.

### Landed

- **Viewport owner:** `src/app/viewport/` (`ViewportProvider`, `useMobile` / `useViewport` returning `{ isMobile, isCoarsePointer, hasHover }`, `viewport.config.ts`). `app/contexts/MobileContext.tsx` and `app/providers/MobileProvider.tsx` remain as one-line re-export shims because another session was editing a file that imports the old path; delete the shims once `OrderDetailProvider.tsx` imports from `@/app/viewport`.
- **Breakpoint:** `--breakpoint-desk: 1000px` in `index.css`; `desk:` is the Tailwind variant. `useScrollHideActionBar` reads `DESKTOP_MEDIA_QUERY` from the viewport config.
- **Base panel is global:** `HomeRouteOperationsManagersProvider` no longer creates its own `useBaseControlls`; the one from `HomeAppManagersProvider` is the single instance, so the shell can treat it as a back-navigation layer.
- **Shell:** `features/home-app/components/mobile/` (`HomeMobileShell`, `HomeMobileTabBar`, `HomeMobileAlertsPage`, `HomeMobileSettingsPage`), `stores/homeMobileShell.store.ts`, `domain/homeMobileShell.domain.ts` (+ test in repo's hand-rolled style), `flows/homeMobileLayers.flow.ts`, `flows/homeMobileBack.flow.ts`, `flows/useHomeMobileCloseLayer.flow.ts`. `features/home-app/index.ts` is the barrel. There is **no top bar**: tabs are Plans / Orders (workspace-owned) and Alerts / Settings (shell-owned, reachable in every workspace). Cases is deprecated and has no tab.
- **Workspace mobile view:** `features/home-route-operations/views/HomeMobileView.tsx` renders the tab roots from `registry/homeMobileTabs.tsx` (Plans / Orders, kept mounted after first visit) and pushes the plan workspace panel + section stack as full-screen pages in a `fixed inset-0 z-[60]` layer with `safe-top`. The layer is **portalled to `document.body`** because the workspace sits inside a `relative z-10` stacking context; rendered in place it painted under the tab bar.
- **Stack manager:** `renderStack({ width: 'full' })` slides panels by `100%` instead of a measured pixel width.
- **Bottom sheet primitives:** `shared/overlays/bottomSheet/` (`BottomSheet`, `ActionSheet`, `bottomSheetRegistry`). Sheets register while open so the back button closes them first.
- **Tap parity:** `ThreeDotMenu` renders an `ActionSheet` on coarse pointers; `RouteGroupRailAvatar` opens its stats in a sheet on a second tap when hovering is impossible; `RouteStopWarnings` / `RouteSolutionWarnings` toggle on tap; `InfoHover` reads `hasHover` from the viewport owner.
- **Assignment without drag:** `features/plan/actions/assignSelectedOrders.action.ts` + `features/plan/components/mobile/PlanPickerSheet.tsx` (exported from the plan barrel) and `features/home-route-operations/components/mobile/OrderSelectionActionBar.tsx` on the Orders tab.
- **Forms:** full-screen shells get `safe-top`; zone form rows are one column below `desk`.
- **Order form on phones** (`features/order/forms/orderForm/views/mobile/`): `OrderFormMobile.layout` is a fixed header + one scroll column + bottom action bar. The header is `OrderFormHeaderMobile` (back chevron, title, id, full-width Pickup/Dropoff). Fields come from `components/fields/OrderFormFieldControls.tsx`, one control per field, composed by the desktop grid (`OrderFormFields`) and the phone sections (`OrderFormFieldsMobile`: Contact, Address, Delivery, More details, message). The customer panel is `OrderFormCostumerSectionMobile`: a summary card, a `BottomSheet` with the customer search, and the customer form as a `PushedPage`. Items are inline (`OrderFormItemsSectionMobile`) with the item editor as a `PushedPage`. `OrderFormFooterMobile` holds Send form (action sheet) + Save; Delete sits at the end of the scroll column. `OrderFormHeader` / `OrderFormFooter` are desktop-only again.
- **Costumer form on phones:** back chevron header, one field per row, save bar in flow with `safe-bottom`; the embedded variant inside the order form follows the same rules.
- **`shared/overlays/pushedPage/PushedPage`:** a full-screen page pushed over a popup (z 110, portalled to `body`), registers as a back layer through `useBackLayerRegistration` (exported from the bottom-sheet module).
- **`FeaturePopupHeader`** renders the back chevron on phones instead of the X; `FeaturePopupFooter` pads for the home indicator.
- **Back priority is sheet → popup → section → base.** A sheet always renders above the popup that opened it (the order form's customer picker), so it must close first.
- **Settings:** `features/settings/domain/settingsSections.ts` owns the section list and route map; the index route shows `SettingsMobileSectionList` on phones; `SettingsMobileView` has a top bar with back + title; settings sortables use Mouse + Touch sensors.

### Deviations from the phase list

- **Notification files were not edited.** `src/realtime/notifications/*` was being edited by another session during this work. The Alerts tab (`HomeMobileAlertsPage`) composes the existing store, item and alert-toggle modules through deep imports; the desktop bell trigger is not mounted on phones, so the arrival chime does not play there.
- **`HomeDesktopHeader` was not touched** for the same reason. The dead `setHeaderActions` registrar was removed and `headerActions` dropped from `HomeAppProvider`; Cases on desktop is still only reachable through notifications until the header gets a button.
- **No test runner was added.** The domain test follows the existing `run…Tests` export style; wiring vitest is still a prerequisite before tests can gate anything.
- **Pre-existing gate failures** (not caused by this work): `theme-codemod --check` stops at `OrderCard.tsx:82`, and `theme-functional-color-guard` reports three `rgba(0,0,0,…)` counts off. Both files/literals predate this change set.

### Check on a device

1. Plans → tap a plan → route groups page slides in over the tab bar with a back chevron; hardware back closes it.
2. Orders → three-dot on a card opens an action sheet; selection mode shows the bottom bar; "Assign to plan…" opens the picker; back closes the picker first, then exits nothing else.
3. Alerts tab lists unread notifications with a badge on the tab; tapping one opens its order or plan.
4. Settings tab: account / log out, workspace switch, theme, link into the full settings area. Settings index lists sections; back returns to home.
5. Keyboard open with the order form: footer stays reachable, header stays pinned.
6. Order form: "Find customer" opens a sheet; "Create Costumer" in it pushes the customer form; back closes the pushed page, then the form. "+ Item" pushes the item editor; hardware back closes it before the order form.
