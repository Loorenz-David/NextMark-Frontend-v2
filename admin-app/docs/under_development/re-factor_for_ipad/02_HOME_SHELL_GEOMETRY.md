# 02 — Home shell geometry and density at iPad widths

Inventory taken 2026-10-24. Paths relative to `Front_end/admin-app/src`. Line numbers drift; re-grep before editing.

**Short version:** the home screen is a CSS grid of three tracks, map | plan | rail. Plan and rail widths are JS constants (450 / 450–550 / map rail 320) that never respond to viewport width above 999px. The default plan view is the calendar, whose column is `calc(100vw - 320px - rail)`. At 1024px that leaves 254px (154px with a plan open) and day cells of ≈20px (≈5px). In list view the map shrinks to 124px (24px with a plan open). Text runs 9–12px in many places, controls are 28–32px, and the desktop shell ignores safe-area insets.

---

## 1. Breakpoint system

- `index.css:1239-1241`: `@theme { --breakpoint-desk: 1000px; }` is the **only** breakpoint token; `desk:` is a Tailwind breakpoint variant (no `@custom-variant`). `@theme inline` (`index.css:524-578`) holds only colour mappings: **no spacing, text or density tokens**.
- CSS `@media`: `(max-width:999px)` hides `.admin-shell-aurora` (`:1274`); `(max-width:999px) and (pointer:coarse)` forces 16px inputs (`:1282`); the rest are reduced-motion.
- Helpers: `.safe-top/.safe-bottom/.safe-x` (`:1244-1253`), `.touch-hit-area` (inset −10px, `:1257-1265`), `.admin-mobile-shell` (`:1269`).
- Tailwind prefixes in `src`: `sm:` 15 real, `md:` 73 real (768px → always on for iPad), `lg:` 0, `xl:` 12 (1280px → off on every iPad except 12.9"/13"), `2xl:` 0, `desk:` 15 (one file, `features/zone/forms/zoneForm/components/ZoneFormFields.tsx`), `max-*:`/`min-[]:`/`@container` 0.
- JS constants: `app/viewport/viewport.config.ts:6` `MOBILE_MAX_WIDTH = 999`; `features/ai/providers/AdminAiPanelProvider.tsx:208` `mobileBreakpoint={1000}` (package default `packages/ai-panel/src/constants.ts:3-5`; panel 460×640, launcher 72×72, reads `innerWidth` in `layout.ts:31`); home layout constants below; `useRouteGroupStatsOverlayController.ts:27-28` `WIDE=1200`, `MEDIUM=860` (ResizeObserver; `routeGroupStatsOverlay.constants.ts:3` `SCROLL_THRESHOLD=900` unused); `DeliveryWindowCalendarDensity.flow.ts:5` `COMPACT_WIDTH_THRESHOLD=620`; `features/zone/components/ZoneDetailsPopover.tsx:19,93` `POPOVER_WIDTH=224` clamped by `innerWidth` (the only `innerWidth` read in `src`).
- `main.tsx:10-13` writes `--vh` from `innerHeight`; **nothing reads it** (`index.css:274` sets `--vh:100%`).
- `app/viewport` API: `ViewportProvider` owns three `matchMedia` subscriptions → `{ isMobile, isCoarsePointer, hasHover }`; `useViewport()` / alias `useMobile()` fall back to `{false,false,true}`. **No tablet, size-class or density field.**

## 2. Home shell structure (desktop branch, what the iPad gets)

```
HomeAppShell  div.flex.h-screen.w-screen.flex-col (100vh, no safe-area)        features/home-app/pages/HomeAppPage.tsx
├─ HomeDesktopHeader  min-h-[3.25rem] (52px) px-6 py-3                         features/home-app/components/HomeDesktopHeader.tsx
│    left: ThemeToggle, ActingUserButton (max-w-[10rem]) · right: notifications, Settings (toolbarSecondary)
└─ HomeRouteOperationsPage → HomeDesktopView → HomeDesktopLayout
   main.grid  gridTemplateColumns: minmax(0,1fr) <planCol> <rail>px  (220ms transition)   layout/HomeDesktopLayout.tsx:69
   ├─ MapArea (overflow-hidden)  + OrderMapOverlay | ZoneMapOverlay | RouteGroupMapOverlay, stats overlay   layout/MapArea.tsx:11
   ├─ PlanArea → PlanDesktopShell → PlanCalendarPage (default) | RoutePlanPage (list)      layout/PlanArea.tsx:89-93
   └─ OverlayRail (450, or 550 when a plan workspace is open)                              layout/OverlayRail.tsx:28-33
      ├─ base: div 450 → SectionPanel 450 → OrderPage (OrderMainHeader + OrderList)         views/HomeDesktopView.tsx (base slot)
      ├─ orderOverlay: SectionPanel 550 → PlanWorkspacePanel → RouteGroupsPage [RouteGroupRail md:w-[100px] | content ≈449]
      └─ dynamic sections (order details, customer, cases): SectionManagerHost width 550, clamped maxWidth:100% → slide inside the rail
   + fold tabs: plan toggle padding 29px/6px (HomeDesktopView PLAN_TOGGLE_BUTTON_STYLE); MapToggleTab ≈22×72, 9px label
   + AI launcher 72×72 fixed (currently not mounted); OrderLinkedDeviceLiveWidget fixed bottom-4 left-4
```

Width sources: `domain/homeDesktopLayout.domain.ts` (`DESKTOP_PLAN_WIDTH=450`, `DESKTOP_MAP_RAIL_WIDTH=320`, `DESKTOP_SPLIT_RATIO=50`, `resolveHomeDesktopTracks`), `hooks/useHomeDesktopLayout.ts:50-52` (`BASE_WIDTH=450`, `ORDER_OVERLAY_WIDTH=550`, `OVERLAY_WIDTH=450`; view mode persisted in `localStorage['home.desktop.planViewMode']`, default `rail`), `store/homeDesktopLayout.store.ts` (map visible, persisted), `views/HomeDesktopView.tsx:36` `SAFE_GUTTER=24` map insets.

Plan column by `resolveHomeDesktopTracks`: folded → 0; map hidden → `calc(100vw - rail)`; calendar view (default, `features/plan/calendar/store/planCalendar.store.ts:45`, not persisted) → `calc(100vw - 320px - rail)`; list view → 450. Split mode → plan column 0, map and plan stacked 50/50; the plan half is the placeholder `features/plan/views/PlanDesktopTimeline.tsx` ("coming soon"). All tracks use `min-w-0`, **no hard min-widths**, so the map simply collapses.

### Resulting widths (px)

| Viewport | Calendar view, rail 450 (map / calendar / rail) | Calendar, plan open (rail 550) | List view, rail 450 (map / plan / rail) | List, plan open (rail 550) |
|---|---|---|---|---|
| 1024 | 320 / **254** / 450 | 320 / **154** / 550 | **124** / 450 / 450 | **24** / 450 / 550 |
| 1080 | 320 / 310 / 450 | 320 / 210 / 550 | 180 / 450 / 450 | 80 / 450 / 550 |
| 1180 | 320 / 410 / 450 | 320 / 310 / 550 | 280 / 450 / 450 | 180 / 450 / 550 |
| 1194 | 320 / 424 / 450 | 320 / 324 / 550 | 294 / 450 / 450 | 194 / 450 / 550 |
| 1366 | 320 / 596 / 450 | 320 / 496 / 550 | 466 / 450 / 450 | 366 / 450 / 550 |

Sum of fixed tracks in the default state: 320 + 450 + 550 = **1320px**, more than every target except 1366.

Calendar day cell (`features/plan/calendar/components/PlanCalendarBody.tsx:24`: `28px repeat(7, minmax(0,1fr))`, `gap-2`, `px-4` → (col − 116)/7): 254 → ≈20px, 154 → ≈5px, 310 → ≈28px, 410 → ≈42px, 596 → ≈69px. Plan chips use 9–12px text (`PlanCalendarPlanChip.tsx:92-128`). Comfortable minimum ≈ 7×72 + 116 ≈ 620px, reached nowhere on an iPad.

Height: 716px of content on 1024×768 (768 − 52 header), 972px on 1366×1024. Plan header is 72px. Split mode at 1024 gives a 574×≈358 map with a placeholder below.

## 3. Fixed pixel sizes by surface

Counts in `src`: `w-[…]` 92, `min-w-[…]` 32, `max-w-[…]` 30, `h-[…]` 80, `min-h-[…]` 32, `max-h-[…]` 19, `w-64/72/80/96` 9, `max-w-{xs…3xl}` 20.

- **Home shell:** 450 plan, 450/550 rail, 320 map rail, 100 route rail (+ `min-w-[78px]` items), header `min-h-[3.25rem]`.
- **Section panels (rail):** `shared/stack-manager/StackActionManager.tsx:280` `md:w-[400px]` fallback; order-detail tabs fixed `h-[420px]` ×4 (`OrderDetailSummary.tsx:47`, `OrderDetailNotesTab.tsx:28`, `OrderDetailEventHistory.tsx:115`, `OrderDetailTimeWindows.tsx:30`); `OrderDetailHeader.tsx:86,99,109` `min-w-[116px]`, `min-w-[220px] max-w-[270px]`; `OrderMainHeader.tsx:120` `max-h-[65px]`.
- **Map overlays** (inside a 24–320px `overflow-hidden` map): `MapMultiSelectOverlay.tsx:68` `w-72` (288) at `left-4`; `ZoneMapOverlay.tsx:95` `w-52` at `right-10`; `OrderMarkerGroupOverlay.tsx:85` `w-[320px]`; `RouteGroupMarkerGroupOverlay.tsx:58` `w-[300px]`; stats overlay `RouteGroupDriverCard.tsx:22,49` `min-w-[180/220px]`, `RouteGroupConsumptionStatsColumn.tsx:95` `min-w-[180px]`, `RouteGroupStatsOverlayShell.tsx:157` `max-h-[40vh]`; `PlanDateFilterBar.tsx:60-61` `w-[200px]`; `PlanDateFilterOverlay.tsx:18` `w-[320px]`.
- **Popups:** `OrderFormShell.tsx:42` **hard `w-[950px]`** (not `min()`), inner `OrderFormDesktop.layout.tsx:25-27` `max-w-[950px]` with a fixed 560 column, `OrderFormDesktopRightColumn.tsx:38,57` `max-w-[350/600px]` → 982px incl. padding, 42px to spare at 1024; `RouteGroupEditFormShell.tsx:57` `w-[min(1120px,96vw)]`, inner 950/560 (`RouteGroupEditFormDesktop.layout.tsx:11-12`); `CostumerFormShell.tsx:42` `w-[min(640px,96vw)]`, inner `w-[560px]`; `ClassicLayout.tsx:37,40` `min-w-[500px] max-w-[600px] max-h-[800px] h-full`; `FeaturePopupShell.tsx:10-14` sizes sm 520×min(86vh,760), md 600×min(88vh,820), mdNoHeight 600, lg 860×min(90vh,900), full min(1140,98vw)×min(92vh,960) (11 users, all `variant="center"`); `OrderFormFooter.tsx:96` `w-[240px]`; `ConfirmActionPopup.tsx:18` `max-w-[min(520px,calc(100vw-48px))]`.
- **Settings:** sidebar `SettingsDesktopView.tsx:71` `w-72 min-w-72` (288, not collapsible); `ClientFormTermsPage.tsx:91` `w-64 xl:w-72`; `IntegrationCard.tsx:27` `w-[20rem] min-h-[24rem]` in `IntegrationsCarousel.tsx:19-20`; `ItemStateCard.tsx:30` `w-80`; `min-w-[320px]` in `EmailIntegrationForm.tsx:55`, `TwilioIntegrationForm.tsx:53`, `InviteMember.layout.tsx:77`; `SmsPhonePreview.tsx:27,41`, `EmailPreview.tsx:29` `h-[420px]`.
- **Notifications:** `realtime/notifications/AdminNotificationsTrigger.tsx:102,119` `w-[360px] max-h-[420px]`.
- **Inputs:** `CustomDatePickerCalendarPanel.tsx:120` `w-[310px]`; `PhoneField.layout.tsx:60` `w-[100px]`; `TimeInputField.tsx:21` `w-[85px]`; `ObjectLinkSelectorSelectedOverlay.tsx:37` `max-w-[560px]`; DeliveryWindowCalendar list `h-[370px]` (`DeliveryWindowCalendarShell.flow.ts:134`) and `min-w-[104–150px]` (`:251-336`).
- **Calendar:** `PlanCalendarDayPlansOverlay.tsx:64` `w-[min(92vw,400px)] max-h-[440px]`. **Warnings popovers:** `RouteSolutionWarnings.tsx:105`, `RouteStopWarnings.tsx:55` `w-72`.

## 4. Popups and overlays between 1000 and 1366

- `FeaturePopupShell`: full screen only when `isMobile` or `variant='fullscreen'` (`:39-52`); otherwise centred modal `fixed inset-0 p-4` (`:58`); `side` changes only the entry animation. At 768 tall, `md` ≈ 676px. `FeaturePopupFooter.tsx:11` pads `env(safe-area-inset-bottom)` in every mode (the only desktop safe-area use).
- `MainPopup/ClassicLayout` (Settings popups; blueprint set in `features/settings/context/SettingsProvider.tsx:29`; 24 consumer files): desktop `h-full max-h-[800px] min-w-[500px] max-w-[600px]`, container has no padding → on a 768-tall iPad it is an edge-to-edge full-height column. `PopupBody.tsx` desktop branch; `PopupFooter.tsx:20` `absolute bottom-0 py-4`, no inset → sits on the home indicator.
- Form shells (`OrderFormShell`, `CostumerFormShell`, `RouteGroupEditFormShell`): mobile → `safe-top fixed inset-0` with `*Mobile.layout.tsx`; desktop → centred fixed-size modal with `*Desktop.layout.tsx`, heights min(92vh, 900/820) ≈ 706px at 768. Mobile layouts: `features/order/forms/orderForm/views/mobile/OrderFormMobile.layout.tsx`, `features/costumer/forms/costumerForm/components/CostumerFormMobile.layout.tsx`, `features/plan/routeGroup/forms/routeGroupEditForm/views/mobile/RouteGroupEditFormMobile.layout.tsx`, `DeliveryWindowCalendarMobile.layout.tsx`.
- `shared/overlays`: `bottomSheet/BottomSheet.tsx` (85dvh, safe-bottom), `ActionSheet`, `pushedPage/PushedPage.tsx:46` (safe-top, fixed inset-0) are phone primitives but render fine at any width; `stepSequence/StepSequenceOverlay.tsx:54` `w-[min(420px,94vw)]`.
- Stack manager: home popup/section managers have no blueprint (`HomeAppManagersProvider.tsx:32-46`); sections animate from x=550/400 inside the rail.
- `shared/section-panel/SectionPanel.tsx`: fills parent; header `px-4 py-3`, `text-lg` title; Close is a `text` button (`py-1.5 text-xs`).

## 5. Typography and density scale

- Root 16px, no html font-size. Inputs 0.875rem (`App.css:12,66`); `.custom-field-container` padding `0.625rem 0.9rem` ≈ 40px tall (`App.css:33-45`).
- Counts: `text-xs` 383, `text-sm` 366, `text-base` 55, `text-lg` 33, `text-xl` 10, `text-2xl` 4, `text-md` 9 (**no-op**, no `--text-md` token).
- Arbitrary px: `text-[10px]` 82 (53 files), `[11px]` 48 (27), `[9px]` 14, `[12px]` 11, `[8px]` 2. Arbitrary rem < 11px ≈ 80 (`0.62rem` 38, `0.68rem` 12, `0.65rem` 10, `0.6rem` 9, `0.55rem` 3, …) plus `0.7rem` 15, `0.72rem` 9.
- Densest files: `UserProfileCard.tsx`, `OrderEventTimelineItem.tsx` (7 each), `DeliveryWindowCalendarDayPopover.tsx` (6), `OrderCard.tsx`, `OrderDetailSummary.tsx`, `OrderDetailEventHistory.tsx`, `OrderCaseChatList.tsx`, `DeliveryWindowCalendarSelectedWindowsCard.tsx` (4 each).
- Cards: `OrderCard.tsx:83`, `RouteGroupOrderCard.tsx:69` `p-4 gap-2.5`, `text-base` id, `text-xs` meta, `h-3/h-4` icons, `text-[8px]` badge, `text-[0.55rem]` chip, ≈90–110px per row. `PlanCard.tsx:141` `p-4 gap-6`, `text-[12px]` meta, `h-2`/`h-3` icons.
- Icons (h/w pairs): 2→5, 2.5→9, 3→53, 3.5→14, 4→85, 5→39, 6→21, 7→15, 8→12, 10→13, 12→10. `size-*` never used.
- Buttons `shared/buttons/Button.constants.ts`: text variants `px-3 py-1.5 text-sm|xs` ≈ 32px; `toolbarSecondary` `py-1` ≈ 28–30px; `rounded` `h-10 w-10`. `min-h-11` ×5; 44px ×0.
- **Today's scale ≈ 10/12/14px text, 12–16px icons, 28–32px controls, 16px card padding. A tablet density would move to ≈ 12/14/16px text, 16–20px icons, 40–44px controls.**

## 6. Viewport height and safe areas

- `h-screen` ×3 (`HomeAppPage.tsx`, `SettingsPage.tsx:19`, `AppRouterSkeleton.tsx:2`); `w-screen` ×3; `100vh` in `index.css:581,592`, `ClassicLayout.tsx:37`; `100vw` in `homeDesktopLayout.domain.ts:64,66`, `ConfirmActionPopup.tsx:18`; `dvh` ×8, all on mobile/auth/external paths; `svh`/`lvh` 0.
- Safe-area classes: `safe-top` 11, `safe-bottom` 6, `safe-x` 1, `env(safe-area…)` 9 — **all on mobile branches or the external form except `FeaturePopupFooter`**.
- Home-indicator collisions (bottom ≈20px): order list "Load next page" (`orderMain.page.tsx:152`), `RouteGroupStatsOverlayShell.tsx:115` (`absolute bottom-0`), `RouteGroupReadyFooter.tsx:12`, `OrderLinkedDeviceLiveWidget.tsx:35` (`fixed bottom-4 left-4`), calendar last row, Settings "Log out" (`SettingsDesktopView.tsx:126`), `ClassicLayout` + `PopupFooter`.
- Status bar: with `default` style no top overlap; with `black-translucent`, `HomeDesktopHeader` (`py-3`, no `safe-top`) and the Settings sidebar would collide.

## 7. Settings

- `views/SettingsDesktopView.tsx:70-151`: `aside w-72 min-w-72 px-4 py-6`, nav rows `py-2.5 text-sm`, sub-rows `py-2 text-xs`; `main flex-1` → 736px at 1024, 1078px at 1366.
- Pages share `p-6 gap-6 overflow-auto` + hero card `px-8 py-7 rounded-3xl` with `h-20 w-20` icon tile. Two-column layouts switch on only at `xl:` (`UserMainPage.tsx:45`, `EmailTemplateEditor.tsx:166`, `SmsTemplateEditor.tsx:58`, lists) → single column on every iPad but 12.9"/13". No `<table>` in settings (only `AiAnalyticsTable.tsx:31`, `AiOrdersTable.tsx:106`). Verdict: most fluid surface; usable at 1024 but sparse and small-text.

## 8. Calendar / timeline / analytics

- `react-calendar-timeline` and `react-day-picker` are in `package.json` but **imported nowhere**. The split-mode timeline is a placeholder.
- Plan calendar (`features/plan/calendar/*`) is custom, compresses with no min-width or horizontal scroll (see §2 table).
- DeliveryWindowCalendar goes compact at ≤620px container (`DeliveryWindowCalendarDensity.flow.ts:5`); stays regular inside the 950 modal.
- Recharts only in `features/ai/components/AiAnalyticsBarList.tsx` (inside the 460px AI panel).

## 9. Theme tokens and where a tablet density could hook in

- Tokens are raw CSS variables in `:root,[data-theme="dark"]` (`index.css:13-275`) and `[data-theme="light"]` (`:277-~522`), exposed via `@theme inline` (`:524-578`). `data-theme` set pre-paint in `index.html` and by `app/theme/ThemeProvider.tsx:9`.
- Precedent for runtime overrides of Tailwind namespace variables: both theme blocks override `--radius-*` (`index.css:192-199`, `:432-439`).
- A `[data-density="touch"]` block or `@media (min-width:1000px) and (pointer:coarse)` can override `--spacing` and `--text-xs/sm/base` (currently undefined → Tailwind defaults). That rescales numeric `p-/m-/gap-/w-/h-` and `text-*` utilities but **not** arbitrary px values (`text-[10px]`, `w-[450px]`) nor JS constants; arbitrary rem values follow root font-size if that is changed.
- Hook points: next to `--breakpoint-desk` (`index.css:1239`); a `sizeClass`/`isTablet` field in `ViewportContext.ts`; the home constants in `homeDesktopLayout.domain.ts` / `useHomeDesktopLayout.ts`.
- `theme:regression` scripts (`scripts/`): `theme-codemod.mjs --check` (palette utilities must map via `theme-map.json`; **any new arbitrary `rounded-[…]` fails**), `theme-arbitrary-hex-codemod.mjs --check` (no `-[#hex]`; excludes printDocument, emailMessage, `shared/map`), `theme-shadow-codemod.mjs --check` (arbitrary shadows must map to `--shadow-*`), `theme-functional-color-guard.mjs` (no `rgb()/rgba()` literals outside the allowlist). None checks geometry or typography.

## 10. Twelve worst geometry problems, ranked

1. Default calendar column collapses: `calc(100vw-320px-rail)` → 254/154px at 1024, cells 5–28px, no min-width or scroll fallback (`homeDesktopLayout.domain.ts:66`, `planCalendar.store.ts:45`, `PlanCalendarBody.tsx:24`).
2. List view starves the map: 450 plan + 450/550 rail → map 124/24px at 1024 (`homeDesktopLayout.domain.ts:5`, `useHomeDesktopLayout.ts:51-53`, `HomeDesktopLayout.tsx:69`).
3. One breakpoint (999) and every home width a JS constant; `lg:`/`xl:`/`desk:` unused in the shell (`viewport.config.ts:6`, `ViewportContext.ts`).
4. Map overlays sized for a wide map inside a 24–320px `overflow-hidden` map; stats overlay never reaches its 860/1200 thresholds (`MapMultiSelectOverlay.tsx:68`, `ZoneMapOverlay.tsx:95`, `RouteGroupDriverCard.tsx:22,49`, `useRouteGroupStatsOverlayController.ts:27-28`, `MapArea.tsx:11`).
5. Very small text: 82× `text-[10px]`, 48× `[11px]`, 14× `[9px]`, ≈80 sub-11px rem values, 383× `text-xs`; no text token to scale from.
6. 28–32px controls everywhere (`Button.constants.ts`, `PlanCalendarHeader.tsx:55,71`); 53× `h-3 w-3` icons; `.touch-hit-area` unused on desktop; `isCoarsePointer` has 5 consumers.
7. No safe-area handling in the desktop shell; `h-screen`; `--vh` written but unread (`HomeAppPage.tsx`, `main.tsx:10-13`, `OrderLinkedDeviceLiveWidget.tsx:35`).
8. `ClassicLayout` becomes an edge-to-edge full-height column at 768 tall; `PopupFooter` on the home indicator (`ClassicLayout.tsx:40`, `PopupFooter.tsx:20`).
9. Order form hard 950px modal with fixed 560/350 columns; route-group edit form same pattern (`OrderFormShell.tsx:42`, `OrderFormDesktop.layout.tsx:25-27`, `RouteGroupEditFormDesktop.layout.tsx:11-12`).
10. Plan workspace rail fixed 550 with a 100px route rail → ≈449px for dense stop cards; opening a plan steals 100px from calendar/map instead of overlaying (`useHomeDesktopLayout.ts:52`, `RouteGroupRail.tsx:19`, `RouteGroupOrderCard.tsx:69-108`).
11. Fixed heights for tall monitors: `h-[420px]` ×4 order-detail tabs, `h-[370px]` delivery-window list, notifications `max-h-[420px]`, popups `min(86–92vh, 760–960)`.
12. Inputs 14px and the anti-zoom rule only ≤999px (`App.css:12,66`, `index.css:1282-1288`). Also: 460×640 AI panel ≈45% of width at 1024; split mode (the map-friendly layout) is a placeholder; admin has no standalone manifest.
