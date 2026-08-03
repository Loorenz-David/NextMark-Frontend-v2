# 04 — Registries, Shell, Realtime, and the Empty Scaffolds

Scope: `home-route-operations/**`, `shared/resource-manager/**`, `realtime/**`, and the two
unwired features `international-shipping-orders/**` and `store-pickup-orders/**`.

**This is the most important document of the four.** The workspace-selection decision — the
one that makes every plan render as a route plan — lives here, not in the plan feature.

---

## 1. The panel model

The route-operations screen has four independently managed surfaces:

| Surface | Owner | What it holds |
|---|---|---|
| **Map** | `useMap()` / `mapManager` | Shared map; overlays are swapped by view mode |
| **Plan column** | `PlanDesktopShell` | Plan list or plan calendar |
| **Base** | `baseControlls` (`BaseControls<PayloadBase>`) | 🔑 **The plan workspace.** Exactly one at a time, payload `{ planId?, freshAfter? }` |
| **Sections** | `sectionManager` (stack) | Stacked detail panels: order, order case, customer |
| **Popups** | `popupManager` (global) | Forms and dialogs |

`PayloadBase` (`home-route-operations/types/types.ts`) is four lines:
```ts
export type PayloadBase = { planId?: number | null; freshAfter?: string | null }
```
🔑 **The only information the workspace receives about which plan it is showing is the id.**
No type, no objective, no hint. Everything downstream must derive type from the store or a
fetch.

---

## 2. `shared/resource-manager/`

| File | Exports | Purpose |
|---|---|---|
| `types.ts` | `BaseControls<T>` — `{ isBaseOpen, payload, openBase({payload}), closeBase, setBasePayload }` | The base-panel contract |
| `ResourceManagerContext.tsx` | `ResourcesManagerContext`, `ResourcesManagerProvider`, `isMobileObject`, `PlanDropFeedback`, `UnscheduleDropFeedback`, `KnownResourceRegistry`, `ResourceRegistry` | The provider carrying popup/section/base/map managers, the active drag, and drop feedback |
| `useResourceManager.ts` | `useResourceManager`, `usePopupManager`, `useSectionManager`, `useOptionalSectionManager`, `useBaseControlls`, `useOptionalBaseControlls`, `useMapManager` | Accessors. `useBaseControlls` throws when unprovided; the `Optional` variants return `null` |

`PlanDropFeedback` is what makes the "3 moved" / "Move failed" badge appear on a plan card
after a drop (`{ planClientId, status, movedCount, token }`).

---

## 3. 🔑 The workspace decision — where plan type must eventually branch

### `views/HomeDesktopView.tsx`
Three places hardcode the local_delivery workspace:

| Line | Code | Effect |
|---|---|---|
| ~183 | `{derivedState.isRouteOperationsOverlayActive ? <RouteGroupWorkspaceRuntime planId={activeRoutePlanId} isActive /> : null}` | Mounts the **route map runtime** (markers, polylines, lasso selection) whenever any plan panel is open |
| ~207 | `mapOverlay={ derivedState.isRouteOperationsOverlayActive ? <RouteGroupMapOverlay/> : <><OrderMapOverlay/><ZoneMapOverlay/></> }` | Swaps the map overlay to the **route** overlay whenever any plan panel is open |
| ~246 | `orderOverlay={ baseControlls.isBaseOpen ? <SectionPanel><RouteGroupsPage payload={{...baseControlls.payload, planId: ...}}/></SectionPanel> : null }` | Renders **`RouteGroupsPage`** as the body of every plan panel |

Also: `activeRoutePlanId` = `baseControlls.payload?.planId` when numeric; and
`plan={<PlanDesktopShell onRequestClose={layout.closePlan} viewMode={layout.viewMode}/>}`.

### `views/HomeMobileView.tsx`
Line 47 — the same decision, mobile: `routeGroupPayload && <RouteGroupsPage payload={routeGroupPayload} onRequestClose={...}/>`
inside a full-screen `SectionPanel`.

### `flows/homeDesktopDerivedState.flow.ts`
```ts
const isRouteOperationsOverlayActive = baseControlls.isBaseOpen
```
🔑 **"Route operations mode" is defined as "a plan panel is open"** — with no reference to what
kind of plan. This single boolean drives both the map overlay swap and the runtime mount.

> **Consequence.** There is no registry lookup, no `PlanSectionTypesMap`, no dynamic import in
> this path. `plan/utils/planSectionTypeMap.ts` *looks* like the seam but is dead code (see
> [01](01_plan_core.md) §14). The real seam is these four JSX expressions plus the derived
> boolean.

---

## 4. `home-route-operations/` file map

| File | Purpose |
|---|---|
| `pages/HomeRouteOperationsPage.tsx` | Composition root: `HomeRouteOperationsManagersProvider` → `AdminNotificationWorkspaceBridge` → `RouteOperationsHeaderActionsRegistrar` (registers the archive/cases header action) → `HomeRouteOperationsContent`, which picks `HomeMobileView` or `HomeDesktopView` and dims the aurora background 🔴 whenever a plan panel is open |
| `providers/HomeRouteOperationsManagersProvider.tsx` 🔑 | Workspace-local runtime: `DndContext` (collision strategy `homeCollisionDetection`, `MeasuringStrategy`), `DragOverlay` → `RouteOperationsDragOverlay`, `useBaseControlls<PayloadBase>()`, `useMap()`, fixture bootstrap, Escape handling, idle map preload. Its own docstring says it owns *"DnD, map, base controls, and **plan-type composition**"* — the intent is stated; the implementation isn't there yet |
| `views/HomeDesktopView.tsx` 🔑 | See §3 |
| `views/HomeMobileView.tsx` 🔑 | See §3 |
| `layout/HomeDesktopLayout.tsx` | Grid/flex composition of map / plan / base / overlay slots |
| `layout/PlanArea.tsx` | Animated plan column (rail vs split view), toggle button placement |
| `layout/MapArea.tsx`, `layout/OverlayRail.tsx` | Map and overlay slots |
| `hooks/useHomeDesktopLayout.ts` | `DesktopPlanViewMode = 'rail' \| 'split'`; owns column widths, row heights, `isPlanVisible`, `canTogglePlan`, `closePlan`, `setViewMode` (persisted initial value) |
| `hooks/useBaseControlls.ts` | The base-controls implementation: `isBaseOpen`, `payload`, `openBase`, `closeBase`, `setBasePayload`; plus `usePayloadBaseControlls()` |
| `hooks/useRouteOperationsDndController.ts` | Re-export shim over `usePlanOrderDndController` |
| `flows/homeDesktopDerivedState.flow.ts` 🔑 | `openSectionsCount`, `isRouteOperationsOverlayActive` |
| `flows/homeDesktopRailSettle.flow.ts` | Map reframe/resize after rail transitions |
| `flows/mapSelectionModeGuard.flow.ts` 🔴 | `resolveSelectionConflict({isOrderMode, wasOrderMode, isRouteGroupMode, wasRouteGroupMode})` → `'none' \| 'disable_order' \| 'disable_local_delivery'`, and `useMapSelectionModeGuardFlow()` which enforces mutual exclusion between order selection, **route-group** selection, and zone mode. 🔴 The decision name `disable_local_delivery` and the route-group dependency are local_delivery-specific |
| `flows/prefersReducedMotion.flow.ts` | Motion preference |
| `components/SectionManagerHost.tsx` | Renders the section stack. Enforces singleton sections (`order.details`, `costumer.details`, `orderCase.orderCases`, `orderCase.details`) by closing duplicates after a 350 ms delay; warns on stale closing entries after 1500 ms |
| `components/RouteOperationsDragOverlay.tsx` | dnd-kit drag preview switch over `ActiveDrag` |
| `components/MapPanel.tsx`, `HomeOverlays.tsx`, `TestSection.tsx` | Map host, overlay host, dev section |
| `dnd/collisionStrategies/*` | `homeCollisionDetection`, `orderCollision`, `routeCollision` |
| `dev/routeOperationsFixtureMode.ts`, `dev/useRouteOperationsFixtureBootstrap.ts` | `isRouteOperationsFixtureModeEnabled()` and the fixture seeding hook |
| `registry/homeSections.ts` 🔑 | See §5 |
| `registry/homePopups.ts` 🔑 | See §5 |
| `index.ts` | Barrel: `HomeRouteOperationsPage`, `homePopupRegistry`, `homeSectionRegistry`, `homeCollisionDetection`, `RouteOperationsDragOverlay` |
| `hooks/usePlanPanelState.ts`, `hooks/usePlanPanelDrag.ts` | **Empty files (0 bytes)** |

---

## 5. The registries

### `registry/homeSections.ts` 🔑
```ts
export const homeSectionRegistry = {
  ...orderPageRegistry,      // 'order.main', 'order.details', 'orderCases.main', 'oderCase.details', OrderPage
  ...orderCasePageRegistry,
  ...costumerPageRegistry,
  RoutePlanPage,
  RouteGroupsPage,           // 🔴
}
```
Sections are opened by **string key** through `sectionManager`. `RouteGroupsPage` is
registered here, but the plan panel does **not** go through the section manager — it uses the
base slot and is rendered directly. So this entry is effectively unused for the plan-panel
path.

### `registry/homePopups.ts`
```ts
export const homePopupRegistry = {
  ...planPopupRegistry,      // PlanForm, CreateRouteGroupForm 🔴, RouteGroupEditForm 🔴, plan.order-assignment-contact-warning
  ...orderPopupRegistry,
  ...costumerPopupRegistry,
  ...zonePopupRegistry,
  ...actingUserPopupRegistry,
}
export const loadingPopupRegistry = {}
```
🔑 **This one *is* a real registry with real dispatch** (`popupManager.open({key, payload})`).
It is the pattern a plan-type-aware section registry would follow.

### Registry inventory across the app
| Registry | File | Dispatches? |
|---|---|---|
| `homePopupRegistry` | `home-route-operations/registry/homePopups.ts` | ✅ yes, by key |
| `homeSectionRegistry` | `home-route-operations/registry/homeSections.ts` | ✅ yes, by key — but not for the plan panel |
| `planPopupRegistry` | `plan/registry/planPopups.registry.ts` | ✅ (merged into home) |
| `planSectionsRegistry` | `plan/registry/planSections.registry.ts` | ❌ dead |
| `PlanSectionTypesMap` | `plan/utils/planSectionTypeMap.ts` | ❌ dead |
| `planIconTypeMap` | `plan/utils/planIconTypeMap.ts` | ⚠️ live but always indexed with the literal `local_delivery` |
| `resolvePlanTypeDefaults` | `plan/domain/planTypeDefaults/planTypeDefaults.registry.ts` | ❌ alias, not a map |
| `pageRegistry` | `order/registry/orderSection.registry.ts` | ✅ |

---

## 6. Realtime

### `realtime/business/AdminBusinessRealtimeProvider.tsx`
Subscribes to the team-admin business channel and fans events out. Plan-relevant handlers:

| Handler | Events | Behavior |
|---|---|---|
| `handleOrderEvent` | `order.created`, `order.updated`, `order.state_changed` | Deduped order refresh; reads `route_freshness_updated_at` from the payload 🔴 to mark route sections stale |
| `handlePlanEvent` | `delivery_plan.updated` | `patchRoutePlanTotals(planId, { total_weight, total_volume, total_items, total_orders })`. **Type-agnostic — works for any plan** |
| `handleRouteSolutionEvent` 🔴 | `route_solution.created` → deduped `refreshPlanById`; `route_solution.updated` / `route_solution_stop.updated` → `resolveLoadedRouteProgressPlanId(...)` then `fetchRouteGroupOverview(planId, {activateRouteGroup:false, notifyOnError:false})` | Pure local_delivery |
| `handleOrderCaseEvent`, `handleClientFormSubmitted` | order-case and client-form events | Type-agnostic |

### `realtime/business/adminBusinessRealtimeCoordinator.ts`
Event de-duplication and refresh throttling. `markAdminBusinessEventHandled(eventId)` keeps
the last 300 event ids. Deduped refresh runners: `runDedupedOrderRefresh`,
`runDedupedOrderCaseRefresh`, `runDedupedGlobalOrderCasesRefresh`, `runDedupedPlanRefresh`,
🔴 `runDedupedRouteGroupRefresh`, `runDedupedOrderRouteContextRefresh`.

### `packages/shared-realtime/src/contracts/events.ts` 🔑
Declares event names and target kinds that **already anticipate plan types**:
`'local_delivery_plan.updated'`, entity kind `'local_delivery_plan'`,
`local_delivery_plan_id?: number`, notification target kind `'local_delivery_workspace'`.
The naming convention is per-plan-type; the admin app currently handles only the generic
`delivery_plan.updated`.

### `realtime/notifications/adminNotificationTargets.ts` 🔴
- `openAdminNotificationTargetPayload(payload, dependencies)` — routes a notification to a
  surface by `target.kind`: `order_detail`, `order_case_detail`, `order_case_chat`, and 🔴
  `local_delivery_workspace` → `dependencies.openLocalDeliveryWorkspace({ planId, freshAfter })`.
- `openAdminNotificationTarget(notification, deps)` — thin wrapper.
- `matchesAdminNotificationTarget(notification, deps)` — decides whether a notification's
  target is already on screen (used to suppress a toast). For 🔴 `local_delivery_workspace`
  it checks `isBaseOpen && basePayload.planId === target.params.planId`.

🔑 The backend picks `local_delivery_workspace` **by event name, not by plan objective**
(`Delivery_app_BK/sockets/notifications.py`), so plan-notification routing works for any plan
today — but the target kind is named after one plan type, and `openLocalDeliveryWorkspace`
opens the base panel, which renders `RouteGroupsPage`.

---

## 7. 🔑 The two empty scaffold features

### `features/international-shipping-orders/`
```
.gitkeep          api/ components/ controllers/ domain/ flows/ hooks/ pages/ popups/ store/ types/   (all .gitkeep)
index.ts
context/InternationalShippingOrders.provider.tsx
context/useInternationalShippingOrdersContext.ts
store/internationalShippingOrders.store.ts
pages/InternationalShippingOrders.page.tsx
pages/InternationalShippingOrdersContent.page.tsx
```

| File | Content |
|---|---|
| `index.ts` | Barrel exporting `InternationalShippingOrdersPage`, `InternationalShippingOrdersPageContent`, `InternationalShippingOrdersProvider`, `useInternationalShippingOrdersContext`, `useInternationalShippingOrdersStore` |
| `context/*.provider.tsx` | Context whose entire value is `{ planId: number \| null }` |
| `context/use*Context.ts` | Throw-if-unwrapped consumer hook |
| `store/*.store.ts` | Zustand store with a placeholder `isInitialized: boolean` + setter |
| `pages/*.page.tsx` | `({ payload: { planId?, freshAfter? } })` → returns `null` when `planId == null`, else provider + content |
| `pages/*Content.page.tsx` | Renders "International Shipping Orders / Feature implementation in progress". ⚠️ Imports `ReactNode` and the provider without using either; empty props type |

### `features/store-pickup-orders/`
Byte-for-byte the same structure with `StorePickup` naming, **except**:
- `pages/StorePickupOrders.page.tsx` does **not** mount its provider and does not render its
  content page — it inlines a "Store Pickup Orders - Coming Soon" div.
- `pages/StorePickupOrdersContent.page.tsx` is therefore unreachable.

### Status
- **Zero external importers.** A full-text search of `admin-app/src` finds no reference
  outside the two folders themselves, apart from a comment in `plan/index.ts`.
- **Never registered** in `homeSectionRegistry`, `homePopupRegistry`, or any route.
- **Git history:** created in the initial commit (`0c98ac3`), touched once by the theme
  tokenization commit (`dde6457`). Never developed.

### What they nonetheless tell us
1. Their page payload is `{ planId?: number; freshAfter?: string | null }` — **identical to
   `RouteGroupsPage`'s payload and to `PayloadBase`**. They were scaffolded as peer plan
   workspaces.
2. The intended split is already recorded in `plan/index.ts`:
   *"Objective-specific features are now independent: route-group, international-shipping-orders, store-pickup-orders"*.
3. Their folder layout matches the feature contract in `Front_end/AGENTS.md`
   (`api/ actions/ flows/ controllers/ stores/ providers/ components/ pages/`), so building
   them out does not require inventing structure.

---

## 8. What already works for any plan type, unchanged

Worth stating explicitly, because it bounds the work:

| Capability | Why it already works |
|---|---|
| Plan CRUD | `plan.api.ts` + `plan.controller.ts` have no type in the request except the route-group defaults |
| Plan list / calendar / date filter / pagination | Entirely type-agnostic |
| Plan states | Server-driven, no type coupling |
| Loading a plan's orders | `planApi.getPlanOrders` + `usePlanOrders` + `selectOrdersByPlanId` |
| Assigning orders to a plan | Both endpoints take only a plan id |
| Plan totals over realtime | `delivery_plan.updated` → `patchRoutePlanTotals` |
| Notification → plan panel | Routed by event name, not objective |
| Item labels showing the objective | Template already handles all three values |
| Order detail plan chip | Degrades cleanly with no route stop |
| Optimistic assignment plumbing | `orderPlanAssignmentOptimistic.ts` is already parameterized on `planType` |
