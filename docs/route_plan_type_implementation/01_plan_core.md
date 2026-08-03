# 01 — Plan Core

Scope: `admin-app/src/features/plan/**`, **excluding** `routeGroup/` (see [02](02_route_group.md)).
104 files, ~9,300 LOC. Function-level detail.

Legend: 🔴 = contains a plan-type assumption or hardcoding. ⚠️ = known drift/bug noted in place.

---

## 0. Layer map

```
types/                 contracts (no runtime)
  ↓
api/plan.api.ts        HTTP only
  ↓
flows/                 fetch + normalize + write to store
  ↓
store/                 zustand entity + list + UI stores
  ↓
domain/                pure functions (visibility, sorting, intents, registries)
  ↓
controllers/           orchestration with side effects (create/delete plan, execute DnD)
  ↓
hooks/ actions/        React-facing glue (pagination, open form, open section)
  ↓
components/ pages/     presentation
```

`bridges/` sits sideways: it is called **by the order feature** to push route artifacts into
route-group stores. `dnd/` is a self-contained sub-layer (domain → controller). `calendar/`
and `forms/planForm/` are self-contained sub-features that reuse the layers above.

---

## 1. `types/`

### `types/plan.ts` 🔴
The plan contract. **No plan-type field exists on any of these types.**

| Export | Shape / purpose |
|---|---|
| `RoutePlanObjective` | 🔴 `= "local_delivery"` — a single-member union. Only consumer is `PlanQueryFilters.plan_type`. |
| `PlanDateStrategy` | `"single" \| "range"` |
| `DeliveryPlan` | The entity: `id?`, `client_id`, `label`, `date_strategy?`, `start_date?`, `end_date?`, `created_at?`, `updated_at?`, `orders_ids?`, `state_id?`, rollups (`total_orders`, `total_items`, `item_type_counts`, `total_volume`, `total_weight`), and 🔴 `route_groups_count?` + `route_groups?` (local_delivery-only concepts living on the generic plan type). |
| `DeliveryPlanMap` | `{ byClientId, allIds }` normalized table |
| `DeliveryPlanFields` | Subset used as the create-form payload |
| `PlanTypeFields` | 🔴 `{ local_delivery?: RouteGroupInput }` — the "one key per plan type" shape, currently with one key. Used only inside `PlanUpdateFields`. |
| `PlanTypeStoreFields` | 🔴 `{ local_delivery_plan?: RouteGroupInput }` — same idea, different key spelling. Both are vestigial; nothing writes them. |
| `RouteGroupDefaults` | `{ route_solution?: {...} }` — start/end location, times, service time, end strategy, driver, vehicle, ETA tolerances |
| `PlanTypeDefaults` | 🔴 `{ route_group_defaults?: RouteGroupDefaults }` — the plan-type-defaults envelope, with exactly one (local_delivery) member |
| `RouteGroupPlanTypeDefaults` | Alias of `RouteGroupDefaults` |
| `PlanCreatePayload` | `client_id?`, `label`, `date_strategy?`, `start_date`, `end_date?`, `order_ids?`, `zone_ids?`, `plan_type_defaults?` ⚠️ |
| `PlanUpdateFields` | `Partial<DeliveryPlanFields & PlanTypeFields & PlanTypeStoreFields & { order_ids }>` |
| `ClientIdMap` | `Record<string, number> & { ids_without_match? }` |
| `RoutePlanRouteGroupSummary` | 🔴 `{ id, name, zone_id, total_orders, state }` — route-group summary embedded in the plan |
| `PlanCreateResultBundle` | 🔴 `{ delivery_plan, route_groups? }` — the create response always carries route groups |
| `PlanCreateResponse` | `{ created: PlanCreateResultBundle[] }` |

⚠️ **Drift:** `PlanCreatePayload` declares `plan_type_defaults`, but
`plan.controller.ts` actually sends a top-level `route_group_defaults` key (see §6). The
declared field is never populated. TypeScript does not catch it because the value is
spread, and spreads bypass excess-property checking.

### `types/planMeta.ts` 🔴
| Export | Purpose |
|---|---|
| `PlanStats` | `{ plans: { total, by_state }, orders: { total }, items: { total } }` — list header counters |
| `PlanPagination` | `{ has_more, next_cursor, prev_cursor }` |
| `DeliveryPlanStatePagination` | id-cursor variant for the states endpoint |
| `PlanQueryFilters` | List query: `mode` (`month`/`date`/`range`), `team_id`, `label`, 🔴 `plan_type?: RoutePlanObjective`, date bounds, `plan_state_id`, `sort`, cursors, nested `filters`, `orders`, `limit`. **The `plan_type` filter already exists in the contract** — it is just typed to a single value and never sent. |
| `DeliveryPlanStateQueryFilters` | Query for `/route_plans/states/` |

### `types/planState.ts`
`PlanStates = 'Open' \| 'Ready' \| 'Processing' \| 'Completed' \| 'Fail'`;
`DeliveryPlanState = { id?, client_id, name, index?, color?, is_system?, team_id? }`;
`DeliveryPlanStateMap`. Plan states are **type-agnostic** and server-driven — reusable by any
plan type as-is.

---

## 2. `api/plan.api.ts`

Thin HTTP layer over `apiClient`. No plan-type awareness anywhere.

| Function | Call |
|---|---|
| `listPlans(query?)` | `GET /route_plans/` → `{ route_plan, route_plan_stats, route_plan_pagination }` |
| `getPlan(planId)` | `GET /route_plans/{id}` → `{ route_plan }` (map or single) |
| `getPlanOrders(planId, query?)` | `GET /route_plans/{id}/orders/` → `OrderListResponse`. **The generic "orders in this plan" endpoint — the natural data source for a container-plan page.** |
| `createPlan(payload \| payload[])` | `POST /route_plans/` with `{ fields: payload }` |
| `updatePlan(payload \| payload[])` | `PATCH /route_plans/` with `{ target: payload }` |
| `deletePlan({ target_id \| target_ids })` | `DELETE /route_plans/` |
| `listDeliveryPlanStates(query?)` | `GET /route_plans/states/` |
| `updateDeliveryPlanState(planId, stateId)` | `PATCH /route_plans/{planId}/state/{stateId}` |

Also re-exports `ClientIdMap` and declares `PlanListResponse`, `PlanDetailResponse`,
`DeliveryPlanStateListResponse`, `PlanUpdatePayload`, `PlanDeletePayload`.

---

## 3. `store/`

### `store/routePlan.slice.ts`
The plan entity store (`createEntityStore<DeliveryPlan>` from `@shared-store`), keyed by
`client_id` with a `idIndex` server-id → client-id map and a `visibleIds` list.

Selectors: `selectAllRoutePlans`, `selectVisibleRoutePlans`,
`selectRoutePlanByClientId(clientId)`, `selectRoutePlanByServerId(id)`,
`selectRoutePlanStateById(stateId)` (reads the *state* store), `useRoutePlanStateById`.

Writers: `insertRoutePlan`, `insertRoutePlans(table)`, `upsertRoutePlan` (update-if-present
else insert), `upsertRoutePlans(table)`, `updateRoutePlan(clientId, updater)`,
`removeRoutePlan`, `clearRoutePlans`, `setVisibleRoutePlans`, `appendVisibleRoutePlans`
(dedupes against existing), `addVisibleRoutePlan` (prepends), `setRoutePlanStateId`,
`patchRoutePlanTotals(routePlanId, totals)` (server-id keyed; used by realtime).

### `store/routePlanList.store.ts`
`createListStore<PlanStats, PlanQueryFilters, PlanPagination>` — the *list-query* state
separate from the entities. Selectors for stats/pagination/query/loading/error; writers
`setRoutePlanListResult`, `setRoutePlanListLoading`, `setRoutePlanListError`,
`clearRoutePlanList`, `incrementRoutePlanListTotal` (bumps `stats.plans.total` after an
optimistic create).

### `store/routePlanList.selector.ts`
`useRoutePlanListStats()` — shallow-compared stats hook.

### `store/routePlanPagination.store.ts`
Cursor pagination state machine, independent of the list store.
State: `queryKey`, `currentPage`, `nextCursor`, `hasMore`, `isLoadingPage`, `cursorHistory`
(capped at 10), `requestVersion`.
Actions: `reset(queryKey)`, `startRequest()` → returns an incremented version used to
discard stale responses, `setLoadingPage`, `applyPageResult({queryKey, nextCursor, hasMore, append})`.
Selectors: `selectRoutePlanCurrentPage`, `selectRoutePlanHasMore`,
`selectRoutePlanIsLoadingPage`, `selectRoutePlanNextCursor`.

### `store/routePlanState.store.ts`
Entity store for `DeliveryPlanState`. Exports `ROUTE_PLAN_STATE_TRANSITIONS` (a
draft/active/completed/cancelled map that is **dead** — no consumer, and the names don't
even match `PlanStates`), `useRoutePlanState()` (all states, shallow), selectors by client
and server id, and insert/update/remove/clear writers.

### `store/routePlanDateFilterUI.store.ts`
Pure UI state for the date filter bar: `mode`, `singleDateIso`, `rangeStartIso`,
`rangeEndIso` (defaults: today, today → today+6). Exposes
`useRoutePlanDateFilterUIState()` (ISO → `Date`) and `useRoutePlanDateFilterUIActions()`.

### `store/useRoutePlan.selector.ts`
React-facing selector hooks.
- `useRoutePlans()` — all plans
- `useVisibleRoutePlans()` 🔴 — visible plans, **filtered through `reactivePlanVisibility`
  against the current list query** and then `sortVisiblePlans`. This is the choke point where
  a `plan_type` filter would take effect client-side.
- `useRoutePlanByClientId`, `useRoutePlanByServerId`, `useRoutePlanStateById`

### `store/useRoutePlanState.selector.ts`
`useRoutePlanStates`, `useRoutePlanStateByClientId`, `useRoutePlanStateByServerId`.

---

## 4. `flows/`

### `flows/planQueries.flow.ts`
Fetch + normalize + store-write for plans.

- `normalizePlanQueryForRequest(query?)` — strips empty values, hoists non-pagination fields
  into a nested `filters` object, and only keeps `mode` when both dates are present.
  🔴 Because it nests **everything that isn't a date/cursor/limit/sort**, a future
  `plan_type` filter automatically lands inside `filters` — matching how `plan_state_id` and
  `label` already travel.
- `buildPlanQueryKey(query?)` — `JSON.stringify` of the normalized query; used as the
  pagination identity.
- `usePlanQueries()` →
  - `fetchPlansPage(query?)` — `listPlans`, `insertRoutePlans(payload.route_plan)`, returns
    the payload (or sets a list error).
  - `fetchPlanById(planId)` — `getPlan`, `normalizeEntityMap`, upsert one or insert many.

### `flows/planState.flow.ts`
`useDeliveryPlanStateQueries()` → `fetchDeliveryPlanStates(query?)`, inserting into the state
store. Called once during app bootstrap.

### `flows/planStateRegistry.flow.ts`
`usePlanStateRegistryFlow()` — memoizes `createPlanStateRegistry(states)` over the state
store.

### `flows/runPlanDndMoveWithHandoff.flow.ts`
`runPlanDndMoveWithHandoff({ move, handoff, handoffMode })` — generic two-promise
coordinator used when assigning an order to a plan also triggers a client-form hand-off.
- `handoffMode: "concurrent"` (default): starts `move()` first so its **synchronous
  optimistic store write** (the order's new `delivery_plan_id`) lands before `handoff()`
  reads it, then awaits both. Deliberately not gated on move success.
- `handoffMode: "after_move_success"`: used for plan **creation**, where no plan id exists
  until the server responds.

### `flows/planTypeWithFetch.flow.ts` 🔴
```ts
usePlanTypeWithFetch(clientId) => plan ? 'local_delivery' : null
```
Nine lines. **This is the entire "what type is this plan?" logic in the app.** No consumers
found — it is dead today, but it is the exact function that has to become real.

---

## 5. `domain/` (pure)

### `domain/planReactiveVisibility.ts` 🔴
- `resolvePlanQueryFilters(query?)` — flattens `query.filters` up into the top level.
- `reactivePlanVisibility(plan, query?)` — decides whether a plan stays visible under the
  current filters, **client side**, for optimistic inserts and realtime updates. Checks, in
  order: 🔴 `filters.plan_type && filters.plan_type !== 'local_delivery' → false` (line 42),
  `plan_state_id`, `label` substring, start/end date overlap, `created_at` range.
  🔴 This function will **hide every non-local_delivery plan** the moment a plan_type filter
  is applied, regardless of the plan's real type.

### `domain/sortVisiblePlans.ts`
`sortVisiblePlans(plans)` — stable sort pushing past-dated plans (end_date, falling back to
start_date, compared against today in team timezone) to the bottom. Type-agnostic.

### `domain/createPlanStateRegistry.ts`
`createPlanStateRegistry(states)` → `{ getById, getByName, getStateIdByName }`. Builds
id→state and name→state maps. Type-agnostic.

### `domain/planDndIntent.ts`
The DnD intent union — the vocabulary of every drag operation in the workspace:

| Intent kind | Payload | Applies to |
|---|---|---|
| `MOVE_ROUTE_STOP` | from/to stop client ids | 🔴 local_delivery |
| `MOVE_ROUTE_STOP_GROUP` | routeSolutionId, routeStopIds, position, anchorStopId | 🔴 local_delivery |
| `MOVE_ORDER_TO_ROUTE_GROUP` | orderIds, planId, source/target routeGroupId | 🔴 local_delivery |
| `ASSIGN_ORDER_TO_PLAN` | orderClientId, planClientId | any plan |
| `UNSCHEDULE_ORDER` | orderClientId | any plan |
| `ASSIGN_ORDERS_TO_PLAN_BATCH` | selection, planClientId, origin | any plan |
| `UNSCHEDULE_ORDERS_BATCH` | selection, origin | any plan |
| `CREATE_PLAN_FOR_DATE` | dateKey, orderServerIds | any plan |

`derivePlanDndIntent({activeType, overType, activeId, overId, activeOrderClientId})` — a
small legacy resolver handling only stop→stop, order→plan and order→unschedule. The real
resolution lives in `dnd/controller/resolveDropIntent.ts`; this function is the simplified
fallback shape.

### `domain/extractOrderDetailHeaderPlanMeta.ts` 🔴
`extractOrderDetailHeaderPlanMeta({routePlan, routeStop, fallbackPlanLabel})` →
`{ planLabel, planDateLabel, arrivalTimeLabel, isUnscheduled }`. Formats the plan chip shown
in the order-detail header. 🔴 `arrivalTimeLabel` is derived from a **route stop's**
`expected_arrival_time` — for a container plan there is no stop, so the field simply stays
`null` (degrades safely, no crash).

### `domain/orderAssignmentContactWarning.domain.ts`
- `OrderAssignmentContactWarningDecision` — `cancel` \| `move_anyway` \| `send_customer` \| `send_linked_device`.
- `shouldWarnForMissingOrderAssignmentContact({intent, order})` — true when a **single**
  order (either `ASSIGN_ORDER_TO_PLAN`, or `CREATE_PLAN_FOR_DATE` with exactly one order) is
  being scheduled for the first time (`delivery_plan_id == null`) and has neither an email
  nor a primary phone. Type-agnostic; would apply equally to a container plan.

### `domain/planTypeDefaults/planTypeDefaults.types.ts` 🔴
- `PlanTypeDefaultsContext` — `{ getCurrentLocationAddress, planStartDate? }`
- `PlanTypeDefaultsGenerator` — `(ctx) => Promise<PlanTypeDefaults | undefined>`
- `PlanTypeDefaultsResolver` 🔴 — `(planType: 'local_delivery', ctx) => ...`. The *resolver*
  signature (the one that takes a plan type) is declared but **never used**.

### `domain/planTypeDefaults/planTypeDefaults.registry.ts` 🔴
```ts
export const resolvePlanTypeDefaults: PlanTypeDefaultsGenerator = buildRouteGroupPlanTypeDefaults
```
Three lines. Named "registry" but it is a direct alias — there is no map, no dispatch, and
the plan type is not a parameter. Imports straight into `routeGroup/domain/planTypeDefaults/`.

### `domain/planEvents.ts`
`PlanEventDefinition` + `PLAN_EVENTS: []` — the message-template event list for plans. The
only entry (`delivery_plan_rescheduled`) is commented out. Effectively a placeholder.

---

## 6. `controllers/`

### `controllers/plan.controller.ts` 🔴 (308 LOC)
`usePlanController()` → `{ createPlan, materializeRouteGroups, deletePlan }`.

**`createPlan(payload: DeliveryPlanFields, options?: { newOrderLinks?, zoneIds? })`**
1. Sanitizes `newOrderLinks` (finite ids) and `zoneIds` (positive ints, deduped).
2. Generates `client_id` via `buildClientId('delivery_plan')` if absent; **optimistically
   inserts the plan** into the store.
3. 🔴 Calls `resolvePlanTypeDefaults({ planStartDate, getCurrentLocationAddress: resolveUserCurrentLocation })`
   — unconditionally the route-group generator (geolocation prompt, stored route-group
   preferences). Defaults are skipped when zones were selected.
4. ⚠️ Builds `PlanCreatePayload` but spreads `route_group_defaults` (not the declared
   `plan_type_defaults`).
5. `POST`, then reconciles: if the server echoes the same `client_id`, merge; otherwise
   remove the optimistic plan and insert the server one.
6. `syncCreatedPlanIntoVisibleList(createdPlan)` — module-local helper that consults
   `canInsertCreatedPlanIntoCurrentList` (which defers to `reactivePlanVisibility` 🔴) and
   appends or prepends depending on `sort === 'date_asc'`, then `incrementRoutePlanListTotal()`.
7. 🔴 Upserts `created.route_groups` into the route-group store.
8. 🔴 `patchOrdersPlanByServerIds({ orderServerIds, planId, planType: 'local_delivery' })` —
   **line 187, hardcoded objective on every newly linked order.**
9. On failure: removes the optimistic plan and shows the error.

**`materializeRouteGroups(planId, zoneIds)`** 🔴 — local_delivery only. Requires ≥1 zone,
calls `routeGroupApi.materializeRouteGroups`, upserts the returned groups.

**`deletePlanInstance(idOrClientId)`** 🔴 — resolves the plan by server or client id,
snapshots the plan **and its route groups**, optimistically removes both plus all order→plan
links (`clearOrdersPlanByPlanId`), calls `DELETE`, refetches the order list, and on failure
restores plan, route groups, and order links.

### `controllers/planState.controller.ts`
`usePlanStateChanges()` → `changePlanState(planIdentity, state)`. Resolves the plan by
number (server id) or string (client id), resolves the target state through the registry by
id or name, patches `state_id` in the store, and returns `[clientId, previousStateId]` for
rollback. Throws if plan or state is unknown. Type-agnostic. **Store-only — no API call.**

### `controllers/useExecutePlanDndIntent.ts` 🔴 (210 LOC)
`useExecutePlanDndIntent()` → `{ execute, hasActiveItemLabelTemplate, downloadItemLabelsForOrder }`.

Helpers:
- `loadOrderItemsForLabel(orderId)` — store-first, else `getOrderItems`, normalize, cache.
- `hasActiveItemLabelTemplate()` — true when a print template is enabled for
  `item / item_rescheduled`; lets callers decide whether label rendering deserves its own
  paced UI step.
- `downloadItemLabelsForOrder(order, orderId, targetDeliveryPlanId)` — awaitable label render.

**`execute(intent)`** — the single dispatch point from intent → mutation:

| Intent | Effect |
|---|---|
| `MOVE_ROUTE_STOP` | 🔴 `updateRouteStopPositionOptimistic(from, to)` |
| `MOVE_ROUTE_STOP_GROUP` | 🔴 `updateRouteStopGroupPositionOptimistic({...})` |
| `ASSIGN_ORDER_TO_PLAN` | resolves plan by client id → `updateOrderDeliveryPlan(orderClientId, plan.id)` |
| `ASSIGN_ORDERS_TO_PLAN_BATCH` | 🔴 when `origin === 'route_group'`, fires `item_rescheduled` label downloads per order; then `updateOrdersDeliveryPlanBatch({ planId, planType: 'local_delivery', ... })` — **line 163, hardcoded** |
| `UNSCHEDULE_ORDER` | `updateOrderDeliveryPlan(clientId, null)` |
| `UNSCHEDULE_ORDERS_BATCH` | `updateOrdersDeliveryPlanBatch({ planId: null, planType: null, ... })` |
| `CREATE_PLAN_FOR_DATE` | resolves the "Open" state id, `buildCalendarPlanDefaults(dateKey, stateId)`, `createPlan(defaults, { newOrderLinks })`, returns the created plan's client id |
| `MOVE_ORDER_TO_ROUTE_GROUP` | 🔴 `moveOrderToRouteGroup({...})` |

Returns `{ droppedPlanClientId, success }` — the client id drives the drop-feedback badge on
the plan card.

### `controllers/usePlanDndContactWarning.controller.ts`
`usePlanDndContactWarningController()` → `{ requiresConfirmation, requestDecision }`.
`requiresConfirmation(intent, order)` delegates to the domain guard. `requestDecision` opens
popup `plan.order-assignment-contact-warning` and returns a promise resolved by the popup's
`onDecision` callback — a promisified modal. Type-agnostic.

---

## 7. `actions/usePlanActions.ts` 🔴

- `CreatePlanOptions` — `{ selectedOrderServerIds?, source?: 'order_multi_select', initialStartDate? }`
- `useOpenCreatePlanFormAction()` — returns a function opening popup key `"PlanForm"` with
  `{ mode: 'create', ...options }`. 🔴 **No plan-type argument** — one create form for
  everything.
- `usePlanHeaderAction()` → `{ onCreatePlan, openPlanSection }`.
  🔴 **`openPlanSection(plan)` is the single entry point into a plan's workspace**: it closes
  all open sections, then `baseControlls.openBase({ payload: { planId: plan.id } })`. It
  passes **only the plan id** — no type, no hint. Whatever the shell renders in the base slot
  is what every plan gets. See [04](04_registries_and_shell.md) §3.

---

## 8. `hooks/`

### `hooks/usePlanOrders.ts`
`usePlanOrders()` → `fetchPlanOrders(planId)`. Calls `planApi.getPlanOrders`, `upsertOrders`
into the shared order store, sets a list error on a missing payload. **Type-agnostic, 38
lines — the smallest complete "load this plan's orders" path in the app.**

### `hooks/useOrderDetailHeaderPlanMeta.ts` 🔴 (178 LOC)
`useOrderDetailHeaderPlanMeta({orderId, routePlanId, routeGroupId})` → `OrderDetailHeaderPlanMeta`.
1. Resolves the plan id from the argument or from the route group.
2. Best-effort hydrates the plan via `planApi.getPlan` (once per plan id, cancel-safe) when
   it is not in the store.
3. 🔴 Finds the order's route stop: prefers the stop on the **selected** solution of the given
   route group, else the lowest `stop_order` among the order's stops.
4. Feeds both into `extractOrderDetailHeaderPlanMeta`.

For a container plan steps 3–4 return `null` arrival time, which the formatter already
handles.

### `hooks/usePlanPaginationController.ts`
`usePlanPaginationController({ query, scrollToTop })` → `{ currentPage, hasMore,
isLoadingPage, isReplacingList, loadFirstPage, loadNextPage, queryKey }`.
`loadPage(append)`: no-ops in fixture mode; on a fresh load resets pagination, clears
`visibleIds` and scrolls to top; takes a `requestVersion` to discard stale responses; sets
visible ids (replace or append); writes stats + pagination into the list store. ⚠️ passes
`limit: 20` to the request but records `limit: 25` in the stored query.

### `hooks/usePlanOrderDndController.tsx` 🔴 (929 LOC — the largest file in plan core)
`usePlanOrderDndController()` — owns the entire dnd-kit lifecycle for the route-operations
workspace. Consumed by the home shell's `DndContext`.

- `MAX_BATCH_IDS = 200` — above this, a batch drag asks for confirmation.
- `ActiveDrag` union — `order` \| `order_batch` \| `order_group` \| 🔴 `route_stop` \| 🔴 `route_stop_group`,
  each carrying what the drag overlay needs to render.
- State: `activeDrag`, `planDropFeedback`, `unscheduleDropFeedback`, `routeReorderPreview`,
  plus refs for the pending intent, a pre-drag route-order snapshot, and feedback timeouts.
- `onDragStart` — builds `ActiveDrag`, snapshots the source route solution's stop order,
  emits the order-detail sweep event.
- `onDragOver` — resolves a live intent for highlight/preview purposes; drives
  `routeReorderPreview` and the calendar day overlay.
- `onDragCancel` — clears preview state.
- `onDragEnd` — resolves the final intent via `resolveDropIntent`, optionally runs the
  contact-warning gate and the client-form hand-off (`runPlanDndMoveWithHandoff`), executes
  through `useExecutePlanDndIntent`, wraps route-affecting work in `runWithRouteMapRefresh`,
  drives the label-download step through `useStepSequence`, and sets drop feedback.

🔴 Route-stop drag types, the map-refresh wrapper, and the reorder preview are all
local_delivery concepts; order→plan and unschedule drags are not.

---

## 9. `bridges/`

Called **from the order feature** after order mutations, to fan server-returned route
artifacts into the route-group stores. All three are one-liners over the fourth.

| File | Function | Behavior |
|---|---|---|
| `orderCreation.bridge.ts` | `handlePlanOrderCreation(bundle)` | Normalizes the created order; **returns early when `delivery_plan_id` is falsy**; else applies artifacts |
| `orderUpdate.bridge.ts` | `handlePlanOrderUpdate(bundle)` | Applies artifacts unconditionally |
| `orderDelete.bridge.ts` | `handlePlanOrderDelete(bundle)` | Applies artifacts unconditionally |
| `orderRouteArtifacts.bridge.ts` 🔴 | `applyOrderRouteArtifacts(bundle)` | Reads `bundle.order_stops` → `upsertRouteSolutionStops`, and `bundle.route_solution` (array/map/single) → `upsertRouteSolution` each |

🔴 The bridge assumes every order mutation response *may* carry route artifacts. For a
container plan the backend simply returns none, and the bridge no-ops — safe by construction.

---

## 10. `forms/planForm/` — the create/edit plan popup

### `PlanForm.types.tsx` 🔴
`PlanFormMode = 'create' \| 'edit'`;
`PopupPayload = { clientId?, serverId?, mode, selectedOrderServerIds?, source?, initialStartDate? }`
🔴 **no plan type in the payload**;
`PlanTypeState = RouteGroupInput` 🔴 (declared, imported by validation, unused);
`PropsPlanFormContext`, `PlanWarningsControllers`, `PlanFormActions`.

### `PlanForm.tsx`
`PlanFormFeature({payload, onSuccessClose, onUnsavedChangesChange})` — provider + layout.

### `PlanForm.provider.tsx`
`PlanFormProvider` — owns `planForm` state and `selectedZoneIds`; seeds from
`usePlanFormBootstrapFlow`, overridden by `payload.initialStartDate` (which also rewrites the
label to `Plan for <date>`); wires setters, warnings, validation, actions; wraps
`handleCreatePlan`/`handleDeletePlan` so success triggers `onSuccessClose`; syncs form state
from `planData` in edit mode; computes `hasUnsavedChanges` via
`hasFormChanges(planForm, initialPlanFormRef) || selectedZoneIds.length > 0`.

### `PlanForm.context.tsx`
`PlanFormContext`, `PlanFormContextProvider`, `usePlanForm()` (throws when unwrapped).

### `PlanFormContextData.ts`
`usePlanFormContextData(payload?)` → `{ clientId, mode, source, planData, selectedOrderServerIds, isEdit, hasPlan }`.
Resolves the edited plan via `useRoutePlanByServerId(serverId)`.

### `PlanForm.layout.tsx` 🔴
The visible form. Three fields only: **plan name**, **plan date** (single or range via
`CustomDatePicker`), 🔴 **zones** (`ZoneSelector`, multi) — zone selection is a route-group
concept. Footer: delete (edit mode) / Create Plan (create mode). 🔴 **There is no plan-type
selector.** ⚠️ In edit mode the footer renders only Delete — no save button; edits are not
submittable from this form today.

### `planForm.setters.ts` 🔴
`usePlanFormSetters({setPlanForm, setSelectedZoneIds, planFormWarnings})` →
- 🔴 `handlePlanType = () => undefined` — **a no-op stub. Direct evidence the form once had
  a plan-type selector.**
- `handlePlanName(e)` — sets the label and, via `inferPlanStartDateFromLabel`, back-infers the
  start date from a date written into the name; revalidates.
- `handleStartDate(value)` / `handleEndDate(value)` — set dates; `handleStartDate` rewrites the
  date token inside the label via `syncPlanLabelDateToken`.
- `handleZoneSelectionToggle(zoneId, checked)` / `handleZoneSelectionChange(ids)` — zone set
  maintenance (parse, filter positives, dedupe).
- `handleDateStrategy(strategy)` — switches single/range, clearing `end_date` for single.
- `handleCompositeDateStrategy` / `handleCompositeSingleDate` / `handleCompositeRange` —
  adapters for the composite date picker.

### `planForm.actions.ts`
`usePlanFormActions({planForm, planValidateForm, selectedOrderServerIds, selectedZoneIds, source})` →
- `handleCreatePlan()` — validates, calls `createPlan(planForm, { newOrderLinks, zoneIds })`,
  disables order selection mode when `source === 'order_multi_select'`.
- `handleDeletePlan()` — `deletePlan(id ?? client_id)`, then closes the base panel.

### `PlanForm.validation.ts`
`usePlanFormValidation(...)` → `{ planValidateForm, hasChanges }`. Validates label, start
date (and end date when range), and that neither is in the past.

### `PlanForm.warnings.ts`
`usePlanFormWarnings()` → `{ planNameWarning, planStartDateWarning }` built on
`useInputWarning`; the date warning carries four distinct messages (missing / past start /
past end / start-after-end).

### `planFormBootstrap.flow.ts`
`usePlanFormBootstrapFlow()` → `{ initialPlanForm }` — client id, label `Plan for <friendly
date>`, today's date for both bounds, `state_id` from the registry's "Open" state,
`date_strategy: 'single'`.

### `planFormLabelDateSync.ts`
Two-way label↔date sync. `inferPlanStartDateFromLabel(label, referenceIso?)` parses
`Aug 3` / `3 Aug` style tokens (full month-name table + ordinal suffixes) into an ISO date,
using the reference year. `syncPlanLabelDateToken(label, nextStartDate)` rewrites the
detected token in place. Type-agnostic.

---

## 11. `components/`

| File | Purpose |
|---|---|
| `components/index.ts` | Barrel: `PlanList`, `PlanCard`, `DroppablePlanCard`, `PlanLoadingList`, `PlanMainHeader`, `PlanTypeDescription`, `PlanDateFilterBar` |
| `PlanList.tsx` | `PlanList({plans, droppable})` — maps to `DroppablePlanCard` or `PlanCard` |
| `cards/PlanCard.tsx` 🔴 | The plan card (369 LOC). 🔴 line 44 `const PlanTypeIcon = planIconTypeMap.local_delivery` — always the route icon. Shows label, date range, state chip, drop-feedback badge (`"{n} moved"` / `"Move failed"`), and a metric row: 🔴 `route_groups_count` rendered as **"n zones"**, order count, item count with an item-type popover, volume, weight. Click → `openPlanSection(plan)`. |
| `cards/DroppablePlanCard.tsx` | Wraps `PlanCard` in `useDroppable({ id: 'plan-<clientId>', data: { type: 'plan', ... } })`; computes highlight via `useDroppablePlanTargetHighlight`; pulls matching `planDropFeedback` from the resource manager |
| `loadingCards/PlanLoadingCard.tsx`, `PlanLoadingList.tsx` | Skeletons |
| `headers/PlanMainHeader.tsx` | List header: create button, close button, stats, search/filter wiring, optional `headerAccessory` (used for the calendar/list toggle) |
| `PlanTypeDescription.tsx` 🔴 | Seven lines returning **one hardcoded paragraph** describing local delivery. No props, no branch. Exported from the barrel; currently rendered nowhere. |
| `planDateFilter/PlanDateFilterBar.tsx`, `PlanDateFilterOverlay.tsx` | Month/date/range filter UI |
| `planDateFilter/domain/planDateFilter.types.ts` | `PlanDateFilterMode`, `PlanDateFilterSelection`, `PlanDateFilterPayload`, `PlanDateFilterControllerParams` |
| `planDateFilter/domain/planDateFilter.constants.ts` | `PLAN_DATE_FILTER_MODES`, `PLAN_DATE_FILTER_DEFAULT_MODE = 'month'` |
| `planDateFilter/domain/planDateFilter.utils.ts` | `shiftSingleValueByMode`, `normalizeRange`, `formatMonthLabel`, `formatDayLabel`, `buildPlanFiltersFromSelection` |
| `planDateFilter/usePlanDateFilterController.ts` | Binds the UI store to the bar and emits `PlanDateFilterPayload` |

---

## 12. `calendar/` — month view of plans

| File | Purpose |
|---|---|
| `store/planCalendar.store.ts` | `PlanContainerView = 'calendar' \| 'list'`; month cursor; `dragOverlayDateKey` (day overlay held open by a drag); `isFetchingRange`; `vehicleAssignmentsByPlanId` with loading/ready/failure. Exports `usePlanContainerView()` used by the desktop layout. 🔴 vehicle assignment is a route concept. |
| `domain/planCalendar.domain.ts` | Pure calendar math: `toCalendarDayKey`, `getTodayDayKey`, `addDaysToDayKey`, `isDayKeyBefore`, `getMonthCursorForDayKey`, `stepMonthCursor`, `buildMonthGrid`, `getGridRangeKeys`, `formatMonthTitle`, `CALENDAR_WEEKDAY_LABELS`, `groupPlansByDay`, `computeCalendarRangeStats`, plus 🔴 `getCalendarVolumeLoadPercent` and `getAssignedVehicleVolumeCapacityCm3` |
| `domain/buildCalendarPlanDefaults.ts` | `buildCalendarPlanDefaults(dateKey, openPlanStateId)` — plan fields for a silent create from an empty-day drop; mirrors the PlanForm bootstrap |
| `controllers/usePlanCalendarController.ts` 🔴 | Owns the calendar: builds the grid, fetches every plan overlapping the visible range (`mode: 'range'`, limit 300), buckets by day, 🔴 hydrates per-plan vehicle assignments, computes volume capacity + range stats, exposes `openPlan` (→ `openPlanSection`) and `openCreatePlanFormForDate` |
| `flows/hydrateCalendarVehicleAssignments.flow.ts` 🔴 | Concurrency-limited (4) fetch of route-group vehicle ids per plan, writing loading/ready/failure into the store. Calls into `routeGroup`. |
| `pages/PlanCalendar.page.tsx` | Assembles header + body; closes a drag-opened day overlay 900 ms after the drag ends |
| `components/PlanCalendarHeader.tsx`, `PlanCalendarBody.tsx`, `PlanCalendarDayCell.tsx`, `PlanCalendarDayPlansOverlay.tsx`, `PlanCalendarPlanChip.tsx`, `PlanContainerViewToggle.tsx` | Presentation. Day cells are droppable (`type: 'calendar-day'`); a day with >1 plan defers drops to its overlay |

---

## 13. `dnd/`

### `dnd/domain/` (pure resolvers)
| File | Function | Behavior |
|---|---|---|
| `resolveCreatePlanOrderIds.ts` | `resolveCreatePlanOrderIds({activeData, selectedServerIds, selectionModeEnabled, isActiveOrderSelected})` | Extracts the order server ids a drag represents, per drag type: batch/selected-order → the selection; `order_group`/`route_stop_group` → `data.orderIds`; single `order`/`route_stop` → `[data.order.id]` |
| `resolveDraggedOrderOwnership.ts` | `resolveDraggedOrderOwnership({activeData, resolveRouteGroupIdByRouteSolutionId, resolvePlanIdByRouteGroupId})` | Where the dragged order currently lives → `{ planId, routeGroupId }`. Orders read their own fields; 🔴 route stops resolve solution → group → plan |
| `resolveGroupPlacement.ts` | `resolvePointerClientY(event)`, `resolveGroupPlacement(pointerY, overRect)` | Whether a drop lands before or after the hovered element (translated-rect center, falling back to mouse/touch coords) |
| `resolveMovePosition.ts` | `resolveMovePosition({orderedStopClientIds, movingStopClientIds, anchorStopClientId, placement})` | 🔴 The new 1-based `stop_order` for a multi-stop move; returns `null` when the move is a no-op |
| `resolveRouteGroupPlanId.ts` | `resolvePlanIdByRouteGroupId(id)` | 🔴 route group → plan id |
| `resolveRouteSolutionRouteGroupId.ts` | `resolveRouteGroupIdByRouteSolutionId(id)` | 🔴 solution → route group id |
| `resolveRouteSolutionPlanClientId.ts` | `resolveRouteSolutionPlanClientId(id)` | 🔴 solution → group → plan → `client_id` |

### `dnd/controllers/useDroppableTargetHighlight.controller.ts`
`useDroppablePlanTargetHighlight({isOver, targetPlanId})` and
`useDroppableRouteGroupTargetHighlight({isOver, targetRouteGroupId})` — highlight only when
hovering a target that differs from the drag's current owner (no "drop where it already is"
glow).

### `dnd/controller/resolveDropIntent.ts` 🔴 (645 LOC)
`resolveDropIntent(params) → ResolveDropIntentResult` = `{type:'noop'}` \|
`{type:'warning', status, message}` \| `{type:'intent', intent}` \| `{type:'preview', preview}`.
Also exports `RouteReorderPreview` (`MOVE_ROUTE_STOP` / `MOVE_ROUTE_STOP_GROUP` preview shapes).

The full drag-type × drop-type matrix:
- `overType === 'calendar-day'` → delegates to `resolveCalendarDayDropIntent`
- `activeType 'order'` × `'plan'` → assign (batch when selection mode is on; warns if the
  dragged order isn't selected)
- `activeType 'order'` × `'unschedule'` → unschedule (same batch rules)
- `'order_batch'`, `'order_group'` × plan/unschedule → batch variants, with a
  `confirmLargeBatch` gate above `maxBatchIds`
- 🔴 `'route_stop'` / `'route_stop_group'` × `'route_group_rail'` → `MOVE_ORDER_TO_ROUTE_GROUP`
- 🔴 `'route_stop'` / `'route_stop_group'` × `'plan'` → cross-plan assign
- 🔴 `'route_stop'` × `'route_stop'` → `MOVE_ROUTE_STOP`
- 🔴 `'route_stop_group'` × `'route_stop'` → `MOVE_ROUTE_STOP_GROUP` via `resolveMovePosition`

Private helpers: `resolveActiveRouteSolutionId`, `resolveTargetRouteSolutionId`,
`resolveTargetAnchor`, `resolveManualIdsForActive`, `resolveRouteStopIdsForReorder`,
`buildOrderedIds`.

### `dnd/controller/resolveCalendarDayDropIntent.ts`
`resolveCalendarDayDropIntent({...})` — a drop on a calendar day:
past day → warning; day with exactly **one** plan → a normal assign intent; **empty** day →
`CREATE_PLAN_FOR_DATE`; day with several plans → noop (the day's overlay owns those drops).
Type-agnostic — 🔴 but the plan it creates is implicitly local_delivery.

---

## 14. `pages/`, `views/`, `popups/`, `registry/`, `utils/`, `constants/`, `info/`

| File | Purpose |
|---|---|
| `pages/Plan.page.tsx` | `RoutePlanPage({onRequestClose, showCloseButton, headerAccessory})` — the plan **list**. Owns `activeQuery` (merged via module-local `mergePlanQuery`/`queryEquals`), renders `PlanMainHeader` + `PlanList`/`PlanLoadingList` + a "Show more" button driven by `usePlanPaginationController` |
| `views/PlanDesktopShell.tsx` | Chooses what the desktop plan column shows: `split` view → `PlanDesktopTimeline`; container view `list` → `RoutePlanPage`; otherwise `PlanCalendarPage` |
| `views/PlanDesktopTimeline.tsx` | "Time line view, coming soon!" placeholder |
| `popups/PlanForm.tsx` | Stack adapter → `PlanFormPopup` |
| `popups/PlanFormPopup.tsx` 🔴 | Popup shell. Header copy is **"Create a Plan" / subtitle "choose between the plan types."** — 🔴 copy that already promises a type choice the form doesn't offer. Renders `PLAN_MAIN_HEADER_INFO` in an `InfoHover`, wires the unsaved-changes close prompt |
| `popups/OrderAssignmentContactWarning/OrderAssignmentContactWarningPopup.tsx` | The contact-warning modal (254 LOC): `options` view (move anyway / send to customer / send to linked device / cancel) and a `customer` view collecting email + phone; resolves the caller's promise through `payload.onDecision` |
| `registry/planPopups.registry.ts` 🔴 | `{ PlanForm, CreateRouteGroupForm, RouteGroupEditForm, 'plan.order-assignment-contact-warning' }` — 🔴 two of four keys are local_delivery-specific |
| `registry/planSections.registry.ts` 🔴 | `{ RoutePlanPage, RouteGroupsPage }` — **dead**: no importer found. `homeSectionRegistry` duplicates it |
| `utils/planSectionTypeMap.ts` 🔴 | `routePlanSectionKey = 'RouteGroupsPage'`, `RoutePlanSectionPage = RouteGroupsPage`, `PlanSectionTypesMap = { local_delivery: RouteGroupsPage }`. **Entirely dead** — no consumers. Looks like the extension point but isn't wired to anything |
| `utils/planIconTypeMap.ts` 🔴 | `routePlanIcon = RouteIcon`, `planIconTypeMap = { local_delivery: RouteIcon }`. **Live**, but every call site indexes the constant key |
| `constants/planTypeDefaults.constants.ts` 🔴 | Field-name constants for route-solution defaults (`set_start_time`, `set_end_time`, `eta_tolerance_seconds`, `eta_message_tolerance`, `route_end_strategy`, `start_location`, `end_location`, `driver_id`, `vehicle_id`, `stops_service_time`) plus `LOCAL_DELIVERY_DEFAULT_START_TIME = '09:00'`, `..._END_TIME = '23:59'`, `..._ROUTE_END_STRATEGY = 'round_trip'` |
| `info/planMainHeader.info.ts` ⭐ | `PLAN_MAIN_HEADER_INFO` — four info blocks: "What a plan is" (**"Each plan can use a plan type, and that plan type expands how orders are handled"**), "Route plans", "International shipping plans", "Store plans". **The product copy for all three plan types already exists and ships today.** |
| `index.ts` | Public barrel: `usePlanOrders`, `useOrderDetailHeaderPlanMeta`, `planPopupRegistry`, `handlePlanOrderCreation`, `useIsRouteMapRefreshing`, `usePlanContainerView`. Header comment already names the intended split: *"Objective-specific features are now independent: route-group, international-shipping-orders, store-pickup-orders"* |

---

## 15. `dev/fixtures/`

Fixture builders and scenarios used by route-operations fixture mode
(`isRouteOperationsFixtureModeEnabled()` short-circuits pagination and page init).

`makeRoutePlan`, `makeRoutePlanState`, 🔴 `makeRouteGroup`, 🔴 `makeRouteSolution`,
🔴 `makeRouteSolutionStop`, `buildRouteOperationsCanonicalScenario`,
`seedRouteOperationsPlanFixtures`, `resetRouteOperationsPlanFixtures`,
`seedCanonicalRouteOperationsScenario`, `resetCanonicalRouteOperationsScenario`,
`toEntityTable`, `RouteOperationsFixtureScenario`.

---

## 16. Known drift and dead code in plan core

| # | Item | Location | Consequence |
|---|---|---|---|
| 1 | Create payload sends `route_group_defaults`, type declares `plan_type_defaults` | `plan.controller.ts` vs `types/plan.ts` | The typed field is never sent; the sent field is untyped. Any plan-type-defaults work must reconcile these first |
| 2 | `PlanSectionTypesMap` / `RoutePlanSectionPage` / `routePlanSectionKey` unused | `utils/planSectionTypeMap.ts` | Looks like the plan-type routing seam but has no effect; real routing is hardcoded in the shell |
| 3 | `planSectionsRegistry` unused | `registry/planSections.registry.ts` | Duplicate of `homeSectionRegistry` |
| 4 | `usePlanTypeWithFetch` unused | `flows/planTypeWithFetch.flow.ts` | The intended type resolver, currently a constant |
| 5 | `handlePlanType` no-op | `forms/planForm/planForm.setters.ts` | Vestige of a removed plan-type selector |
| 6 | `PlanTypeState`, `PlanTypeFields`, `PlanTypeStoreFields`, `PlanTypeDefaultsResolver` declared, unused | `types/plan.ts`, `PlanForm.types.tsx`, `planTypeDefaults.types.ts` | Four different half-shapes for the same missing concept |
| 7 | `PlanTypeDescription` exported, never rendered | `components/PlanTypeDescription.tsx` | Was presumably shown under a type selector |
| 8 | `ROUTE_PLAN_STATE_TRANSITIONS` unused, names don't match `PlanStates` | `store/routePlanState.store.ts` | Dead |
| 9 | `PLAN_EVENTS` empty | `domain/planEvents.ts` | No plan-level message templates |
| 10 | Edit mode has no save button | `forms/planForm/PlanForm.layout.tsx` | Plan edit is delete-only from the popup |
| 11 | Pagination requests `limit: 20`, records `limit: 25` | `hooks/usePlanPaginationController.ts` | Harmless today; a query-key mismatch waiting to happen |
| 12 | Popup subtitle says "choose between the plan types" | `popups/PlanFormPopup.tsx` | Copy already assumes the feature |
