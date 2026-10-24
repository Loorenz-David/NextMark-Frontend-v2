# 03 — Touch interaction inventory (drag, long press, hover, scroll, tap targets, map)

Inventory taken 2026-10-24 from the code. Paths relative to `Front_end/`; `AA` = `admin-app/src`, `PK` = `packages`. Severity for touch on an iPad: **H** / M / L. Line numbers drift; re-grep the symbol before editing.

---

## 0. What the iPad actually gets today

- `AA/app/viewport/viewport.config.ts` puts the phone cut-off at 999px and exposes `(pointer: coarse)` and `(hover: hover)`. Landscape iPad (1024–1376) → **`isMobile=false`, `isCoarsePointer=true`, `hasHover=false`**: full desktop layout plus whatever coarse-pointer fixes exist (very few, see §9).
- **Tailwind v4 wraps `hover:` and `group-hover:` in `@media (hover: hover)`** and `AA/index.css` has no `@custom-variant hover` override. On an iPad all 242 `hover:` and 7 `group-hover:` utilities are inert. No sticky hover, but anything *revealed* by hover is never revealed. Plain-CSS `:hover` rules are not wrapped and **do** stick after a tap: `AA/shared/map/map.css:134,146,328` (marker/cluster scale-up).
- The 16px input-zoom guard applies only at `(max-width: 999px)` (`AA/index.css:1282`). Not in effect on iPad.
- `viewport-fit=cover` is set (`admin-app/index.html`) but the desktop shell never reads `env(safe-area-inset-*)`. Bottom controls can sit under the home indicator. M
- `.admin-mobile-shell` (overscroll none, no tap highlight, `touch-action: manipulation`, `AA/index.css:1268-1272`) is applied only by `HomeMobileShell.tsx`. The desktop shell root (`AA/features/home-app/pages/HomeAppPage.tsx`, `h-screen w-screen`) gets rubber-band bounce, tap flash and the double-tap delay. M

## 1. Drag and drop

**Main `DndContext`:** `AA/features/home-route-operations/providers/HomeRouteOperationsManagersProvider.tsx:107-134`. Sensors from `AA/features/plan/hooks/usePlanOrderDndController.tsx:120-128`: `MouseSensor {distance: 6}` + `TouchSensor {delay: 250, tolerance: 8}`; no `PointerSensor` (comment explains the iOS `pointercancel` problem; see commit `ca2be09`). Custom collision detection in `home-route-operations/dnd/collisionStrategies/*` (`pointerWithin`). `MeasuringStrategy.Always`. Auto-scroll thresholds x 10% / y 20%, acceleration 12, interval 8 → on touch it fires whenever the finger is in the top/bottom 20% of a scroll container (M). `DragOverlay dropAnimation={null}`; previews in `components/RouteOperationsDragOverlay.tsx`, drawn under the finger so the finger hides the target (M).

Drag sources (all inside `overflow-y-auto` lists):

| Source | File | Notes |
|---|---|---|
| Order card (whole card) | `AA/features/order/components/cards/DraggableOrderCard.tsx:56,124-132` | list in `order/pages/orderMain.page.tsx:114` |
| Address-group header | `cards/DraggableOrderAddressGroupCard.tsx`, `OrderAddressGroupCard.tsx:66-71` | same element toggles expand on tap |
| Order detail icon (48px) | `pageHeaders/DraggableOrderDetailIcon.tsx:13,33-38` | |
| "Drag to Plan" batch button | `order/components/OrderBatchPlanDragButton.tsx:15-44` | `onClick` is a no-op → touch users must hold. Rendered inside the map multi-select box (`OrderMapOverlay.tsx:67`, `shared/map/components/MapMultiSelectOverlay.tsx:67-68`, `w-72` = 288px). Map container clips (`layout/MapArea.tsx:11`); map is 124px wide at 1024 → **clipped. H** |
| Route stops (sortable, whole card) | `plan/routeGroup/components/cards/DraggableRouteGroupOrderCard.tsx:6,46-49`, `DraggableRouteGroupOrderGroupCard.tsx` | list `RouteGroupOrderList.tsx:118-124` inside the 550px plan panel |

Drop targets:

| Target | File |
|---|---|
| Plan cards | `plan/components/cards/DroppablePlanCard.tsx:14` (450px plan column) |
| Create-plan header | `plan/components/headers/PlanMainHeader.tsx:38` |
| Unschedule (min 132px, only while dragging) | `plan/components/UnscheduleDropTarget.tsx:33` |
| Calendar day cell (past disabled) | `plan/calendar/components/PlanCalendarDayCell.tsx:47` |
| Multi-plan day popover (opens on hover-while-dragging, closes after 220ms) | `PlanCalendarDayPlansOverlay.tsx:48`, `plan/calendar/controllers/useCalendarDayDragOverlay.controller.ts:29,73-93` |
| Route-group rail avatars | `plan/routeGroup/components/routeGroupRail/DroppableRouteGroupRailAvatar.tsx:15` |

Co-visibility at 1024px: order list → plan list **OK** (450 + 450 side by side). Order list → calendar: calendar is 254px → 7 columns ≈ 36px each (**H**). Route stop → calendar: 154px (**H**). Route stop → avatars: same panel, OK. Batch drag from map: clipped (**H**).

Other `DndContext`s (all vertical sortables, Mouse 6px + Touch 250ms):
- `AA/features/itemConfigurations/pages/ItemStatesPage.tsx:39-77` — whole card is the grab area (`:29-35`), **no `.dnd-touch-source`**. `ItemStateCard.tsx:48` Edit button only stops `onPointerDown`; dnd-kit Mouse/Touch sensors listen to `mousedown`/`touchstart`, so pressing Edit can start a drag. M (bug)
- `AA/features/clientFormConfig/pages/ClientFormRulesPage.tsx:27-87`, `components/ClientFormMediaPlacementGroup.tsx:33-90` — 28px handle (`SortableClientFormRow.tsx:23-37`), no `.dnd-touch-source`. L-M

Native HTML5 drag: none. Custom pointer drags:
- AI panel move: `PK/ai-panel/src/hooks/useAiPanelLayoutState.ts:89-139,148-160`, `components/AiPanelHeader.tsx:39`, `AiPanelLauncher.tsx:26-56`. Window `pointermove/up`, no `touch-action: none`, no `pointercancel` → iOS takes the gesture; drag dies or sticks. M-H (AI panel is currently not mounted; see `AppProviders.tsx` comment)
- Map drawing: §7. `usePlanPanelDrag.ts` is empty; no resizers or sliders.

## 2. Long press / press-and-hold

- The 250ms `TouchSensor` delay is the only hold mechanism. No custom long-press code, no `onContextMenu`, no `preventDefault` on touch events.
- `.dnd-touch-source` (`AA/index.css:689-694`: `user-select: none`, `-webkit-touch-callout: none`, `touch-action: manipulation`) applied in: `DraggableOrderCard.tsx:127`, `OrderAddressGroupCard.tsx:67`, `DraggableOrderDetailIcon.tsx:36`, `OrderBatchPlanDragButton.tsx:28`, `DraggableRouteGroupOrderCard.tsx:76`, `RouteGroupOrderGroupCard.tsx:49`. **Missing** on ItemStates and clientForm sortables. M
- Other `select-none`/`user-select`: `shared/buttons/DeleteButton.tsx:68,77`, `map.css:358`, `PK/ai-panel/src/styles.ts:212`.
- Event stopping so a tap does not start a drag: `shared/buttons/ThreeDotMenu.tsx:55-57,169-171` (stops pointerdown + mousedown + touchstart, correct). `ItemStateCard.tsx:48` stops only one.
- `PK/client-form-kit/src/hooks/useAutoAdvancePause.ts:31-37` pauses on hover/press (customer form). L

## 3. Hover-only affordances

Detection today: `useViewport()` gives `isCoarsePointer` / `hasHover` (`AA/app/viewport/ViewportProvider.tsx`). Two components run their own `matchMedia('(hover:none),(pointer:coarse)')`: `plan/components/cards/PlanCard.tsx:124`, `order/components/cards/ItemTypeCountsPill.tsx:69`. Generic helper `AA/lib/utils/useMediaQuery.ts`. `PK/client-form-kit/src/styles/client-form.css:98` has `@media (pointer: coarse)`.

Already adapted (tap toggles): `shared/layout/InfoHover/useInfoHoverController.ts:17-18` + `InfoHover.tsx:42-48` (18 usages; trigger ≈ 20px, `:10-11`, M); `ThreeDotMenu.tsx:91-120` → `ActionSheet` on coarse pointer; `RouteGroupRailAvatar.tsx:118-129,257-270` (second tap opens BottomSheet); `warnings/RouteStopWarnings.tsx:43-47`; `warnings/RouteSolutionWarnings.tsx:93-97`; `PlanCard.tsx:242`; `ItemTypeCountsPill.tsx:92`.

Hover-only with no touch path:

| What | File | Sev |
|---|---|---|
| Notification "mark read" button `opacity-0 group-hover:opacity-100` → invisible on iPad (still tappable blind) | `AA/realtime/notifications/AdminNotificationItem.tsx:156` | **H** |
| AI panel header (close/clear/drag) shown only on mouse-over, `opacity 0; pointer-events none` | `PK/ai-panel/src/components/AiPanelSurface.tsx:67-77`, `styles.ts:196-198` | **H** (when panel re-enabled) |
| Route-group stop-group warning popover; `onClick` only stops propagation | `plan/routeGroup/components/cards/RouteGroupOrderGroupCard.tsx:83-97` | M |
| Missing-info notifier hover popover (tap opens form; copy says "Click the warning icon") | `order/components/OrderMissingInfoNotifier.tsx:41-58` | L-M |
| Delivery-window day popover opens on hover only | `order/forms/orderForm/components/DeliveryWindowCalendar/components/calendar/DeliveryWindowCalendarCalendar.tsx:160-172`, `DeliveryWindowCalendarDayPopover.tsx:47-48` | M |
| Driver live marker preview, route-group map: `onClick` is a no-op → **no touch path** | `plan/routeGroup/flows/routeGroupMap.flow.ts:358-371` | **H** |
| Driver live marker preview, orders map: tap navigates instead of previewing | `order/flows/orderDriverLiveMap.flow.ts:82-95` | M |
| List ↔ map hover highlight (lost on touch; iOS emulated `mouseenter` leaves highlights stuck) | `order/components/lists/OrderList.tsx:68-69`, `OrderAddressGroupChildren.tsx:53`, `DraggableOrderCard.tsx:129-130`, `DraggableOrderAddressGroupCard.tsx:89-94`, `order/context/OrderProvider.tsx:99-147`, `order/flows/orderMapMarkers.flow.ts:208-219`, `orderMapData.flow.ts:268-279`, `shared/map/infrastructure/markers/MarkerLayerManager.ts:191-217`, `ClusterLayerManager.ts:344-347` | M |
| Date-picker range hover preview | `shared/calendar/ui/CalendarRoot.tsx:88-142`, `shared/inputs/CustomDatePicker/components/CustomDatePickerCalendarPanel.tsx:215` | L |
| 72 native `title=` tooltips | grep `title=` | L |
| FloatingPopover outside-press defaults to `mousedown` (36 usages); `ZoneDetailsPopover.tsx:67` listens to `document mousedown` | `AA/shared/popups/FloatingPopover/FloatingPopover.tsx:140`, `PK/shared-inputs/src/floating-popover/FloatingPopover.tsx:85` | L (works via emulated mouse events; verify) |

No `useHover`/`safePolygon` from `@floating-ui` anywhere.

## 4. Scroll

- **BottomSheet scroll trap:** `AA/shared/overlays/bottomSheet/BottomSheet.tsx:82-86` puts framer-motion `drag="y"` on the whole sheet; the scrollable body is inside (`:108-110`). framer sets `touch-action` that blocks vertical panning → body cannot be touch-scrolled. **H** on iPad because `ThreeDotMenu` → `ActionSheet` and `RouteGroupRailAvatar` use it.
- `AA/shared/hooks/useScrollHideActionBar.ts:19-90` is active ≥1000px (so on iPad); used in `order/pages/orderMain.page.tsx:76,117`. Toggles the header and animates `paddingTop` 220ms during momentum scroll → jump/jitter. M
- `AA/shared/inputs/CustomTimePicker/hooks/useSnapScroll.ts:119-175`, `components/TimeColumn.tsx:92-95`: snapping relies on `scrollend` (`:149-160`). WebKit added `scrollend` only recently; verify on the target iPadOS, else it never snaps. M
- `overscroll-contain` only in `BottomSheet.tsx:109`, `OrderFormMobile.layout.tsx:38`, `CustomInstructions.tsx:12`, `PK/client-form-kit/src/components/ClientFormSheet.tsx:218`. Desktop shell: none → end-of-list scroll chains to the body. M
- Horizontal rails: `shared/searchBars/SearchFilterBar/ActiveFilterPills.tsx:77`, `shared/layout/CustomInstructions/CustomInstructions.tsx:12`, `routeGroupRail/RouteGroupRail.tsx:20` (vertical ≥768px), `integrations/components/IntegrationsCarousel.tsx:20`, `ai/components/AiOrdersTable.tsx:105`, `AiAnalyticsTable.tsx:30`, `messaging/emailMessage/components/EmailEditableRegion.tsx:36-39`. Scroll-snap only in `PK/client-form-kit/src/components/ClientFormMediaCarousel.tsx:102-107`.
- `SlideCarousel` (inside InfoHover) has no swipe, dots in a 16px track (`shared/layout/slideCarousel/SlideCarouselDots.tsx:13`). M
- Programmatic scroll: `order/components/OrderDetailEventHistory.tsx:81`, `orderCase/pages/details/CaseDetailsPage.tsx:33,115`. 95 `overflow-y-auto` containers, no virtualization.

## 5. Tap targets

- Base button: `py-1.5` + `text-sm/xs` ≈ 28–32px (`AA/shared/buttons/Button.constants.ts:8-26`); `toolbarSecondary` (`py-1`) ≈ 28px; `rounded` is 40px.
- Totals: 218 `<button>`; 75 elements sized `h/w-5/6/7`; `text-[10px]` ×76; `text-[11px]` ×41; 22 buttons `text-xs`; `.touch-hit-area` (`AA/index.css:1257-1264`) used in 5 places only.
- Hot spots: selection checkbox 20px `text-[10px]` (`DraggableOrderCard.tsx:137`, H); group-overlay close ≈ 20px (`order/components/overlays/OrderMarkerGroupOverlay.tsx:89-96`, `RouteGroupMarkerGroupOverlay.tsx:66`, H); map overlay closes 24px (`MapMultiSelectOverlay.tsx:71`, `zone/components/ZoneMapOverlay.tsx:98`, M); erase button ≈ 28px (`MapDrawingSideControls.tsx:37-39`, M); calendar month chevrons 28px (`plan/calendar/components/PlanCalendarHeader.tsx:55,71`, M); `CostumerPanelDetailsMenuAction.tsx:16` 20px (M); `team/components/TeamNameEditorRow.tsx:36,44,58` 28px (M); `SortableClientFormRow.tsx:29` handle 28px; `OrderDetailHeader.tsx:80-86` "Close" at `text-[0.66rem]`; `PK/shared-message-handler/src/components/MessageCard.tsx:213` 24px.

## 6. Keyboard/mouse-only paths

- Escape handlers (13 files): `shared/stack-manager/StackActionManager.tsx:258`, `shared/popups/MainPopup/MainPopupProvider.tsx:24`, `shared/popups/featurePopup/FeaturePopupShell.tsx:27`, `plan/routeGroup/flows/routeGroupPageEscape.flow.ts:22`, `plan/routeGroup/popups/editRouteGroup/RouteGroupEditFormShell.tsx:25`, `order/flows/orderCircleSelection.flow.ts:116`, `plan/routeGroup/flows/routeGroupCircleSelection.flow.ts:134`, order/customer form close controllers, date/time pickers. All have a visible close too (some tiny, §5). L
- `p` shortcut suppression `HomeDesktopView.tsx:127-158`; `HomeRouteOperationsManagersProvider.tsx:32-47` Escape only `preventDefault`. L
- **Polygon finish needs double-click, no Finish button** (`shared/map/infrastructure/drawing/DrawingManagerService.ts:334-356`). H
- `TermsEditor.tsx:49-56,70,84` toolbar uses `onMouseDown`. L. Chat sends on Enter (`orderCase/components/OrderCaseChatComposer.tsx:22`). L
- No `onDoubleClick` in React, no context menus, no wheel zoom.

## 7. Map

- Init `AA/shared/map/infrastructure/core/MapInstanceManager.ts:53-58`: only `disableDefaultUI: true`; **`gestureHandling` never set** → Google's `auto` may resolve to "cooperative" (two-finger pan) when the page looks scrollable. No zoom buttons; pinch is the only zoom. M-H. `PK/shared-google-maps/googleMaps.globals.ts:52-76` types no gesture options.
- **Circle/rectangle selection drawing** `DrawingManagerService.ts:247-307` uses map `mousedown/mousemove/mouseup` with `draggable:false`; Google Maps does not emit reliable `mousemove` for touch → likely fails with a finger. **H** (device test)
- Polygon: tap adds point (`:313-331`), double-click finishes (`:334-356`). **H**. Zone editing (`:760-800`): Google's vertex handles are tiny. M
- Markers: click + hover on marker element (`MarkerLayerManager.ts:191-217`), 28px min (`map.css:3-5`). Cluster click zooms (`ClusterLayerManager.ts:336-342`). Group markers open a 320px overlay (`OrderProvider.tsx:149-162`, `OrderMarkerGroupOverlay.tsx:85`) → wider than the map at 1024. **H**
- Zone polygon/label click `GoogleMapAdapter.ts:579,600` OK. Multi-select is a mode toggled by `MapMultiSelectOverlay`; only keyboard exit is Escape.

## 8. framer-motion gestures

Only `drag` is `BottomSheet.tsx:82-86` (the §4 trap). No `whileHover`/`whileTap`/`onPan`.

## 9. Existing mobile/touch branches

- `useMobile`/`useViewport`: 39 call sites; `isMobile` on 113 lines in 52 files, **all** keyed to the ≤999px width → iPad takes the desktop path everywhere. Main switches: `HomeRouteOperationsPage.tsx:20,45`, `HomeAppPage.tsx`, `OrderMapOverlay.tsx:67`, `MainPopup/*`, `featurePopup/*`, `loadingPopup.tsx:49`, form shells (order, customer, route group), `settings/pages/SettingsPage.tsx:19`. `ai-panel` has its own width check (`useAiPanelLayoutState.ts:67`; 1000 set in `ai/providers/AdminAiPanelProvider.tsx:208`).
- `isCoarsePointer` used in **one** place (`ThreeDotMenu.tsx:91`). `hasHover` in 4 (`InfoHover` controller, `RouteGroupRailAvatar`, `RouteStopWarnings`, `RouteSolutionWarnings`).
- `desk:` variant only in `zone/forms/zoneForm/components/ZoneFormFields.tsx` (5 uses). Other prefixes: `md:` ×73, `xl:` ×12, `sm:` ×15, `lg:` ×0.

## 10. Ranked pain points (touch + geometry interplay)

1. Desktop columns leave the map 24–124px and the calendar 154–254px at 1024 (`useHomeDesktopLayout.ts:50-52`, `homeDesktopLayout.domain.ts:62-68`, `HomeDesktopLayout.tsx:69`).
2. BottomSheet swipe-to-close blocks scrolling of its own body (`BottomSheet.tsx:82-110`).
3. Map circle/rectangle selection is mouse-only (`DrawingManagerService.ts:275-307`).
4. Polygon finish needs double-click (`DrawingManagerService.ts:334`).
5. "Drag to Plan" batch button + 288px multi-select box clipped in the narrow map; button works only by holding (`MapMultiSelectOverlay.tsx:67`, `OrderBatchPlanDragButton.tsx:36`).
6. Calendar drop cells ≈ 36px while dragging; multi-plan popover depends on hover (`PlanCalendarDayCell.tsx:47`, `useCalendarDayDragOverlay.controller.ts:73-93`).
7. Notification mark-read invisible (`AdminNotificationItem.tsx:156`).
8. AI panel header hover-gated, drag without touch handling (`AiPanelSurface.tsx:67-77`, `useAiPanelLayoutState.ts:89-139`).
9. Driver live marker preview has no touch path on the route-group map (`routeGroupMap.flow.ts:358-371`).
10. `gestureHandling` unset (`MapInstanceManager.ts:53-58`).
11. Tiny controls: selection checkbox, group-overlay close, InfoHover trigger (≈20px).
12. Hover-only warning/day popovers (`RouteGroupOrderGroupCard.tsx:83-97`, `DeliveryWindowCalendarCalendar.tsx:160-172`, `OrderMissingInfoNotifier.tsx:41-58`).
13. Desktop shell lacks touch styles and safe-area padding (`index.css:1268-1291`, `HomeAppPage.tsx`).
14. Drag auto-scroll aggressive; preview under the finger (`HomeRouteOperationsManagersProvider.tsx:114-119`).
15. Sortables missing `.dnd-touch-source`; `ItemStateCard` Edit can start a drag; action-bar jitter (`useScrollHideActionBar.ts`); time picker relies on `scrollend` (`useSnapScroll.ts:149`).

## 11. Count table

| Category | Count |
|---|---|
| DnD | 4 `DndContext` (1 main + 3 sortable pages); 14 `useDraggable/useSortable/useDroppable`; 2 sensor configs (Mouse 6px + Touch 250ms/8px); 0 HTML5 drag; 2 custom pointer drags |
| Long press | 1 hold mechanism; 6 `.dnd-touch-source`; 3 missing; 0 `onContextMenu` |
| Hover | 7 `group-hover` (1 gating visibility); 242 `hover:` (all inert on iPad); ≈25 components with `onMouseEnter/Leave`; 7 hover-only without touch path; 6 adapted |
| Scroll | 95 `overflow-y-auto`; 8 horizontal rails; 1 snap carousel; 1 scroll-hide hook; 1 framer scroll trap; 0 virtualization |
| Tap targets | 218 `<button>`; 75 sized 5/6/7; 76 `text-[10px]`; 41 `text-[11px]`; 5 `.touch-hit-area` |
| Keyboard-only | 13 Escape files; 1 letter shortcut; 1 double-click (polygon) |
| Map | 0 gesture options; 3 mouse-only drawing listeners + 1 dblclick; 5 marker hover flows |
| framer-motion | 1 `drag` |
| Mobile branches | 39 `useMobile/useViewport`; 113 `isMobile` lines; 1 `isCoarsePointer`; 4 `hasHover`; 5 `desk:` |

## 12. Device tests required before relying on this

- Whether Google Maps emits `mousemove`/`dblclick` for touch, and what `gestureHandling: auto` resolves to in the installed app.
- Whether the target iPadOS supports `scrollend`.
- Whether iPadOS Safari zooms on small inputs in standalone mode.
