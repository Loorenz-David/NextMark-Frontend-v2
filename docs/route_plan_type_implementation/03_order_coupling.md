# 03 — Order Feature Coupling

Scope: every place in `admin-app/src/features/order/**` (plus `packages/shared-api` and
`packages/shared-domain`) where an order touches a plan or carries a plan objective.
Function level.

This is where the plan-type concept actually **lives** today, because the plan entity has no
type field and the order does.

---

## 1. The field: `order_plan_objective`

### `packages/shared-domain/orders/order.ts`
```ts
export type Order = {
  id?: number;
  client_id: string;
  order_plan_objective?: string | null;   // ← line 35
  ...
}
```

**A loose `string | null`.** Not a union, not validated against
`local_delivery | store_pickup | international_shipping` anywhere in the type system. The
same file also declares `OrderDeliveryWindowType`, `OrderOperationTypes`, `OrderItemPreview`,
`OrderDeliveryWindow`.

The plan link fields (`delivery_plan_id`, `route_group_id`) live on the same shared `Order`
type; the admin app's `features/order/types/order.ts` re-exports rather than redefining them.

### Semantics as implemented
| `delivery_plan_id` | `order_plan_objective` | Meaning |
|---|---|---|
| `null` | `null` | Unscheduled, no hint |
| `null` | any value | Unscheduled + AI planning hint (the only case the order form can produce) |
| set | `"local_delivery"` | Scheduled — the only combination any assignment path can currently produce |
| set | anything else | **Unreachable through the UI today.** Reachable only via API/import |

---

## 2. The writers — every path that sets `order_plan_objective`

There are **five**. Four hardcode `"local_delivery"`; the fifth is the form, which is
suppressed whenever a plan is attached.

| # | Location | Line | Value written | Trigger |
|---|---|---|---|---|
| 1 | `plan/controllers/plan.controller.ts` → `patchOrdersPlanByServerIds` | 187 | `"local_delivery"` | Creating a plan with orders pre-linked |
| 2 | `plan/controllers/useExecutePlanDndIntent.ts` → `updateOrdersDeliveryPlanBatch` | 163 | `"local_delivery"` | Batch drag onto a plan |
| 3 | `order/controllers/orderMutations.controller.ts` | 78 | `targetPlanId == null ? null : "local_delivery"` | Single order → plan (drag or action) |
| 4 | `order/controllers/orderBatchDeliveryPlan.controller.ts` | 156 | `normalizedPlanId == null ? null : (planType ?? "local_delivery")` | Batch plan move (accepts a `planType` param, but every caller passes the constant) |
| 5 | `plan/routeGroup/actions/moveOrderToRouteGroup.action.ts` | 147 | `"local_delivery"` | Moving an order between route groups |

Plus the form path, which **cannot** write an objective for a planned order — see §5.

> **Key fact:** none of these values are sent to the server. Both assignment endpoints
> (§4) take only a plan id (and optionally a route group id). `order_plan_objective` in the
> frontend is a purely **optimistic** value predicting what the backend will set. Today the
> backend agrees, because `update_order_route_plan.py` unconditionally sets
> `order_plan_objective = "local_delivery"`. When the backend starts deriving the objective
> from the plan's type, these five writers become wrong predictions — the store will show
> `local_delivery` until the next refetch.

---

## 3. `controllers/` — the assignment orchestrators

### `controllers/orderPlanPatch.controller.ts` (129 LOC)
Pure store patching for plan links. No API calls. Used by `plan.controller.ts`.

`useOrderPlanPatchController()` →
- **`patchOrdersPlanByServerIds({orderServerIds, planId, planType})`** — dedupes and filters
  finite ids, maps server ids → client ids through `state.idIndex`, skips unknown ones, then
  `patchMany(clientIds, { delivery_plan_id: planId, order_plan_objective: planType })`.
  Returns `{ patchedClientIds, skippedServerIds }`. 🔴 `planType` is a caller-supplied
  `string` — the seam is already parameterized here; only the callers are constant.
- **`clearOrdersPlanByPlanId(planId)`** — finds every order with `delivery_plan_id === planId`,
  snapshots `{delivery_plan_id, order_plan_objective}` per client id, then patches both to
  `null`. Returns `{ patchedClientIds, previousByClientId }` for rollback. Used by plan
  deletion.
- **`restoreOrdersPlanLinks(snapshot)`** — restores that snapshot.

`OrderPlanLinkSnapshot = Record<clientId, { delivery_plan_id, order_plan_objective }>`.

### `controllers/orderMutations.controller.ts`
`updateOrderDeliveryPlan(orderId, planId)` — the single-order assignment.
1. Resolves the order by client id (string) or server id (number); errors if missing or unsynced.
2. Normalizes `planId`; rejects `NaN`.
3. 🔴 **Line 78:** `const targetPlanObjective = targetPlanId == null ? null : "local_delivery"`.
4. Snapshots **plan rollup totals** for both the source and destination plan before the
   optimistic transaction, using module-local `subtractItemTypeCounts` / `addItemTypeCounts`
   helpers so `item_type_counts` moves correctly between plans.
5. Runs an `optimisticTransaction`: patches the order's `delivery_plan_id` +
   `order_plan_objective`, adjusts both plans' totals, calls the API, and rolls everything
   back on failure.

### `controllers/orderBatchDeliveryPlan.controller.ts` (~210 LOC)
`useOrderBatchDeliveryPlanController()` → `updateOrdersDeliveryPlanBatch({planId, planType, selection, showIncomingRouteGroupPlaceholders})`.
1. Normalizes `planId`; 🔴 **line 156:** `normalizedPlanType = normalizedPlanId == null ? null : (planType ?? "local_delivery")`.
2. Resolves the concrete target order ids from the batch selection
   (`resolveBatchTargetOrderIds`).
3. 🔴 Optionally registers **incoming route-group placeholders** (ghost cards) when the move
   originates from a route group.
4. Snapshots via `collectOptimisticOrderPlanAssignmentEntries` +
   `collectRouteSolutionStopsByOrderIds`.
5. Optimistic phase: `applyOptimisticOrderPlanAssignment(entries, {targetPlanId, planType, clearRouteGroup: true})`,
   disables order selection mode, 🔴 removes the orders' route-solution stops, and 🔴
   `syncRouteGroupSummaries(collectAffectedRouteGroupIdsFromAssignments(entries))`.
6. Commit/rollback through `optimisticTransaction`.

Module-local helper `resolveRouteGroupIdFromResponse(...)` walks changed solutions and stops
to infer the single destination route group id (returns `null` when ambiguous).

---

## 4. `api/` — what actually goes over the wire

### `packages/shared-api/orders/createOrdersApi.ts`
| Function | Request | Notes |
|---|---|---|
| `updateOrderDeliveryPlan(orderId, planId, payload?)` | `PATCH /order_assignments/orders/{orderId}/plan/{planId\|null}` body `UpdateOrderDeliveryPlanPayload` | 🔑 **Payload is `{ route_group_id?, prevent_event_bus? }` — there is no objective/plan-type field.** |
| `resolveOrderBatchSelection(selection)` | `POST /order_assignments/selection/resolve` | Expands a selection (filters/ids) into concrete order ids |
| `updateOrdersDeliveryPlanBatch(planId, selection)` | `PATCH /order_assignments/plans/{planId\|null}/batch` body `{ selection }` | 🔑 **No plan type in the request either.** |
| `listOrderMapMarkers(query?)` | `GET /orders/map_markers/` | |

### `admin-app/src/features/order/api/orderApi.ts`
Re-exports the shared API as hooks (`useUpdateOrderDeliveryPlan`,
`useUpdateOrdersDeliveryPlanBatch`, `useResolveOrderBatchSelection`, …) and adds:
- `OrderRouteContextResponse = { order_id, route_solution?, route_solution_stop?, route_plan_id?, route_group_id? }`
- `getOrderRouteContext(orderId)` → `GET /orders/{orderId}/route-context` 🔴 — route artifacts
  for one order; used to hydrate the order detail header

---

## 5. The order form

### `forms/orderForm/components/OrderFormFields.tsx` 🔑
Line 287:
```tsx
{formState.delivery_plan_id == null ? (
   ... Order plan objective <OptionPopoverSelect/> ...
) : null}
```
The objective selector is rendered **only for unplanned orders**, and only inside the
"more" section (`showMore`).

### `forms/orderForm/OrderForm.layout.model.tsx`
```ts
export const ORDER_PLAN_OBJECTIVE_OPTIONS = [
  { label: "Local delivery",         value: "local_delivery" },
  { label: "International shipping", value: "international_shipping" },
  { label: "Store pickup",           value: "store_pickup" },
]
```
🔑 **All three objectives already exist as user-selectable options.**

### `forms/orderForm/info/orderPlanObjective.info.ts`
`ORDER_PLAN_OBJECTIVE_INFO` — explains the field as an **AI planning hint** ("helps the AI
place the order into the most suitable plan type when plans are created automatically"),
and states: *"This option is only available when the order is created outside an existing
delivery plan."* Copy that must change if the guard changes.

### `api/mappers/orderForm.normalize.ts` 🔑 — the hard gate
```ts
order_plan_objective:
  state.delivery_plan_id == null
    ? toNullableString(state.order_plan_objective)
    : null,
```
**Even if the UI guard were removed, the payload mapper still nulls the objective whenever a
plan is attached.** Two independent gates, same rule. Any change to objective-editing must
touch both.

### `forms/orderForm/state/orderForm.setters.ts`
`handleOrderPlanObjective(value)` → `updateFormState(prev => ({...prev, order_plan_objective: value}))`.
Plain setter, no guard.

### `forms/orderForm/state/OrderForm.types.ts`
`OrderFormState` carries `order_plan_objective`, `delivery_plan_id?: number | null`,
`route_group_id?`.

### `forms/orderForm/flows/orderFormBootstrap.flow.ts`
Line 81: `delivery_plan_id: order?.delivery_plan_id ?? deliveryPlanId ?? null` — the form
inherits the plan id either from the edited order or from the popup payload (i.e. "create an
order inside this plan").

### `forms/orderForm/controllers/useOrderFormSubmit.actions.ts` 🔴
- Passes `order_plan_objective: resolvedOrder.order_plan_objective` into the **item label
  identifier** on create (line 147).
- Passes `routePlanId: normalizedCurrent?.delivery_plan_id` into label downloads (line 155).
- `reopenOrderFormOnRollback` re-opens the popup with `deliveryPlanId` + `routeGroupId`
  preserved.

### `forms/orderForm/controllers/orderFormSubmitFeedback.presenter.ts`
Line 90 — same `routePlanId` propagation for the post-submit label flow.

### `domain/useOrderValidation.ts`
```ts
const validateOrderPlanObjective = (value) => !value || validateString(value)
```
🔴 **Accepts any non-empty string.** Applied in `validateOrderFields` when
`'order_plan_objective' in fields`. Adding a new objective needs no validation change —
which also means a typo passes silently.

---

## 6. Query filtering — the visibility gate

### `domain/orderHiddenQueryFilters.ts` 🔑
```ts
export const HIDDEN_ORDER_QUERY_FILTERS: OrderQueryFilters = {
  plan_type: ["local_delivery", "international_shipping"],
}
```
- `applyHiddenOrderQueryFilters(filters)` — merges the hidden filter **over** whatever the
  user set (so it cannot be overridden).
- `stripHiddenOrderQueryFilters(filters)` — removes it for display purposes.

### `store/orderQuery.store.ts`
The hidden filter is baked into the store's **initial state** (`{ unschedule_order: true,
...HIDDEN_ORDER_QUERY_FILTERS }`), re-applied by `setQueryFilters`, `updateQueryFilters`,
`deleteQueryFilter`, and `resetQuery`, and re-applied again on read by `getQueryFilters()`.
There is no path that produces an order query without it.

### `components/pageHeaders/OrderMainHeader.tsx`
`stripHiddenOrderQueryFilters(query.filters)` — so the user never sees the hidden chip.

### Consequence 🔑
**Orders with `order_plan_objective === "store_pickup"` are invisible in the admin order
list, always.** `international_shipping` passes. If store-pickup plans start producing
store-pickup orders, this constant must change or those orders vanish from every list,
search, and map-marker query.

### `domain/orderFilterConfig.ts`
`plan_type` is registered in `orderStringFilters` (the set of filters treated as string
queries) — so it is already a supported user-facing filter key, just permanently overridden.

---

## 7. `utils/orderPlanAssignmentOptimistic.ts` 🔑

The reusable optimistic-assignment triple. Type: `OptimisticOrderPlanAssignmentEntry =
{ clientId, serverId, previousDeliveryPlanId, previousOrderPlanObjective, previousRouteGroupId }`.

| Function | Behavior |
|---|---|
| `collectOptimisticOrderPlanAssignmentEntries(orderServerIds)` | Dedupes/filters ids, resolves each to a client id, snapshots the three plan-link fields. Skips unknown orders |
| `applyOptimisticOrderPlanAssignment(entries, {targetPlanId, planType, clearRouteGroup})` | `patchMany` with `{ delivery_plan_id, order_plan_objective: planType, route_group_id: null? }`. 🔴 `planType` is caller-supplied |
| `restoreOptimisticOrderPlanAssignment(entries)` | Restores all three fields per order |
| `collectAffectedRouteGroupIdsFromAssignments(entries)` | 🔴 The distinct previous route group ids, for summary resync |

**This file is already plan-type-agnostic.** It is the correct place for a resolved objective
to flow through once one exists.

---

## 8. Store

### `store/order.store.ts`
Entity store keyed by `client_id`, with `idIndex` (server id → client id) and a
`ordersByCostumerId` secondary index kept in sync by `syncOrdersByCostumerIdIndex()`.

Plan-relevant members:
- `selectOrdersByPlanId(planId)` 🔑 — **linear scan over `allIds` filtering
  `order.delivery_plan_id === planId`.** This is how any plan workspace lists its orders, and
  it is already type-agnostic — a container plan page can use it unchanged.
- `setOrderPlanId(clientId, planId)` — sets only `delivery_plan_id`.
- `patchMany(clientIds, patch)` — the bulk patch used by every optimistic path.
- `upsertOrder`, `upsertOrders`, `setOrder`, `setOrders`, `updateOrderByClientId`,
  `removeOrderByClientId`, `clearOrders`, `setVisibleOrders`, `appendVisibleOrders`,
  `addVisibleOrder`.

### `store/orderSelection.store.ts` / `orderSelectionHooks.store.ts`
Multi-select machinery: `buildBatchSelectionPayload(state)` produces the
`OrderBatchSelectionPayload` (either explicit ids or a filter-authority selection) consumed
by every batch endpoint. `resolveSelectionAuthorityBatchCount` bounds it. Type-agnostic.

---

## 9. Labels and print templates 🔴

| File | Objective usage |
|---|---|
| `item/domain/itemsForDownloading.ts` | Threads `order_plan_objective` from the order identity into each item's label payload (lines 17, 29, 101, 105) |
| `item/flows/startItemLabelDownload.flow.ts` | Line 143 — passes `resolvedOrder?.order_plan_objective` into the template data |
| `templates/printDocument/components/templates/item/sevenByTenTemplateItem.pdf.ts` | Declares `order_plan_objective?: string \| null`; `fmtPlanObjective` (line 454) renders it as human text; `switch` at 117–119 branches on `international_shipping` / `local_delivery`; line 371 is a fixture using `international_shipping` |

🔑 **The item label already prints the objective and already knows all three values.** A
container plan's orders will print the right label text as soon as the objective is correct —
no template change needed.

---

## 10. Order detail header 🔴

`features/order/**` renders the plan chip through plan core's
`useOrderDetailHeaderPlanMeta({orderId, routePlanId, routeGroupId})` (see
[01](01_plan_core.md) §8), which resolves a route stop to show an arrival time. With no stop,
the label and date still render and the arrival time is omitted — safe degradation.

`plan/domain/orderAssignmentContactWarning.domain.ts` gates on `order.delivery_plan_id != null`
only — type-agnostic.

---

## 11. Summary — what changes if the plan gains a type

| Behavior | Where | Change needed |
|---|---|---|
| The objective written on assignment | 5 writers (§2) | Read the target plan's type instead of the constant |
| The objective sent to the server | nowhere | Either add it to the assignment payloads, or let the backend derive it and stop predicting client-side |
| Objective editable on a planned order | `OrderFormFields.tsx:287` **and** `orderForm.normalize.ts:36-39` | Both gates, or neither |
| Store-pickup orders visible | `orderHiddenQueryFilters.ts:4` | Must widen, or store-pickup orders disappear |
| Objective validation | `useOrderValidation.ts:17` | No change required (accepts any string) |
| Item labels | `sevenByTenTemplateItem.pdf.ts` | No change required (all three already handled) |
| Optimistic assignment plumbing | `orderPlanAssignmentOptimistic.ts` | No change required (already parameterized) |
| Route-artifact cleanup on assignment | `orderBatchDeliveryPlan.controller.ts` steps 3 & 5 | Should be skipped for container plans (harmless but wasteful — there are no stops to remove) |
