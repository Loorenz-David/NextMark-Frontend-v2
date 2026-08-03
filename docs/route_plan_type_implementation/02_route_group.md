# 02 — Route Group (the `local_delivery` workspace)

Scope: `admin-app/src/features/plan/routeGroup/**` — 186 files, ~15,400 LOC.

**Depth.** Per the agreed tiering, this document is **file level**: one-line responsibility,
exported symbols, and who consumes it. The ~20 files that a plan-type change actually
touches are documented at function level and marked 🔑. Route-optimization internals (stats
overlays, map flows, warning registries) are catalogued but not expanded — a container plan
never reaches them.

**Why this document exists.** Not because container plans will reuse this code — they mostly
won't. It exists so we can tell, for any proposed change, whether it lands inside this
subtree (safe: local_delivery-only) or outside it (dangerous: shared).

---

## 0. The entity chain

```
DeliveryPlan (plan core)
  └── RouteGroup            one per zone (or one no-zone group)
        └── RouteSolution   candidate orderings; exactly one is_selected
              └── RouteSolutionStop   one per order, ordered by stop_order
```

A container plan has **none** of these. That is the whole architectural difference.

Every store in this subtree is keyed independently of the plan, so nothing breaks if a plan
simply never populates them — the workspace just has nothing to show. The risk is not data;
it is that the shell has no *other* workspace to render (see [04](04_registries_and_shell.md) §3).

---

## 1. `types/`

| File | Exports | Notes |
|---|---|---|
| `types/routeGroup.ts` 🔑 | `LoadingScenarios` (`"isOptimizing"`), `GeoJSONPolygon`, `ZoneTemplateConfig`, `RouteGroup`, `RouteGroupMap`, `RouteGroupInput` | `RouteGroup`: `id?`, `client_id`, rollups (`total_orders`, `total_item_count`, `item_type_counts`, `total_volume_cm3`, `total_weight_grams`, `order_state_counts`), `state_id?`, `zone_id?`, `zone_snapshot?` (name + geometry), `template_snapshot?`, `is_optimized?`, `route_plan_id?`, `updated_at?`, `route_solutions_ids?`, `is_loading?`, `optimization_started_at?`. **`RouteGroupInput` is what `PlanTypeFields.local_delivery` in plan core refers to.** |
| `types/routeSolution.ts` | `RouteSolution`, `RouteSolutionMap` (+ `_representation: 'full' \| ...` partial-hydration marker) | The `_representation` flag drives the "is this solution fully loaded" checks in the page content |
| `types/routeSolutionStop.ts` | `RouteSolutionStop`, `RouteSolutionStopMap` | Carries `order_id`, `route_solution_id`, `stop_order`, `expected_arrival_time` |
| `types/serviceTime.ts` | `ServiceTime` | Referenced from plan core's `RouteGroupDefaults` |

---

## 2. `api/`

| File | Exports | Endpoint(s) |
|---|---|---|
| `api/planOverview.api.ts` 🔑 | `RouteGroupOverviewResponse`, `planOverviewApi.getRouteGroupOverview(planId)` | `GET /route_plan_overviews/{planId}/route_group/` → `{ order, route_group, route_solution, route_solution_stop }`. **The single call that hydrates an entire workspace.** A container plan will need either its own overview endpoint or to fall back to `planApi.getPlanOrders`. |
| `api/routeGroup.api.ts` 🔑 | `routeGroupApi` + payload/response types: `MaterializeRouteGroupsPayload`, `CreateRouteGroupPayload`, `MoveOrderToRouteGroupPayload`, `OrderGroupMovedBundle`, `RouteGroupDetailsResponse`, `RouteGroupAssignmentSummary`, `RoutePlanRouteGroupsResponse`, `CreateRouteGroupResponse`, `DeleteRouteGroupResponse`, `MoveOrderToRouteGroupResponse` | Materialize groups from zones, create/delete a group, fetch group details, move orders between groups |
| `api/routeGroupSettings.api.ts` | `RouteGroupSettingsPayload`, `RouteGroupSettingsResponse`, `routeGroupSettingsApi` | Persist route-solution settings for a group |
| `api/routeOptimization.api.ts` | `RouteOptimizationPayload`, `RouteOptimizationResponse`, `routeOptimizationApi` | Create/update an optimization run |
| `api/routeSolution.api.ts` | `routeSolutionApi` + `RouteSolutionUpdateResponse`, `RouteSolutionGetResponse`, `RouteSolutionFullGetResponse`, `RouteSolutionAddressPayload`, `RouteSolutionTimesPayload`, `RouteStopServiceTimePayload`, `RouteStopGroupPositionPayload`, `RouteSolutionReadyResponse` | Read a solution (partial/full), patch addresses/times/service time, reposition stop groups, mark route ready |
| `api/mappers/routeGroupDetails.mapper.ts` | `normalizeRouteGroupDetailsPayload` | Response → store shape |
| `api/mappers/routeGroupSettings.mapper.ts` | `normalizeRouteGroupEditFormToSettingsPayload` | Edit form → settings payload |
| `api/mappers/routeOptimization.mapper.ts` | `normalizeRouteOptimizationSolutions`, `normalizeRouteOptimizationStops` | Optimization response → store shapes |
| `api/mappers/routeSolutionPayload.mapper.ts` 🔑 | `normalizeByClientIdArray<T>(value)` | Accepts array \| `{byClientId, allIds}` map \| single object → array. **Also imported by plan core's `orderRouteArtifacts.bridge.ts`** — a cross-boundary import from plan core into routeGroup internals |

---

## 3. `store/` — 16 files

| File | Purpose | Key exports |
|---|---|---|
| `routeGroup.slice.ts` 🔑 | Route-group entity store | `useRouteGroupStore`, `selectAllRouteGroups`, `selectRouteGroupByClientId`, `selectRouteGroupByServerId`, `selectRouteGroupsByPlanId`, `getPlanEndDateByRouteGroupId`, `insert/insertMany/upsert/upsertMany/update/remove/clear`, `getRouteGroupSnapshot`, `restoreRouteGroupSnapshot` (optimistic rollback pair) |
| `routeSolution.store.ts` | Route-solution entity store + selection | `selectRouteSolutionsByRouteGroupId`, `selectSelectedRouteSolutionByRouteGroupId`, `setSelectedRouteSolution`, `purgeNonSelectedRouteSolutionsForGroup`, `getPlanEndDateByRouteSolutionId`, snapshot/restore |
| `routeSolutionStop.store.ts` | Stop entity store | `selectRouteSolutionStopsBySolutionId`, `selectRouteSolutionStopByOrderAndSolution`, `selectRouteSolutionStopsByOrderId`, `replaceRouteSolutionStopsForSolution`, `removeRouteSolutionStopsByOrderId`, `removeRouteSolutionStopsBySolutionIds`, snapshot/restore |
| `activeRouteGroup.store.ts` 🔑 | Which group is open, and the last-opened group **per plan** | `setActiveRouteGroupId`, `rememberRouteGroupForPlan`, `getLastOpenedRouteGroupIdByPlanId`, `clearActiveRouteGroupSelection` |
| `routeGroupOverviewFreshness.store.ts` 🔑 | Marks a plan's overview stale so the next mount refetches | `markRouteGroupOverviewFreshAfter`, `clearRouteGroupOverviewFreshAfter`, `useRouteGroupOverviewFreshAfter` |
| `routeGroupSelection.store.ts` / `routeGroupSelectionHooks.store.ts` | Multi-select of stops inside a group | `useRouteGroupSelectionMode`, `useSelectedRouteGroupClientIds`, `useSelectedRouteGroupServerIds`, `useRouteGroupSelectionActions`, `useSelectedRouteGroupOrdersSummary`, `buildSelectedRouteGroupOrdersSummary` |
| `routeGroupIncomingOrderPlaceholder.store.ts` | Ghost cards while a batch move is in flight | `registerIncomingRouteGroupOrderPlaceholders`, `clearIncomingRouteGroupOrderPlaceholders`, `useIncomingRouteGroupOrderPlaceholderKeys` |
| `routeGroupIncomingPulse.store.ts` | Arrival pulse animation | `triggerIncomingRouteGroupPulse`, `useIncomingRouteGroupPulseSequence` |
| `routeGroupMapInteraction.store.ts` / `routeGroupMapInteractionHooks.store.ts` | Marker lookup + marker-group overlay state | `useRouteGroupMarkerLookup`, `useRouteGroupMarkerGroupOverlay`, `useRouteGroupMapInteractionActions` |
| `routeGroupZonePreview.store.ts` | Zone polygon preview mode | `RouteGroupZonePreviewMode`, `selectRouteGroupZonePreviewMode` |
| `routeMapRefresh.store.ts` 🔑 | "Map is recomputing" flag | `useIsRouteMapRefreshing` — **re-exported from plan core's public barrel** |
| `routeSolutionPreview.store.ts` | Which candidate solution is previewed | `getPreviewedSolutionId` |
| `useActiveRouteGroup.selector.ts`, `useRouteGroup.selector.ts`, `useRouteSolution.selector.ts`, `useRouteSolutionStop.selector.ts` | React selector hooks over the four stores | incl. `useSelectedRouteSolutionStopByOrderId` (re-exported from the routeGroup barrel) |

---

## 4. `context/` and `providers/` 🔑

| File | Purpose |
|---|---|
| `context/RouteGroupPage.context.ts` | Splits the page context in two so commands don't re-render on state change: `RouteGroupPageStateContext` (`RouteGroupPageStateContextValue`) and `RouteGroupPageCommandsContext` (`RouteGroupPageCommandsContextValue`); `RouteGroupPageContextValue` is the union |
| `context/useRouteGroupPageContext.ts` | `useRouteGroupPageState()`, `useRouteGroupPageCommands()`, `useRouteGroupPageContext()` |
| `providers/RouteGroupPageProvider.tsx` 🔑 | **The workspace composition root.** Props `{ planId, freshAfter, children }`. Runs, in order: `useRouteGroupPageResourcesController(planId)` (25+ derived values), zone-preview mode, then the lifecycle flows — `useSyncActiveRouteGroupSelectionFlow`, `useSyncActiveRouteSolutionSelectionFlow`, `useActiveRouteGroupDetailsHydrationFlow`, `useSyncActiveRouteGroupZonePreviewFlow`, `useRouteGroupPageInitializationFlow`, `useRouteGroupPageEscapeFlow` — and publishes both contexts. **This is the file a second plan type would have a sibling of.** |
| `providers/RouteGroupWorkspaceRuntime.tsx` 🔑 | A **render-null** component mounted by the desktop shell whenever the base panel is open. Pulls `useActiveRouteGroupResourcesController(planId)` and runs `useRouteGroupMapFlow` + `useRouteGroupCircleSelectionFlow`. This is how route markers/polygons get onto the shared map *outside* the panel. A container plan would mount nothing here — or a different runtime. |

---

## 5. `controllers/` — 12 files

| File | Returns | Notes |
|---|---|---|
| `useRouteGroupPageResources.controller.ts` 🔑 | `{...useActiveRouteGroupResourcesController(planId), loadingController, routeSolutionWarningRegistry}` | The state half of the page context |
| `useActiveRouteGroupResources.controller.ts` 🔑 | `plan`, `planState`, `routeGroupState`, `planStartDate`, `routeGroups`, `activeRouteGroupId`, `routeGroup`, `routeGroupId`, `orders`, `orderCount` (`max(0, routeGroup.total_orders ?? orders.length)`), `routeSolutions`, `routeSolutionsOrdered`, `previewedSolutionId`, `isLoadingPreview`, `storedSelectedRouteSolutionId`, `selectedRouteSolution`, `routeSolutionId`, `routeSolutionStops`, `bestRouteSolutionId`, `isSelectedSolutionOptimized`, `stopByOrderId`, `ordersById`, `boundaryLocations`, `incomingPendingOrderPlaceholderKeys` | Shared by the page provider **and** the map runtime |
| `useRouteGroupPageCommands.controller.ts` | `{ routeGroupPageActions, loadingController }` | The commands half of the page context |
| `useRouteGroupsPageShell.controller.ts` 🔑 | `{ railItems, handleRouteGroupClick, handleCreateRouteGroup, headerSummary, hasRouteGroups, hasActiveRouteGroup, showOptimizeRow }` | Drives the page skeleton. `headerSummary` ← `buildRouteGroupHeaderSummary({plan, routeGroups, activeRouteGroup, activeRouteGroupOrders})`; `showOptimizeRow = hasActiveRouteGroup && !isLoading && orderCount > 0`; `handleCreateRouteGroup` opens popup `CreateRouteGroupForm` with `{planId}` |
| `useRouteGroupRail.controller.ts` | `{ railItems, handleRouteGroupClick }` | Builds the left zone rail via `buildRouteGroupRailItems` |
| `routeSolution.controller.ts` | `updateRouteSolutionAddress`, `updateRouteSolutionTimes`, `selectRouteSolution`, `previewRouteSolution`, `confirmSelectRouteSolution`, `routeReadyForDelivery` | Solution mutations |
| `routeSolutionStop.controller.ts` 🔑 | `updateRouteStopPosition`, `updateRouteStopPositionOptimistic`, `updateRouteStopGroupPositionOptimistic` | Called by plan core's `useExecutePlanDndIntent` for the two stop-reorder intents |
| `routeOptimization.controller.ts` | `createOptimization`, `updateOptimization` | Optimization runs |
| `routeGroupSettings.controller.ts` | `useRouteGroupSettingsMutations() → { updateRouteGroupSettings }`; `useRouteGroupDeleteMutations() → { deleteRouteGroup }` | |
| `useCreateRouteGroup.controller.ts` | `{ isSubmitting, createRouteGroup }` | |
| `useMoveOrderToRouteGroup.controller.ts` 🔑 | `{ moveOrderToRouteGroup }` | Called by plan core's `useExecutePlanDndIntent` |
| `useLoadingController.ts` | Loading-scenario state machine (`isOptimizing`) | |

---

## 6. `flows/` — 17 files

| File | Export(s) | Purpose |
|---|---|---|
| `routeGroupOverview.flow.ts` 🔑 | `applyRouteGroupPayload(payload, options)`, `useRouteGroupOverviewFlow() → { fetchRouteGroupOverview }` | **The hydration path.** `applyRouteGroupPayload` upserts orders → route groups → solutions, picks the selected solution (`is_selected`, else `_representation === 'full'`, else first), calls `setSelectedRouteSolution` + `replaceRouteSolutionStopsForSolution`, and optionally activates a route group (`resolvePayloadRouteGroupId` → selected solution's group, else first group) remembering it per plan. `fetchRouteGroupOverview(planId, {activateRouteGroup=true, notifyOnError=true})` wraps the API call |
| `routeGroupPageInitialization.flow.ts` 🔑 | `useRouteGroupPageInitializationFlow(planId, freshAfter?, {disabled?})` | Two effects: (1) **default selection** — if no active group belongs to this plan, select `routeGroups[0]` and remember it; (2) **freshness refresh** — computes the newest of `freshAfter` (from the section payload) and the store's invalidation marker, and refetches the overview when the plan is missing, the workspace isn't hydrated, or `shouldRefreshForFreshness(plan.updated_at, effectiveFreshAfter)`. Guards against re-fetching a plan that was deleted after hydration, and against fixture mode |
| `routeGroupDetails.flow.ts` | `useRouteGroupDetailsFlow` | Fetch one group's details |
| `activeRouteGroupDetailsHydration.flow.ts` | `useActiveRouteGroupDetailsHydrationFlow` | Lazily hydrate the active group |
| `routeSolutionRead.flow.ts` | `applyRouteSolutionGetPayload`, `useRouteSolutionReadFlow` | Read/partial-hydrate a solution |
| `syncActiveRouteGroupSelection.flow.ts` | `useSyncActiveRouteGroupSelectionFlow` | Keeps active group id consistent with the plan |
| `syncActiveRouteSolutionSelection.flow.ts` | `useSyncActiveRouteSolutionSelectionFlow` | Keeps selected solution consistent |
| `syncActiveRouteGroupZonePreview.flow.ts` | `useSyncActiveRouteGroupZonePreviewFlow` | Zone polygon preview sync |
| `syncRouteGroupSummaries.flow.ts` 🔑 | `syncRouteGroupSummaries(routeGroupIds)` | Recomputes group rollups after moves. Called from order-feature batch controllers |
| `routeGroupMap.flow.ts` | `useRouteGroupMapFlow`, `resolveRouteGroupOperationBadgeDirections`, `resolveRouteGroupGroupOperationBadgeDirections`, `buildStartEndMarker`, `buildCombinedStartEndMarker` | Publishes stops/markers/polylines to the shared map |
| `routeGroupCircleSelection.flow.ts` | `useRouteGroupCircleSelectionFlow`, `expandRouteGroupClientIdsFromMarkerSelection`, `buildRouteGroupSelectionFromClientIds` | Lasso selection on the map |
| `routeGroupDndProjection.flow.ts` | `useRouteGroupDndProjectionFlow` | Live reorder projection during a stop drag |
| `routeGroupDerivedResources.flow.ts` | `useRouteGroupDerivedResources` | Memoized derivations for the page |
| `createRouteGroup.flow.ts` | `runCreateRouteGroupFlow` | Create-group orchestration |
| `routeGroupPageEscape.flow.ts` | `useRouteGroupPageEscapeFlow` | Esc key → close/deselect |
| `runWithRouteMapRefresh.flow.ts` 🔑 | `runWithRouteMapRefresh(fn)` | Wraps a mutation so the map shows a refreshing state. Called from plan core's DnD controller |
| `useVehicleAvailabilityCheck.flow.ts` | `useVehicleAvailabilityCheck` | Warn on double-booked vehicles |

---

## 7. `actions/` — 7 files

| File | Export(s) | Purpose |
|---|---|---|
| `moveOrderToRouteGroup.action.ts` 🔑 | `moveOrderToRouteGroupAction` | Optimistic cross-group move (`optimisticTransaction` from `@shared-optimistic`). Snapshot = order snapshot + route-group snapshot. Optimistic phase 🔴 patches the moved orders with `{ delivery_plan_id: targetPlanId, order_plan_objective: "local_delivery" }` (**line 147**) and `route_group_id: targetRouteGroupId`, removes their stops from the source solutions, and records per-solution loading thresholds. Commit applies server bundles (`setOrder`, `removeRouteSolutionStopsByOrderId`, `upsertRouteSolutionStops`, `upsertRouteSolution`), runs `applyOrderBatchMoveStateSync`, and falls back to `syncRouteGroupSummaries` when no state changes came back. Detects drift (`bundles.length === 0`, or fewer bundles than `updated_count`) and calls `onDrift` |
| `createRouteGroup.action.ts` | `createRouteGroupAction` | Create a group |
| `optimisticRouteSolutionStopRemoval.action.ts` 🔑 | `collectRouteSolutionStopsByOrderIds`, `removeRouteSolutionStopsByOrderIds`, `restoreCollectedRouteSolutionStops` | The snapshot/remove/restore triple used by **order-feature** batch plan moves |
| `loadPlanRouteGroupVehicleIds.query.ts` 🔑 | `loadPlanRouteGroupVehicleIds(planId, signal?)` | Vehicle ids for a plan's groups. Consumed by the **plan calendar** |
| `resolveLoadedRouteProgressPlanId.query.ts` 🔑 | `resolveLoadedRouteProgressPlanId({eventName, entityId, payloadRouteSolutionId})` | Maps a realtime route event back to a loaded plan id. Consumed by the **realtime provider** |
| `routeWarningActionRegistry.ts` | `createRouteWarningActionRegistry`, `ResolveContext`, `RouteWarningActionHandler`, `RouteWarningActionRegistry` | Maps a route warning to its fix action |
| `useRouteGroupPageActions.tsx` | `useRouteGroupPageActions` | The page's command bundle (create order, edit, optimize, print, import) |

---

## 8. `domain/` — 18 files (pure)

| File | Export(s) |
|---|---|
| `planTypeDefaults/routeGroupDefaults.generator.ts` 🔑 | `buildRouteGroupPlanTypeDefaults(ctx)` — see §11 |
| `buildRouteGroupHeaderSummary.ts` 🔑 | `RouteGroupHeaderSummary`, `buildRouteGroupHeaderSummary({plan, routeGroups, activeRouteGroup, activeRouteGroupOrders})` |
| `buildRouteGroupRailItems.ts` | `buildRouteGroupRailItems` |
| `routeGroupRailItem.ts` | `RouteGroupRailItem` |
| `buildRouteGroupSummaryPatch.ts` | `buildRouteGroupSummaryPatch` |
| `applyRoutePlanTargetPatch.ts` | `applyRoutePlanTargetPatch` |
| `buildRouteOptimizationPayload.ts` | `buildRouteOptimizationPayload` |
| `buildRouteProgressSegments.ts` | `buildAdminRouteProgressSegments`, `serializeRouteProgressSegments` |
| `getRouteGroupBoundaryLocations.ts` | `BoundaryLocationMeta`, `getRouteGroupBoundaryLocations` |
| `resolveRouteGroupDisplayLabel.ts` | `resolveRouteGroupDisplayLabel` |
| `routeGroupAddressGroup.flow.ts` | `RouteGroupAddressGroup`, `buildRouteGroupStopAddressGroups` (same-address stop grouping) |
| `routePlanDate.ts` | `formatRoutePlanDate`, `getRoutePlanIsoWeekNumber` |
| `routeSolutionWarningRegistry.ts` | `ROUTE_SOLUTION_WARNING_TYPES`, `RouteSolutionWarningRegistry`, `createRouteSolutionWarningRegistry` |
| `routeStopWarnings.domain.ts` | `hasRouteStopWarnings`, `hasRouteStopTimeWindowWarning` |
| `routeTimingDiffs.ts` | `RouteTimingDiffs`, `formatSignedDurationDelta`, `computeRouteTimingDiffs` |
| `serializeRouteSolutionForTemplate.ts` | `formatRouteTemplateOrderIdentity`, `serializeRouteSolutionForTemplate` (route PDF) |
| `serviceTimeUnits.ts` | `serviceTimeMinutesToSeconds`, `serviceTimeSecondsToMinutes` |
| `stopTimingClassifier.ts` | `StopTimingClassification`, `StopTimingResult`, `classifyStopTiming` (early/on-time/late) |

---

## 9. `pages/` 🔑

### `pages/RouteGroups.page.tsx`
- `RouteGroupsPage({ payload: { planId?, freshAfter? }, onRequestClose })` — **the component the
  shell hardcodes as every plan's workspace.** Returns `null` when `planId == null`; otherwise
  wraps `RouteGroupsPageScreen` in `RouteGroupPageProvider`.
- `RouteGroupsPageScreen` — consumes `useRouteGroupsPageShellController(planId)`. When the
  plan has **no route groups**, renders an empty state ("No Route Groups Yet" + Create Route
  Group). Otherwise renders `RouteGroupsPageLayout`.
- `RouteGroupsPageLayout({headerSummary, onRequestClose, routeGroups, onRouteGroupClick, onCreateRouteGroup, showOptimizeRow, hasActiveRouteGroup})` —
  header on top, `RouteGroupRail` on the left, `RouteGroupsPageContent` filling the rest.

> ⚠️ **Behavioral note that matters for container plans:** a plan with no route groups
> currently renders the "No Route Groups Yet" empty state. That is exactly what a store-pickup
> or international-shipping plan would show today if opened, since the backend creates no
> groups for it.

### `pages/RouteGroupsPageContent.page.tsx`
`RouteGroupsPageContent({showOptimizeRow, hasActiveRouteGroup})` — the right pane. Reads the
page context for `orderCount`, `routeGroup`, `routeSolutionStops`, `selectedRouteSolution`.
Computes `isHydratingRouteGroupOrders` (active group, not optimizing, expects stops, but
either no selected solution / not `_representation === 'full'` / no stops yet) and switches
between `OrderLoadingList`, the optimization skeleton, and `RouteGroupOrderList`. Reserves
action-bar height via `useRouteGroupActionBarVisibility` (138 px with the optimize row,
82 px without).

---

## 10. `components/` — 40 files

| Group | Files | Purpose |
|---|---|---|
| Lists | `RouteGroupOrderList.tsx`, `RouteGroupReadyFooter.tsx` | The stop list and its ready-for-delivery footer |
| Cards | `RouteGroupOrderCard.tsx`, `DraggableRouteGroupOrderCard.tsx`, `RouteGroupOrderGroupCard.tsx`, `DraggableRouteGroupOrderGroupCard.tsx`, `RouteGroupOrderGroupChildren.tsx`, `RouteGroupBoundaryLocationCard.tsx`, `StopOrderAvatar.tsx` | Stop cards (single and same-address group), start/end boundary cards, the numbered stop avatar |
| Header | `pageHeaders/routeGroupPageHeader.tsx` 🔑 | `RouteGroupsPageHeader({summary, onRequestClose})` — 🔴 line 119 `const PlanTypeIcon = planIconTypeMap.local_delivery`. Also exports `RouteGroupsActionBar`. Internal `RouteGroupHeaderActionBar` provides Order / Edit buttons plus a three-dot menu (Update optimization, Download route, Import orders CSV) and the optimize row |
| Rail | `routeGroupRail/RouteGroupRail.tsx`, `RouteGroupRailAvatar.tsx`, `DroppableRouteGroupRailAvatar.tsx`, `RouteGroupRailPopoverContent.tsx`, `types.ts`, `index.ts` | The zone rail; avatars are drop targets (`type: 'route_group_rail'`) |
| Map overlays | `overlays/RouteGroupMapOverlay.tsx` 🔑, `RouteGroupMarkerGroupOverlay.tsx`, `ZonePolygonOverlay.tsx` | 🔑 `RouteGroupMapOverlay` is what the desktop shell swaps **in place of** the order/zone map overlays whenever the base panel is open |
| Drag overlays | `overlays/RouteStopDragOverlay.tsx`, `RouteStopGroupDragOverlay.tsx` | dnd-kit drag previews |
| Stats overlay | `overlays/RouteGroupStatsOverlay/*` (12 files) | The floating route-analytics panel: `RouteGroupStatsOverlay`, `...Shell`, `...TopSummary`, `RouteGroupGaussianMetricsGrid`, `GaussianMetricCard`, `InlineRouteMetric`, `RouteGroupConsumptionStatsColumn`, `RouteGroupDriverCard`, `useRouteGroupStatsOverlayController`, `useAnimatedMetricValue`, `.constants`, `.storage`, `.types`. Pure route-optimization surface — no container-plan relevance |
| Warnings | `warnings/RouteSolutionWarnings.tsx`, `warnings/RouteStopWarnings.tsx` | Warning chips |
| Misc | `RouteOptimizationDropdownButton.tsx`, `components/index.ts` | |

---

## 11. `forms/` and `popups/`

### `forms/createRouteGroupForm/` — 10 files
`CreateRouteGroupFormFeature` → provider → layout → `CreateRouteGroupFormFields` /
`...ZoneSelector` / `...Footer`. Types in `CreateRouteGroupForm.types.ts`
(`CreateRouteGroupFormState`, `...PopupPayload`, `...FormErrors`, `CreateRouteGroupZoneOption`,
`...ContextValue`, `...Actions`), validation in `.validation.ts`
(`validateCreateRouteGroupForm`, `hasCreateRouteGroupFormErrors`), setters in `.setters.ts`.

### `forms/routeGroupEditForm/` — 30 files
The route-solution settings editor: driver, vehicle, start/end location, start/end time,
route end strategy, per-stop service time, ETA tolerance, ETA message tolerance, plus the
plan label. Split into `components/` (12 field components), `views/` (desktop two-column and
mobile layouts), `info/` (six help-copy modules, all named `LOCAL_DELIVERY_*`), plus
`.context`, `.provider`, `.types`, `.validation`, `.warnings`, `ContextData`, `.actions`,
`.setters`, `.bootstrap` (`initialRouteGroupEditForm`, `buildFormState`).

🔑 `routeGroupEditForm.storage.ts` — **the preference layer that feeds plan creation.**
Exports `RouteEndStrategy`, `RouteGroupEditFormPreferences`,
`loadRouteGroupEditFormPreferences()`, `clearInvalidRouteGroupEditFormPreferences()`, and one
`save*Preference` writer per field (start time, end time, ETA tolerance, ETA message
tolerance, route end strategy, start location, end location, driver id, vehicle id, stops
service time). These persisted values are what `buildRouteGroupPlanTypeDefaults` reads.

🔑 `domain/planTypeDefaults/routeGroupDefaults.generator.ts` —
`buildRouteGroupPlanTypeDefaults(ctx: PlanTypeDefaultsContext): Promise<PlanTypeDefaults>`.
Loads stored preferences; resolves a start time (if the plan starts **today** and the stored
time is already past, uses team-now + 5 min, else the stored time, else `09:00`); resolves a
start location from preferences or, failing that, **prompts for the browser's current
location** via `ctx.getCurrentLocationAddress()`; picks `route_end_strategy` (`round_trip`
when no start location); derives the end location; defaults the driver to the session user
id. Returns `{ route_group_defaults: { route_solution: {...} } }`.
Private helpers: `resolveDefaultStartTime`, `isPlanStartToday`, `getTeamNowPlusFiveMinutes`,
`isTimeInPastForTeamToday`, `parseHHmm`, `resolveCurrentUserId`, `formatTimeInTimeZone`.

> 🔴 **This runs on *every* plan creation** — see `plan.controller.ts` §6 in
> [01](01_plan_core.md). A container plan would trigger a geolocation prompt and compute
> route defaults it will never use.

### `popups/`
`createRouteGroup/CreateRouteGroupForm.tsx` + `...Popup.tsx`;
`editRouteGroup/RouteGroupEditForm.tsx` + `...Popup.tsx` + `...Shell.tsx`.
Both are registered in plan core's `planPopupRegistry`.

---

## 12. `hooks/` and `utils/`

| File | Export | Purpose |
|---|---|---|
| `hooks/useRouteGroupActionBarVisibility.ts` | `useRouteGroupActionBarVisibility({enabled, expandedHeight})` | Scroll-driven action bar hide/show + reserved height |
| `hooks/useRouteGroupStopOrdering.ts` | `useRouteGroupStopOrdering` | Ordered stop client ids for DnD |
| `hooks/useRouteSolutionWarningRegistry.ts` | `useRouteSolutionWarningRegistry` | Memoized warning registry |
| `utils/formatRouteTime.ts` 🔑 | `formatRouteTime(value, planStartDate)` | Also used by plan core's `extractOrderDetailHeaderPlanMeta` |
| `utils/routeOptimizationGuard.ts` | `getRouteOptimizationBlockMessage`, `isEndDateInFuture` | Blocks optimization on past plans |

---

## 13. `index.ts` — the public barrel

```ts
export { RouteStopWarnings }
export { resolveLoadedRouteProgressPlanId }
export { useRouteGroupOverviewFlow }
export { loadPlanRouteGroupVehicleIds }
export { useSelectedRouteSolutionStopByOrderId }
export { hasRouteStopTimeWindowWarning }
```

Six symbols. **But the real coupling is much wider than this barrel** — plan core, the order
feature, the home shell, and the realtime provider all deep-import routeGroup internals
(stores, actions, pages, flows, mappers, providers). Any "extract local_delivery behind an
interface" work has to reckon with those deep imports, not just this file.

---

## 14. Inbound dependencies — who reaches into `routeGroup/`

| Consumer | Imports | Why it matters |
|---|---|---|
| `plan/controllers/plan.controller.ts` | `routeGroupApi`, `routeGroup.slice` writers | Plan create/delete manages route groups inline |
| `plan/controllers/useExecutePlanDndIntent.ts` | `useMoveOrderToRouteGroup.controller`, `routeSolutionStop.controller` | Three of eight intents are route-only |
| `plan/hooks/usePlanOrderDndController.tsx` | `routeSolutionStop.store`, `runWithRouteMapRefresh` | |
| `plan/bridges/orderRouteArtifacts.bridge.ts` | `routeSolutionPayload.mapper`, `routeSolution.store`, `routeSolutionStop.store` | |
| `plan/dnd/domain/resolve*` (3 files) | `routeGroup.slice`, `routeSolution.store` | Ownership resolution |
| `plan/domain/extractOrderDetailHeaderPlanMeta.ts` | `formatRouteTime`, `RouteSolutionStop` | |
| `plan/hooks/useOrderDetailHeaderPlanMeta.ts` | `routeSolution.store`, `routeSolutionStop.store`, `routeGroup.slice` | |
| `plan/domain/planTypeDefaults/planTypeDefaults.registry.ts` | `routeGroupDefaults.generator` | Plan creation depends on route-group preferences |
| `plan/calendar/flows/hydrateCalendarVehicleAssignments.flow.ts` | `loadPlanRouteGroupVehicleIds` | The calendar shows vehicle capacity |
| `plan/utils/planSectionTypeMap.ts`, `plan/registry/planSections.registry.ts` | `RouteGroups.page` | Both dead |
| `order/controllers/orderBatchDeliveryPlan.controller.ts` | `optimisticRouteSolutionStopRemoval.action`, `syncRouteGroupSummaries`, `routeSolution.store`, `routeSolutionStop.store`, `routeGroupIncomingOrderPlaceholder.store` | Order batch moves clean up route artifacts |
| `home-route-operations/views/HomeDesktopView.tsx` | `RouteGroups.page`, `RouteGroupMapOverlay`, `RouteGroupWorkspaceRuntime` | 🔑 the workspace decision |
| `home-route-operations/views/HomeMobileView.tsx` | `RouteGroups.page` | 🔑 same, mobile |
| `home-route-operations/registry/homeSections.ts` | `RouteGroups.page` | |
| `home-route-operations/flows/mapSelectionModeGuard.flow.ts` | `routeGroupSelectionHooks.store` | |
| `realtime/business/AdminBusinessRealtimeProvider.tsx` | `useRouteGroupOverviewFlow`, `resolveLoadedRouteProgressPlanId` | Route events refresh the workspace |
