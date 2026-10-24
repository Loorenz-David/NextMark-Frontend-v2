# 09 — Content priority: what stays visible on a tablet

**Purpose:** on an iPad there is less room, so instead of shrinking everything we decide per element what the operator actually needs. The crucial elements then grow (Phase 3 tokens), the rest collapses behind a tap or hides.
**Who decides:** the user (product owner). **Who inventories:** Claude, 2026-10-24. **Status:** inventory complete (251 rows, 9 surfaces); decisions pending in the `Decision` column.

## How to fill the `Decision` column

| Mark | Meaning on tablet | Typical implementation |
|---|---|---|
| `K` Keep | Always rendered, may grow | token size bump only |
| `C` Collapse | Available behind one tap (expand row, InfoHover, ActionSheet, details panel) | `tablet` render variant moves it into the tap target |
| `H` Hide | Not rendered on tablet; still in the data and on desktop | `tablet` variant omits it |
| `?` | Needs discussion | listed in `08_SESSION_LOG.md` as an open question |

Rules of thumb: an operator at a counter needs **identity** (who / where / when), **status**, and **the next action**. Counts, provenance chips, secondary timestamps and duplicated information (shown again one tap deeper) are the usual `C`/`H` candidates. If two elements say the same thing, keep the one that is tappable.

## How decisions become code

- A component reads `sizeClass` from `useViewport()` and renders its `tablet` variant; shared pills/badges get the variant once in their own file. Data is never removed from stores, only from the render tree.
- Cards, chips and rows are implemented in Phase 3; headers, overlays and popups in Phase 4 (`06_PLAN.md`).
- Desktop (`sizeClass === 'desktop'`) renders exactly as today.

---

## Inventory (2026-10-24)

Paths relative to `Front_end/admin-app/src/`. Each surface defines short names for its files; rows cite `NAME:line`. Sizes are as written in the code today. "Not mounted" rows are components that exist but render nowhere; they are listed so a decision can retire or revive them.

**Never mounted today (nothing shows):** `ItemTypeCountsPill` (only exported, `features/order/index.ts:17`); `OrderMissingInfoNotifier` (only exported, `features/order/index.ts:14`); `RouteGroupStatsOverlay` (nothing imports it).

### 1. Order card (order list)
Files: OC=`features/order/components/cards/OrderCard.tsx` · OTB=`…/cards/OrderOperationTypeBadges.tsx` · OCIP=`…/cards/OrderCardItemPreviews.tsx` · IIP=`features/order/item/components/ItemCard/ItemImagePopover.tsx` · MIB=`…/cards/OrderCardMissingInfoBanner.tsx` · NT=`…/cards/OrderCardNotesTray.tsx` · SC=`shared/layout/StateCard.tsx` · DOC=`…/cards/DraggableOrderCard.tsx` · OAGC=`…/cards/OrderAddressGroupCard.tsx` · OAGCh=`features/order/components/lists/OrderAddressGroupChildren.tsx` · ITCP=`…/cards/ItemTypeCountsPill.tsx`
One row header plus item previews, a missing-info banner and a notes tray. Address groups wrap several cards.

| # | Element | Data source | Current size | Shown when | File:line | Decision |
|---|---|---|---|---|---|---|
| 1 | Archived badge (floating, top-right) | order.archive_at | text-[8px] uppercase | archive_at set | OC:89-93 |  |
| 2 | Order label (ref no. or #id) | reference_number (if external_source) / order_scalar_id | text-base semibold | always | OC:30-35,99-101 |  |
| 3 | Pickup/dropoff direction arrows | operation_type | h-5 w-5 circle, icon h-2.5 | operation_type resolves | OTB:12-15,23-30; OC:102 |  |
| 4 | External source pill | external_source | text-[0.55rem] uppercase | external_source set | OC:103-107 |  |
| 5 | "·" separator + street address | client_address.street_address ("No address") | text-xs truncate | always | OC:36,108-111 |  |
| 6 | Order state pill | order_state_id → name/color (StateCard) | text-xs, px-2 py-[3px] | state resolves | OC:114-121; SC:22-37 |  |
| 7 | Three-dot menu (Archive / Unarchive, confirm step) | archive_at, onArchive/onUnarchive | trigger h-7 w-7, menu 190px, confirm text-[10px] | a handler is passed | OC:40-75,122-132 |  |
| 8 | Item thumbnail (tap opens image popover) | item_previews[].image_urls / item_type | h-14 w-14 | per preview (placeholder if no image) | OCIP:34-49; IIP:63 |  |
| 9 | Article number | preview.article_number | text-sm truncate | per preview | OCIP:51-53 |  |
| 10 | "Position: …" | preview.item_position | text-xs | per preview | OCIP:54-56 |  |
| 11 | "Qty: …" | preview.quantity | text-xs | per preview | OCIP:57-59 |  |
| 12 | "+ N more items" | total_items − previewed qty | text-xs | extraCount>0 | OCIP:63-67 |  |
| 13 | Missing-info icon | validators → missing fields | h-5 w-5, icon h-3 | missing && !archive_at | MIB:28,40-42 |  |
| 14 | "Customer info missing" (field list only in title tooltip) | missingFields | text-xs truncate | same | MIB:43-48 |  |
| 15 | "Add" link (opens edit form) | client_id | text-xs semibold | same | MIB:50-60 |  |
| 16 | Note type label (tray under card) | order_notes[].type | text-[9px] uppercase | per note | NT:17,30-33 |  |
| 17 | Note content (clamped to 2 lines) | order_notes[].content | text-xs line-clamp-2 | per note | NT:34-39 |  |
| 18 | Selection circle (✓) | isSelected | h-5 w-5 text-[10px] | isSelectionMode | DOC:134-150 |  |
| 19 | Card hidden while dragging / batch-dragging | isDragging, batch selection | — | during drag | DOC:70,114-121 |  |
| 20 | Group: order-count bubble | group.orders.length | h-7 min-w-7 text-sm | group card | OAGC:72-78 |  |
| 21 | Group: address label | group.label | text-sm semibold truncate | group card | OAGC:80 |  |
| 22 | Group: "Grouped orders" caption | static | text-xs | group card | OAGC:81 |  |
| 23 | Group: expand chevron | expanded | h-3.5 w-3.5 | group card | OAGC:83-85 |  |
| 24 | Group: child order cards (full OrderCard each) | group.orders (capped) | — | expanded | OAGC:89-103; OAGCh:41-61 |  |
| 25 | Group: tree connector lines | — | 1px | expanded && >1 order | OAGCh:37-39,44-46 |  |
| 26 | Group: "Show all (N)" | group.orders.length | text-xs underline | expanded && over cap | OAGC:104-115 |  |
| 27 | (Not mounted) ItemTypeCountsPill: icon + count; tap/hover opens "Item Types" popover | itemCount, itemTypeCounts | icon h-3; title text-[10px]; rows text-xs | never rendered | ITCP:104-136 |  |

### 2. Order list header / toolbar
Files: OMH=`features/order/components/pageHeaders/OrderMainHeader.tsx` · SFB=`shared/searchBars/SearchFilterBar/SearchFilterBar.tsx` · AFP=`…/SearchFilterBar/ActiveFilterPills.tsx` · OMIN=`features/order/components/OrderMissingInfoNotifier.tsx` · OMP=`features/order/pages/orderMain.page.tsx`
Panel title and counts, then search/filter/create/menu, filter pills and a selection-mode row. On desktop the stack floats and hides on scroll.

| # | Element | Data source | Current size | Shown when | File:line | Decision |
|---|---|---|---|---|---|---|
| 1 | Orders icon (panel header) | static | h-6 w-6 | always | OMH:93 |  |
| 2 | "Orders" title | static | panel title default | always | OMH:82 |  |
| 3 | Info hover (i) | ORDER_MAIN_HEADER_INFO | InfoHover default | always | OMH:83 |  |
| 4 | "N orders • N items" | orderStats.orders.total / items.total | text-xs | always | OMH:76-77,85-88 |  |
| 5 | Search input | query.q → applySearch | text-xs | always | OMH:121-127; SFB:160-168 |  |
| 6 | Filter (funnel) button | onOpenFilters | icon h-4 w-4 | always | SFB:170-185 |  |
| 7 | Active-filter count | activeFilterCount | text-xs semibold | count>0 | SFB:186-190; OMH:70-73 |  |
| 8 | "+ Order" button | onCreate | text-xs, icon h-3 w-3 | always | OMH:129-140 |  |
| 9 | Three-dot: "Auto create plans" (action is a no-op) | — | dots 3×3px | always | OMH:141-149 |  |
| 10 | Three-dot: "Selection mode" / "Exit selection" | isSelectionMode | same menu | always | OMH:150-162 |  |
| 11 | Filter pill label (one row, horizontal scroll) | query.filters via formatOrderFilterPill | text-xs medium | per active filter | OMH:63-69,166-173; AFP:71,77-90 |  |
| 12 | Pill remove (×) | removeFilter | h-3 w-3 | per pill | AFP:92-103 |  |
| 13 | "Clear selection" | onClearSelection | text-xs | isSelectionMode | OMH:174-184 |  |
| 14 | "Select all filtered" | onSelectAllFiltered | text-xs | isSelectionMode | OMH:186-194 |  |
| 15 | "Exit selection" + × | onExitSelectionMode | icon h-3 w-3 | isSelectionMode | OMH:196-205 |  |
| 16 | Built-in filter popover (options / id lists / date range) | config | text-sm / text-xs | only when no onOpenFilters; unused here | SFB:175-178,195-325 |  |
| 17 | Floating stack that hides on scroll | useFloatingActionStack | — | desktop behaviour | OMH:103-119; OMP:111 |  |
| 18 | (Not mounted) OrderMissingInfoNotifier: yellow "!" button, popover "Missing information", field list, hint | missingFields | h-7 w-7; text-xs; hint text-[11px] | never rendered | OMIN:39-71 |  |

### 3. Plan card (plan list) + plan list header
Files: PC=`features/plan/components/cards/PlanCard.tsx` · DPC=`…/cards/DroppablePlanCard.tsx` · PMH=`features/plan/components/headers/PlanMainHeader.tsx` · UDT=`features/plan/components/UnscheduleDropTarget.tsx` · PDFB=`features/plan/components/planDateFilter/PlanDateFilterBar.tsx` · PCVT=`features/plan/calendar/components/PlanContainerViewToggle.tsx` · PDS=`features/plan/views/PlanDesktopShell.tsx`
Card: avatar, label, date and state on top, a five-stat row below. Header: title/counts, create, date stepper, unschedule slot, view toggle.

| # | Element | Data source | Current size | Shown when | File:line | Decision |
|---|---|---|---|---|---|---|
| 1 | Plan-type avatar | resolvePlanType(plan) → icon | h-10 w-10, icon h-5 w-5 | always | PC:162-174,339 |  |
| 2 | Green "+" avatar | isOver (DroppablePlanCard) | h-5 w-5 | order dragged over | PC:154-161; DPC:23-40 |  |
| 3 | Busy spinner ring | useIsPlanOrderMutating(plan.id) | -inset-[3px] ring | order moves in flight | PC:352-357 |  |
| 4 | Plan label | plan.label | text-base semibold | always | PC:179-181 |  |
| 5 | Drop feedback chip ("N moved" / "Move failed") | dropFeedback | text-[11px] | briefly after a drop | PC:182-203 |  |
| 6 | Date / date range ("TBD" fallback) | start_date / end_date | text-xs | always | PC:205-207,368-400 |  |
| 7 | Plan state pill | state_id → name/color (StateCard) | text-xs | state resolves | PC:210-217 |  |
| 8 | Zone count (local delivery) or plan-type short label | route_groups_count / PLAN_TYPE_SHORT_LABELS | text-[12px], icon h-3 | always | PC:221-235 |  |
| 9 | "N Orders" | total_orders | text-[12px] | always | PC:236-239 |  |
| 10 | Item count; hover/tap opens "Item Types" popover (copy of ItemTypeCountsPill code) | total_items / item_type_counts | text-[12px]; popover text-[10px]/text-xs | always | PC:59-135,240-288 |  |
| 11 | Weight | total_weight | text-[12px], icon h-2 w-2 | always | PC:289-292 |  |
| 12 | Volume | total_volume | text-[12px], icon h-3 | always | PC:293-296 |  |
| 13 | Active-card highlight; tap opens plan | baseControlls.payload.planId | border/ring | plan is open | PC:41-44,141-149 |  |
| 14 | Header: plan icon tile | static | h-8 w-8 | always | PMH:50-52 |  |
| 15 | Header: "Plans" title | static | text-lg semibold | always | PMH:131-133 |  |
| 16 | Header: info hover | PLAN_MAIN_HEADER_INFO | default | always | PMH:134 |  |
| 17 | Header: "N plans • N orders • N items" | planStats.*.total | text-xs | always | PMH:124-149 |  |
| 18 | "fold" side tab (close) | onRequestClose | text-[9px] uppercase + chevron h-5 | showCloseButton | PMH:56-58,99-121 |  |
| 19 | "+ Plan" button (also a drop target that creates a plan) | onCreate / isCreatePlanOver | icon h-4 w-4 | always | PMH:63-79 |  |
| 20 | Unschedule drop slot ("Unschedule" / "N moved") | drag state / unscheduleDropFeedback | text-xs uppercase, min-w-[132px] | order drag active or feedback | PMH:88; UDT:48,64-84,96-105 |  |
| 21 | Calendar / List toggle | planCalendar.store containerView | text-[12.5px] | desktop list view | PMH:89; PCVT:22-36; PDS:27-33 |  |
| 22 | Date filter: previous arrow | goToPrevious | h-8 w-8, icon h-4 | mode ≠ range | PDFB:62-71 |  |
| 23 | Date filter: date label (opens calendar picker) | displayLabel | text-sm medium | mode ≠ range | PDFB:74-105 |  |
| 24 | Date filter: range start "|" range end | displayRangeLabel | text-xs | mode = range | PDFB:106-171 |  |
| 25 | Date filter: next arrow | goToNext | h-8 w-8 | mode ≠ range | PDFB:175-184 |  |
| 26 | Date filter: mode button (funnel) | controller.mode | icon h-5 w-5 | always (bar fixed w-[200px]) | PDFB:61,186-211 |  |

### 4. Plan calendar (desktop only)
Files: PCH=`features/plan/calendar/components/PlanCalendarHeader.tsx` · PCB=`…/PlanCalendarBody.tsx` · PCDC=`…/PlanCalendarDayCell.tsx` · PCPC=`…/PlanCalendarPlanChip.tsx` · PCDPO=`…/PlanCalendarDayPlansOverlay.tsx` · PCP=`features/plan/calendar/pages/PlanCalendar.page.tsx`
Header with stepper, toggle and create; 7-column month grid with week gutter; one chip per day plus "+N more" opening an overlay of full PlanCards.

| # | Element | Data source | Current size | Shown when | File:line | Decision |
|---|---|---|---|---|---|---|
| 1 | Plan icon tile | static | 42px tile, icon h-5 | always | PCH:30-32 |  |
| 2 | "Plans" title | static | text-[19px] bold | always | PCH:35-37 |  |
| 3 | "N plans · N orders · N items" | stats.* | text-[12.5px] truncate | always | PCH:38-42 |  |
| 4 | Unschedule drop slot | as §3 #20 | text-xs | during order drag | PCH:48 |  |
| 5 | Previous month | onStepPrevious | h-7 w-7, icon h-4 | always | PCH:51-58 |  |
| 6 | Month title (tap goes to today) | title | text-sm semibold, min-w-[96px] | always | PCH:59-66 |  |
| 7 | Next month | onStepNext | h-7 w-7 | always | PCH:67-74 |  |
| 8 | Calendar / List toggle | viewToggle | text-[12.5px] | always | PCH:77; PCP:62 |  |
| 9 | "+ Plan" button | onCreatePlan | text-[13px], icon h-3.5 | always | PCH:79-90 |  |
| 10 | Weekday labels row | CALENDAR_WEEKDAY_LABELS | text-[10px] mono uppercase | always | PCB:55-62 |  |
| 11 | Week-number gutter "V##" | getRoutePlanIsoWeekNumber | text-[10px] mono, 28px column | per week | PCB:24,73-81 |  |
| 12 | Day number (today as filled chip) | dayNumber / isToday / inMonth | text-[12px] mono, 22px | always | PCDC:125-137 |  |
| 13 | Past-day dimming | cell.isPast | opacity-55 | past days | PCDC:121 |  |
| 14 | Drop-target ring | isOver && !isPast | ring | during drag | PCDC:116-117 |  |
| 15 | Dashed "+" create-for-day button | onCreateForDate | min-h-[26px], icon h-3.5 | no plans && not past | PCDC:186-194 |  |
| 16 | First plan chip | plans[0] | see #18-24 | ≥1 plan | PCDC:139-149 |  |
| 17 | "+ N more plans" (opens overlay) | plans.length−1 | text-[10.5px] | ≥2 plans | PCDC:150-176 |  |
| 18 | Chip tint (state colour only; no state text; plan label only in tooltip) | state_id → color, plan.label | — | always | PCPC:42,66-73 |  |
| 19 | Plan-type icon + busy spinner | planType / isBusy | h-3 w-3 | always / spinner if busy | PCPC:79-90 |  |
| 20 | "N ord" | total_orders | text-[12px] semibold | always | PCPC:91-96 |  |
| 21 | Drop feedback "+N" / "failed" | planDropFeedback | text-[10px] | briefly after a drop | PCPC:97-110 |  |
| 22 | Volume load bar (capacity detail only in tooltip) | total_volume vs vehicle capacity | h-1 bar | always | PCPC:48-58,113-122 |  |
| 23 | Volume value | total_volume | text-[10px] mono | always | PCPC:123-125 |  |
| 24 | "N pcs · N kg" | total_items / total_weight | text-[9px] | always | PCPC:128-131 |  |
| 25 | Overlay: date heading | dateKey | text-[10px] mono uppercase | overlay open | PCDPO:66-69 |  |
| 26 | Overlay: "N plans" | plans.length | text-[11px] | overlay open | PCDPO:70-72 |  |
| 27 | Overlay: full PlanCard per plan (all of §3 #1-13) | plans | w-[min(92vw,400px)], max-h-[440px] | overlay open | PCDPO:64,75-83 |  |

### 5. Route group workspace
Files: RGP=`features/plan/routeGroup/pages/RouteGroups.page.tsx` · RGPC=`…/pages/RouteGroupsPageContent.page.tsx` · RGH=`…/components/pageHeaders/routeGroupPageHeader.tsx` (header + RouteGroupsActionBar) · ROD=`…/components/RouteOptimizationDropdownButton.tsx` · RGR=`…/components/routeGroupRail/RouteGroupRail.tsx` · RGRA=`…/routeGroupRail/RouteGroupRailAvatar.tsx` · RGRP=`…/routeGroupRail/RouteGroupRailPopoverContent.tsx` · RGOL=`…/components/RouteGroupOrderList.tsx` · RGBL=`…/components/cards/RouteGroupBoundaryLocationCard.tsx` · RGOC=`…/cards/RouteGroupOrderCard.tsx` · SOA=`…/cards/StopOrderAvatar.tsx` · RGOGC=`…/cards/RouteGroupOrderGroupCard.tsx` · RSW=`…/components/warnings/RouteStopWarnings.tsx` · RSoW=`…/warnings/RouteSolutionWarnings.tsx` · RGRF=`…/components/RouteGroupReadyFooter.tsx` · STATS=`…/components/overlays/RouteGroupStatsOverlay/`
Header with title and stats, a 100px rail of zone avatars, an action bar with optimize, a stop list (boundary, stop, group cards) ending in "Ready for Delivery". The stats overlay exists but is not mounted.

| # | Element | Data source | Current size | Shown when | File:line | Decision |
|---|---|---|---|---|---|---|
| 1 | Empty state "No Route Groups Yet" + "Create Route Group" | !hasRouteGroups | text-lg / text-sm | no groups | RGP:135-165 |  |
| 2 | Empty state "Select a Route Group" | !hasActiveRouteGroup | text-lg / text-sm | none selected | RGPC:65-76 |  |
| 3 | Loading skeleton list | is_loading / hydrating | — | optimizing or hydrating | RGPC:83-101 |  |
| 4 | Back button | onRequestClose | default | isMobile | RGH:131-133 |  |
| 5 | Plan-type icon tile | static | icon h-6 w-6 | always | RGH:134-136 |  |
| 6 | Title | summary.title | text-lg semibold truncate | always | RGH:139 |  |
| 7 | "N orders • N items • m³ • kg" | summary.* | text-[11px] | always | RGH:140-144 |  |
| 8 | Subtitle | summary.subtitle | text-[11px] | when present | RGH:145-149 |  |
| 9 | "Close" text button | onRequestClose | default | !isMobile | RGH:153-164 |  |
| 10 | Rail: "New Group" button | onCreate | 48px circle, text-[10px] | always | RGR:21-36 |  |
| 11 | Rail layout: 100px column (md+), horizontal row below md | — | w-[100px] | always | RGR:19-20 |  |
| 12 | Avatar: completion fill in state colour | completionRatio, stateColor | h-12 w-12 | per group | RGRA:144-197 |  |
| 13 | Avatar: "NN%" | completionRatio | text-[11px] semibold | per group | RGRA:198-236 |  |
| 14 | Avatar: group label | item.label | text-xs line-clamp-2 | per group | RGRA:238-246 |  |
| 15 | Avatar: state pill (StateCard scaled 0.92) | stateLabel / stateColor | text-xs | stateLabel set | RGRA:247-253 |  |
| 16 | Avatar: drop "+" / incoming-order pulse | isDropTarget / pulseSequence | — | drag / after a move | RGRA:133-143,206-216 |  |
| 17 | Group stats popover (hover) or BottomSheet (tap): label, zone, Completion, Orders, Active orders, Items, Weight, Volume, State (count), Progress points, Next state, Missing to next | RouteGroupRailItem | w-56, text-xs | hover / tap | RGRA:257-293; RGRP:28-78 |  |
| 18 | Action bar: "+ Order" | handleCreateOrder | icon h-4 | !is_loading | RGH:55-64,199 |  |
| 19 | Action bar: "Edit" | handleEditLocalPlan | icon h-4 | !is_loading | RGH:65-74 |  |
| 20 | Three-dot: Update optimization / Download route / Import orders (CSV) | page actions, importControls | icons h-4 / h-6 | !is_loading | RGH:76-103 |  |
| 21 | "Optimize route" / "Update optimization" dropdown | showOptimizeRow | text-sm, icon h-5 | orders>0 && (not optimized or warnings) | RGH:106-110,190-195; ROD:53-58 |  |
| 22 | Dropdown rows: variant label + "Best" / "Loading" / "Preview" / ✓ | routeSolutionsOrdered | text-sm / text-[10px] | dropdown open | ROD:71-122 |  |
| 23 | "Select this route" / "Re-optimize" | previewedSolutionId / isSelectedSolutionOptimized | default | open && condition | ROD:127-155 |  |
| 24 | Action bar floats/hides on scroll (desktop) | useRouteGroupActionBarVisibility | 82 / 138px reserved | desktop | RGPC:13-14,40-63 |  |
| 25 | Start boundary card: "<strategy> · label", street, time pill | boundaryLocations.start, route_end_strategy | label text-[0.6rem] uppercase; text-xs | start location set | RGOL:103-108,138-148; RGBL:35-51 |  |
| 26 | Stop number avatar | displayStopOrder / stop_order ("--") | h-7 w-7 text-sm | always | RGOC:46-51,73; SOA:14-31 |  |
| 27 | Order label (ref no. or #id) | reference_number / order_scalar_id | text-base semibold | always | RGOC:34-39,77-79 |  |
| 28 | Direction arrows | operation_type | h-5 w-5 | resolves | RGOC:80-82 |  |
| 29 | "·" + street address | client_address.street_address | text-xs truncate | always | RGOC:83-86 |  |
| 30 | Stop warning triangle | reason_was_skipped / constraint_warnings / has_constraint_violation | h-7 w-7, icon h-4 | warnings exist AND state resolves | RGOC:88-90; RSW:21-26,36-52 |  |
| 31 | Stop warning popover: skipped reason; violation list with expected/allowed times and slack | stop.* | w-72; text-[0.85rem] / [0.72rem] | hover, or tap without hover | RSW:54-105,122-158 |  |
| 32 | Order state pill | order_state_id | text-xs | state resolves | RGOC:91-94 |  |
| 33 | Item previews (as §1 #8-12) | item_previews | h-14 thumbs, text-sm/xs | previews exist | RGOC:99-102 |  |
| 34 | ETA pill / loading pill / "--" | stop.expected_arrival_time | text-xs, icon h-3 | ETA known / loading / none | RGOC:41-44,103-116 |  |
| 35 | Missing-info banner (as §1 #13-15) | validators | text-xs | missing && !archived | RGOC:121-124 |  |
| 36 | Notes tray (as §1 #16-17) | order_notes | text-[9px] / text-xs | notes exist | RGOC:126 |  |
| 37 | Group stop: "first to last" stop avatars | firstStopOrder / lastStopOrder | h-5 w-5 text-[10px] | group card | RGOGC:54-64 |  |
| 38 | Group stop: label | group.label | text-sm semibold truncate | group card | RGOGC:69-71 |  |
| 39 | Group stop: warning icon + popover "Order stop -- has warning." (placeholder text; hover only) | group.hasWarnings | h-7 w-7; text-[0.85rem] | hasWarnings | RGOGC:74-101 |  |
| 40 | Group stop: chevron | expanded | h-3.5 w-3.5 | group card | RGOGC:102-104 |  |
| 41 | Group stop: ETA range "hh:mm - hh:mm" | minEta / maxEta | text-xs | group card | RGOGC:22-31,107-111 |  |
| 42 | Group stop: child stop cards | group.entries | — | expanded | RGOGC:115-122 |  |
| 43 | Unrouted order cards (no stop) | missingOrders | as #26-36 | some orders not routed | RGOL:191-199 |  |
| 44 | Incoming order placeholders | incomingPendingOrderPlaceholderKeys | skeleton | pending inserts | RGOL:200-202 |  |
| 45 | End boundary card | boundaryLocations.end | as #25 | end location && groups>0 | RGOL:203-216 |  |
| 46 | Route warning triangle (inside boundary time pill) | warnings filtered by registry | h-7 w-7 | registered warnings exist | RSoW:76,86-101 |  |
| 47 | Route warning popover: title, "Resolve", messages + meta | registry.getMessage / getDisplayMeta | w-72; text-[10px] / [0.85rem] | hover / tap | RSoW:104-150 |  |
| 48 | "Ready for Delivery" full-width button | routeReadyForDelivery | py-3.5, icon h-5 | state "open" && orders>0 | RGOL:218-222; RGRF:12-30 |  |
| 49 | (Not mounted) Stats overlay: "Stats" / "Hide" toggle | hidden | text-md / text-sm | never | STATS/RouteGroupStatsOverlay.tsx:10; …Shell.tsx:117-152 |  |
| 50 | (Not mounted) Driver card: name, registration, initials avatar | data.driver | text-sm, avatar h-12 | — | STATS/RouteGroupDriverCard.tsx:18-52 |  |
| 51 | (Not mounted) Route summary grid: distance, duration, stops breakdown | routeSummary.rows | value text-sm, label text-[11px] | — | STATS/InlineRouteMetric.tsx:33-57; controller:422-515 |  |
| 52 | (Not mounted) Consumption: stops/hour, fuel cost, CO₂ | consumptionMetrics | text-sm / text-xs | — | STATS/RouteGroupConsumptionStatsColumn.tsx:55-110 |  |
| 53 | (Not mounted) Curve cards: timing, capacity, completion | gaussianCards | min-h-[150px]; panel max-h-[40vh] | — | STATS/GaussianMetricCard.tsx:152-244 |  |

### 6. Order details
Files: ODH=`features/order/components/pageHeaders/OrderDetailHeader.tsx` · DODI=`…/pageHeaders/DraggableOrderDetailIcon.tsx` · ODP=`features/order/pages/orderDetail.page.tsx` · ODS=`features/order/components/OrderDetailSummary.tsx` · ODN=`…/OrderDetailNotesTab.tsx` · ODTW=`…/OrderDetailTimeWindows.tsx` · TRC=`…/cards/TimeRangeCard.tsx` · ODPC=`features/order/controllers/useOrderDetailPage.controller.ts` · ODEH=`…/OrderDetailEventHistory.tsx` · OETI=`…/OrderEventTimelineItem.tsx` · IOP=`features/order/item/components/ItemsOrderPreview/ItemsOrderPreview.tsx` · IOPS=`…/ItemsOrderPreviewSticky.layout.tsx` · IC=`features/order/item/components/ItemCard/ItemCard.tsx`
Header card above a 4-panel carousel (Summary, Notes, Windows, History; each `h-[420px]`, ODP:47-84,151-156), then a sticky items list.

| # | Element | Data source | Current size | Shown when | File:line | Decision |
|---|---|---|---|---|---|---|
| 1 | Draggable order icon tile | order | h-12 w-12, icon 22px | always | ODH:64-70; DODI:36-40 |  |
| 2 | Title "# id" or reference | reference_number / order_scalar_id | text-[0.98rem] semibold | always | ODH:188-193,208-210 |  |
| 3 | External source pill | external_source | text-[0.54rem] uppercase | set | ODH:211-215 |  |
| 4 | "Plan: …" / "Unscheduled" | planMeta.planLabel / isUnscheduled | text-[0.72rem], max-w-[150px] | headerBehavior "order-main-context" | ODH:194,217-225 |  |
| 5 | "Date: …" | planMeta.planDateLabel | text-[0.72rem] | plan meta && date | ODH:226-236 |  |
| 6 | "Arrival: …" | planMeta.arrivalTimeLabel | text-[0.72rem] | arrival known | ODH:237-247 |  |
| 7 | "Close" button | onClose | text-[0.66rem] uppercase, min-w-[116px] | always | ODH:80-90 |  |
| 8 | "Edit" button | openOrderForm | text-sm, min-w-[116px] | always | ODH:92-104 |  |
| 9 | State dropdown "Mark as <next>" plus state list | registry next state / OrderStateList | 14px, 220–270px wide | always | ODH:108-134 |  |
| 10 | Summary: "Customer Details" heading | static | text-[10px] uppercase | always | ODS:51-53 |  |
| 11 | Help-to-carry icon | help_to_carry | h-5 w-5 | true | ODS:54-59 |  |
| 12 | "Missing order info" button | missingRequiredFields | text-[10px] uppercase | missing && order.id | ODS:40-41,63-73 |  |
| 13 | State pill (own inline style, not StateCard) | orderState.name/color | text-[0.64rem] uppercase | state set | ODS:75-86 |  |
| 14 | Customer name card | client_first_name / client_last_name | label text-[10px]; value text-[0.98rem] | always | ODS:92,195-207 |  |
| 15 | Email (mailto) | client_email | same | always ("—") | ODS:93-107 |  |
| 16 | Phone (tel) | client_primary_phone | same | always ("—") | ODS:108-122 |  |
| 17 | Second phone | client_secondary_phone | same | always ("—") | ODS:123-137 |  |
| 18 | Address (Maps link, spans 2 columns) | client_address.street_address | same | always ("—") | ODS:138-157 |  |
| 19 | Tracking number + "Copy" | tracking_number / tracking_link | mono; Copy text-xs | tracking info exists | ODS:159-181 |  |
| 20 | "Created at" footer | creation_date | text-[0.72rem] | always | ODS:185-190 |  |
| 21 | Notes: "Order Notes" heading / "No notes available." | static | text-[10px] / text-sm | always / 0 notes | ODN:29-39 |  |
| 22 | Note type label | NOTE_TYPE_LABEL | text-[10px] uppercase | per note | ODN:50-54 |  |
| 23 | Note three-dot (Edit / Delete with confirm) | note.type, canEditOrderNote | h-8 w-8; menu w-[180px] text-sm | per note | ODN:55-77,103-160 |  |
| 24 | Note content (full text) | note.content | text-sm leading-6 | per note | ODN:79-81 |  |
| 25 | Windows: "Delivery Windows" heading | static | text-[10px] | always | ODTW:31-34 |  |
| 26 | Windows: stop-warning triangle (header right) | timeWindowHeaderAddon | h-7 w-7 | opened from a route stop | ODTW:35-39; ODPC:89-90 |  |
| 27 | Windows: date group label | delivery_windows[].start_at | text-[10px] uppercase | per date (repeated per window on same date) | ODTW:51-53 |  |
| 28 | Windows: time range pill | start_at / end_at | icon max-h-4 | per window | ODTW:55-61; TRC:19-30 |  |
| 29 | Windows: "No time windows set." | — | text-sm | none | ODTW:66-71 |  |
| 30 | History: "Event History" heading | static | text-[10px] | always | ODEH:116-119 |  |
| 31 | History: refresh button | loadOrderEvents | icon h-3.5 | orderId set | ODEH:121-143 |  |
| 32 | History: "N events" | visibleEventCount | text-[10px] uppercase | loaded | ODEH:145-149 |  |
| 33 | History: no-id / loading / empty states | — | text-sm | conditional | ODEH:157-185 |  |
| 34 | History: day group label | group.label | text-[0.62rem] uppercase | per group | ODEH:189-193 |  |
| 35 | Event node dot (tone colour; pings when action pending) | tone / hasPendingAction | h-4 / h-2 | per event | OETI:204-217 |  |
| 36 | Event label + time | item.label / item.time | text-sm / text-[0.7rem] | per event | OETI:226-233 |  |
| 37 | Detail line | item.detail | text-xs | detail set | OETI:235-237 |  |
| 38 | Actor chip (initial, name, role pill) | item.actor | text-xs; role text-[0.58rem] | always | OETI:121-151,239-241 |  |
| 39 | Drawer toggle "N changes · N actions · status" | changeCountLabel / actionSummary | text-xs, chevron h-3 | changes or actions exist | OETI:243-283 |  |
| 40 | Drawer: change rows (label, scope chip, from → to) | item.changes | text-xs / [0.6rem] | expanded | OETI:70-113,291-303 |  |
| 41 | Drawer: action rows (label, channel, status, attempts, scheduled, error) | item.actions | text-xs / [0.68rem] | expanded | OETI:153-191,304-318 |  |
| 42 | Focus highlight (from a notification deep link) | isHighlighted | ring | focusEventId set | OETI:221-225 |  |
| 43 | Items: "Items" + "N items • kg • ㎥" | calculateOrderItemStats | text-sm / text-xs | always (sticky) | IOPS:35-42; ODP:166-171 |  |
| 44 | Items: print-labels button (with progress) | printTemplates (item event) | h-8 w-8 | a matching template exists | IOP:97-123; IOPS:45-60 |  |
| 45 | Items: "+ Item" | onAddItem | default | always | IOPS:62-70 |  |
| 46 | Items: loading / "No items yet." / "Items are available after…" | — | text-xs | conditional | IOPS:83-108; ODP:176 |  |
| 47 | ItemCard: thumbnail (popover) | item images | h-14 w-14 | images exist | IC:90-92 |  |
| 48 | ItemCard: item type / article / position | item_type / article_number / item_position | text-sm / text-xs / text-[11px] | always | IC:94-104 |  |
| 49 | ItemCard: state pill ("No state") + "Qty" | item state / quantity | text-xs | always | IC:106-114 |  |
| 50 | ItemCard expanded: delete (confirm), edit, rows (type, article, qty, position, reference, dimensions, weight, custom properties) | item.* | text-xs | expanded | IC:117-200 |  |

### 7. Home desktop header + notifications
Files: HDH=`features/home-app/components/HomeDesktopHeader.tsx` · TT=`app/theme/ThemeToggle.tsx` · AUB=`features/auth/trusted-device/components/ActingUserButton.tsx` · ANT=`realtime/notifications/AdminNotificationsTrigger.tsx` · ANAT=`…/AdminNotificationsAlertToggle.tsx` · ANI=`…/AdminNotificationItem.tsx`
Theme toggle and acting user left; bell and Settings right. The bell opens a 360px list of rows.

| # | Element | Data source | Current size | Shown when | File:line | Decision |
|---|---|---|---|---|---|---|
| 1 | Theme toggle | theme | h-9 w-9, icon h-5 | always | HDH:15; TT:58-62 |  |
| 2 | Acting user (avatar, name, chevron) | useActiveAuthUser / canSwitch | avatar h-6; text-sm max-w-[10rem] | trusted_device mode only | HDH:16; AUB:38-70 |  |
| 3 | Bell button | — | icon h-4.5 | always | HDH:22; ANT:190-202 |  |
| 4 | Unread badge ("99+" cap) | unreadCount | text-[10px], min 20px | unread>0 | ANT:205-215 |  |
| 5 | Arrival pulse/wiggle + chime | arrivals | — | briefly on arrival | ANT:77-97,166-188 |  |
| 6 | "Settings" button | navigate('/settings') | icon h-4 | always | HDH:24-34 |  |
| 7 | Popover: "Notifications" heading | static | text-sm semibold | popover open | ANT:105-107,122-124 |  |
| 8 | Alert toggle pill (on / off / blocked) | alert state | text-[0.68rem] | popover open | ANT:108,125; ANAT:31-37 |  |
| 9 | "Clear all" | items | text-sm underline | items exist | ANT:127-139 |  |
| 10 | "No unread notifications." | — | text-sm | 0 items | ANT:100-115 |  |
| 11 | Row: actor avatar (initial, or bell for system) | actor.kind / initial | h-9 w-9 text-sm | per row | ANI:56-74 |  |
| 12 | Row: event badge icon (created/updated/status/deleted/message/route/generic) | item.badge | 1.1rem, icon h-2.5 | per row | ANI:27-48,75-79 |  |
| 13 | Row: "<actor> <verb> <subject>" or title | item.headline / item.title | text-sm line-clamp-2 | per row | ANI:102-114 |  |
| 14 | Row: detail lines | item.detailLines | text-xs line-clamp-2 each | lines exist | ANI:116-128 |  |
| 15 | Row: relative time | occurredAt | text-[0.68rem] | per row | ANI:89,130-131 |  |
| 16 | Row: "· actor name" | actor.name | text-[0.68rem] | no headline && actor not system | ANI:132-139 |  |
| 17 | Row: "· ROLE" | actor.roleLabel | text-[0.68rem] uppercase | roleLabel set | ANI:140-149 |  |
| 18 | Row: dismiss × (mark read) | onDismiss | h-7 w-7, icon h-3 | opacity-0 until hover → never on touch (Phase 0 fixes) | ANI:154-161 |  |

### 8. Map overlays
Files: OMGO=`features/order/components/overlays/OrderMarkerGroupOverlay.tsx` · ZMO=`features/zone/components/ZoneMapOverlay.tsx` · MDSC=`shared/map/components/MapDrawingSideControls.tsx` · MMSO=`shared/map/components/MapMultiSelectOverlay.tsx` · OMO=`features/order/components/OrderMapOverlay.tsx` · RGMO=`features/plan/routeGroup/components/overlays/RouteGroupMapOverlay.tsx`
Orders behind a grouped marker, a Zones mode panel, a Multi Select panel with totals. The multi-select hosts return null on mobile (OMO:69, RGMO:59).

| # | Element | Data source | Current size | Shown when | File:line | Decision |
|---|---|---|---|---|---|---|
| 1 | "N grouped orders" + close × | orderClientIds | text-xs semibold; w-[320px] | marker group open | OMGO:85-97 |  |
| 2 | Row: "#id" (no reference-number fallback, unlike the cards) | order_scalar_id | text-sm semibold | per order | OMGO:20,33-35 |  |
| 3 | Row: address | street_address | text-xs truncate | per order | OMGO:21,36-38 |  |
| 4 | Row: state pill | order_state_id (StateCard) | text-xs | state resolves | OMGO:41-43 |  |
| 5 | Row: items count pill | total_items | text-[11px], icon h-3 | per order | OMGO:44-47 |  |
| 6 | "Zones" button | enterZoneMode | icon h-4 | not in zone mode | ZMO:62-78 |  |
| 7 | Zone panel + exit × | exitZoneMode | w-52; × h-6 w-6 | zone mode | ZMO:94-103 |  |
| 8 | "Zone Mode" / "Zone Path Edit" title | isPathEditing | text-sm semibold | zone mode | ZMO:105-107 |  |
| 9 | Shape picker (polygon/rectangle/circle + erase), outside the panel at -left-36 | activeShape | text-xs, w-32 | !isPathEditing | ZMO:109-119; MDSC:30-54 |  |
| 10 | Status texts (init error + Retry / load error / no version / hint) | zone controller state | text-xs | conditional | ZMO:121-144,178-181 |  |
| 11 | Path edit: hint, error, Cancel, Save Path | pathEditSession | text-xs | path editing | ZMO:145-177 |  |
| 12 | "Create Zone" | drawnGeometry | default | shape drawn | ZMO:182-201 |  |
| 13 | "Multi Select" button | enableSelectionMode | icon h-5 | not selecting | MMSO:50-63 |  |
| 14 | Panel + exit × + drawing side controls | sideControls | w-72; × h-6 | selecting | MMSO:67-78 |  |
| 15 | "N Orders Selected" / "N Route Group Orders Selected" | count, title | text-sm semibold | selecting | MMSO:80-83 |  |
| 16 | "Hide stats" / "Show stats" | showStats | text-xs underline | selecting | MMSO:84-90 |  |
| 17 | Totals: items (pcs), volume, weight | totals | text-xs | showStats | MMSO:93-106 |  |
| 18 | Item-type breakdown | itemTypeCounts | text-[10px] heading, text-xs rows | showStats && types exist | MMSO:107-121 |  |
| 19 | Actions: drag-to-plan + "+ Plan" (order map); disabled "Bulk Action" placeholder (route map) | actions prop | default | selecting | MMSO:125; OMO:100-123; RGMO:90-101 |  |

### 9. Customer details + user profile card
Files: CDH=`features/costumer/components/pageHeaders/CostumerDetailHeader.tsx` · CDIS=`…/detail/CostumerDetailInfoSummary.tsx` · CDOH=`…/detail/CostumerDetailOperatingHoursSummary.tsx` · CDOS=`…/detail/CostumerDetailOrdersSection.tsx` · CDOL=`…/detail/CostumerDetailOrdersListView.tsx` · CDIL=`…/detail/CostumerDetailItemsListView.tsx` · UPC=`features/user/components/UserProfileCard.tsx`

| # | Element | Data source | Current size | Shown when | File:line | Decision |
|---|---|---|---|---|---|---|
| 1 | Back (mobile) / "close" (desktop) | isMobile | default | always | CDH:21-27,39-49 |  |
| 2 | Icon tile + "Costumer Details" + subtitle | static | text-md / text-[10px] | always | CDH:28-36 |  |
| 3 | "Edit" | onEdit | default | always | CDH:51-63 |  |
| 4 | Info rows: Name, Email, Primary phone, Secondary phone, Address | costumer.* | label text-xs, value text-sm, h-[300px] | always | CDIS:21-50 |  |
| 5 | Operating hours: weekday + open–close / "Closed" | operating_hours | text-sm / text-xs | always | CDOH:10-28 |  |
| 6 | "Orders" + "N total • N items • m³ • kg" + loading label | stats | text-sm / text-[11px] | always | CDOS:72-77 |  |
| 7 | Orders/Items toggle (arrow icon only) + "+ Order" | viewMode | icon h-4 | always | CDOS:81-98 |  |
| 8 | Order list: full OrderCard (no archive menu) | orders | §1 | orders view | CDOL:21-27 |  |
| 9 | Item list: collapsed ItemCard, no delete | stats.items | §6 #47-49 | items view | CDIL:24-40 |  |
| 10 | Profile: avatar, "Personal profile", username, "Role: <raw id>" | username, user_role_id | text-xl / text-[0.62rem] / text-sm | always | UPC:61-62,72-78 |  |
| 11 | "Active profile" badge (static) + "Edit profile" | onEdit | text-[0.7rem] | always | UPC:82-95 |  |
| 12 | 4 tiles: Username, Email, Phone, Role | user.* | value text-lg; md:grid-cols-2 | always | UPC:99-146 |  |
| 13 | UserSubscriptionCard (hard-coded "Starter Plan" placeholder) | static | text-xl / text-sm | where mounted | UPC:13-58 |  |

---

## Counts and shared elements

| Surface | Rows | Notes |
|---|---|---|
| 1 Order card | 27 | row 27 unmounted |
| 2 Order list header | 18 | rows 16, 18 unused/unmounted |
| 3 Plan card + header | 26 | |
| 4 Plan calendar | 27 | |
| 5 Route group workspace | 53 | rows 49–53 unmounted |
| 6 Order details | 50 | |
| 7 Home header + notifications | 18 | |
| 8 Map overlays | 19 | |
| 9 Customer + profile | 13 | |
| **Total** | **251** | one decision per row; shared elements below need one decision applied everywhere |

**Shared elements (decide once, applies to every surface):**

| Shared element | File | Used by |
|---|---|---|
| StateCard (state pill) | `shared/layout/StateCard.tsx` | OrderCard, RouteGroupOrderCard, PlanCard, RouteGroupRailAvatar, OrderMarkerGroupOverlay, ItemCard, PlanPickerSheet, AiOrderCard. OrderDetailSummary has its own inline pill (ODS:75-86); the calendar chip shows colour only |
| OrderOperationTypeBadges (direction arrows) | `features/order/components/cards/OrderOperationTypeBadges.tsx` | OrderCard, RouteGroupOrderCard, AiOrderCard |
| OrderCardItemPreviews + ItemImagePopover | `cards/OrderCardItemPreviews.tsx`, `item/components/ItemCard/ItemImagePopover.tsx` | OrderCard, RouteGroupOrderCard, ItemCard |
| OrderCardMissingInfoBanner | `cards/OrderCardMissingInfoBanner.tsx` | OrderCard, RouteGroupOrderCard (+ separate button in OrderDetailSummary) |
| OrderCardNotesTray / NOTE_TYPE_LABEL | `cards/OrderCardNotesTray.tsx`, `domain/orderNotes` | OrderCard, RouteGroupOrderCard, OrderDetailNotesTab |
| Order label rule (ref no. vs #id), copied 3× | OC:30-35, RGOC:34-39, ODH:188-193 (OMGO:20 shows #id only) | — |
| External source pill (two styles) | OrderCard, OrderDetailHeader | — |
| Item-type counts breakdown (3 copies) | PlanCard inline, ItemTypeCountsPill (unused), MapMultiSelectOverlay | — |
| Counts line "orders • items • m³ • kg" | OrderMainHeader, PlanMainHeader, PlanCalendarHeader, RouteGroupsPageHeader, ItemsOrderPreview, CostumerDetailOrdersSection, MapMultiSelectOverlay, rail popover | — |
| RouteStopWarnings | `routeGroup/components/warnings/RouteStopWarnings.tsx` | RouteGroupOrderCard, OrderDetailTimeWindows |
| UnscheduleDropSlot | `plan/components/UnscheduleDropTarget.tsx` | PlanMainHeader, PlanCalendarHeader |
| PlanContainerViewToggle | `plan/calendar/components/PlanContainerViewToggle.tsx` | PlanMainHeader, PlanCalendarHeader |
| PlanCard / DroppablePlanCard | `plan/components/cards/` | Plan list, calendar day overlay |
| Drop feedback chip + busy spinner | — | PlanCard, PlanCalendarPlanChip, UnscheduleDropTarget |
| StopOrderAvatar | `routeGroup/components/cards/StopOrderAvatar.tsx` | RouteGroupOrderCard, RouteGroupOrderGroupCard |
| ItemCard | `order/item/components/ItemCard/ItemCard.tsx` | Order detail items, customer items |
| DraggableOrderCard → OrderCard | `order/components/cards/` | Order list, address group children, customer orders |
| ThreeDotMenu | `shared/buttons/ThreeDotMenu.tsx` | OrderCard, OrderMainHeader, RouteGroupsActionBar (notes tab has its own copy) |
| Actor avatar / role pattern (two copies) | OrderEventTimelineItem, AdminNotificationItem | — |

**Existing compact/mobile variants a tablet variant can follow:** order details (`orderDetail.page.tsx:87`, `OrderDetailHeaderMobile.tsx`, `OrderDetailMobileSections.tsx`, `domain/orderDetailMobileSections.domain.ts`), route groups page (`RouteGroups.page.tsx:44-68`, header back/close, rail popover → BottomSheet, warnings tap), order/customer/route-group **forms** (`*Mobile.layout.tsx`), settings (`SettingsMobileView`, `SettingsMobileSectionList`), plan picking (`PlanPickerSheet`), order selection (`OrderSelectionActionBar`). **No variant at all:** OrderCard, PlanCard, OrderMainHeader, PlanMainHeader, PlanCalendar*, AdminNotificationItem, UserProfileCard, OrderDetail panels. Map overlays are hidden on mobile instead of compacted (OMO:69, RGMO:59, RouteGroupStatsOverlay.tsx:10).
