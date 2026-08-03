# 06 — Implementation Plan: Route Plan Types (Frontend)

Status: **awaiting approval**
Grounded in: [ROUTE_PLAN_TYPES_2026-08-03.md](ROUTE_PLAN_TYPES_2026-08-03.md) (backend handoff),
[new_implementation_intention.md](new_implementation_intention.md) (product intent),
[01](01_plan_core.md)–[05](05_plan_type_coupling_matrix.md) (codebase baseline).

---

## 1. Decisions locked in review

| # | Decision |
|---|---|
| D1 | **Same workspace window, three page containers.** The base panel keeps hosting the plan workspace; `RouteGroupsPage` stays for `local_delivery`, and the two scaffold features become real page containers for the other types. **Routing is centralized in the home container**, not scattered across features |
| D2 | **The mismatch popup fires on order-vs-plan disagreement**, not order-vs-order. An order whose `order_plan_objective` differs from the destination plan's `plan_type` prompts; confirming lets the backend perform the transition; cancelling performs nothing |
| D3 | **A null `order_plan_objective` adopts the plan type silently.** No warning — null means "no stated intention" |
| D4 | **Create form gets the plan type selector only** (default local delivery); zones stay visible only for local. The domain-specific fields (`carrier_name`, `pickup_location`, `assigned_user_id`) are **not** collected. *Revised in second review — supersedes the earlier "full fields now" decision* |

## 2. Assumption carried forward (not corrected in review)

**A1 — auto-create from a multi-order drop onto an empty calendar day.** There is no plan yet,
so there is nothing for an order to disagree with. Proposed rule:

```
distinct non-null objectives among dragged orders
  exactly one          → create a plan of that type
  none (all null)      → create local_delivery
  more than one        → create the majority type; tie → local_delivery
then: any order whose non-null objective ≠ the chosen type goes through the D2 popup
```

Review did not correct this, so I am building it as written. The alternative is "mixed always
→ local_delivery" — a single function in `planObjectiveMismatch.domain.ts`, swappable later
without touching anything else.

## 3. Resolved in review: domain child rows are out of scope

The earlier open item — no read endpoint for `international_shipping_plan` (`carrier_name`)
and `store_pickup_plan` (`pickup_location`, `assigned_user_id`) — is closed by decision, not
by a new endpoint: **the frontend neither sends nor reads these fields this round.**

Consequences, applied throughout the phases below:

- Create payloads for both new endpoints carry **shell fields only**: `label`, `start_date`,
  `end_date`, `date_strategy`, `order_ids`, `client_id`. All three domain fields are optional
  server-side, so omitting them is valid.
- The create response's `international_shipping_plan` / `store_pickup_plan` key is **ignored**.
  No child types, no child stores, no child API calls.
- The two workspaces render **plan header + orders**, with no domain block.
- The address-schema validation for `pickup_location` is not needed.

This removes a store, an api file, a form section, and a validation path from each feature.
When carrier/pickup support is wanted later it is additive: a payload field, a form section,
and a read path.

---

## 4. The architectural change

One seam, centralized as requested:

```
PlanCard / PlanCalendarPlanChip  →  openPlanSection(plan)        [unchanged]
      ↓
baseControlls.openBase({ payload: { planId } })                  [unchanged]
      ↓
HomeDesktopView / HomeMobileView
      ↓
useActivePlanWorkspace()          ← NEW, home-route-operations/flows
      │  planId → plan from store (fetch if missing) → plan_type
      ↓
planWorkspaceRegistry[planType]   ← NEW, home-route-operations/registry
      ├ local_delivery         → RouteGroupsPage            (unchanged)
      ├ international_shipping → InternationalShippingOrdersPage
      └ store_pickup           → StorePickupOrdersPage

Also gated on `isLocalDeliveryWorkspace`:
      RouteGroupWorkspaceRuntime   (map markers/polylines/lasso)
      RouteGroupMapOverlay         (map overlay swap)
```

Everything else in the plan is value-level: replace constants with a resolved `plan_type`.

---

## 5. Work plan

Nine phases. Each is independently reviewable; 1–3 land the contract and routing, 4–6 the
user-facing features, 7–9 the guards and polish.

### Phase 1 — Contracts (`plan/types`, `plan/api`)

**`plan/types/plan.ts`**
- Widen `RoutePlanObjective` to `"local_delivery" | "international_shipping" | "store_pickup"`.
- Add `plan_type?: RoutePlanObjective | null` to `DeliveryPlan`.
- Split the create payload in two:
  - `LocalDeliveryPlanCreatePayload` — current fields; **resolve drift D3** by declaring
    `route_group_defaults?: RouteGroupDefaults` (what the controller actually sends) and
    deleting the never-sent `plan_type_defaults`.
  - `ContainerPlanCreatePayload` — shell fields only (`label`, `start_date`, `end_date?`,
    `date_strategy?`, `order_ids?`, `client_id?`), shared by both new endpoints per §3.
  - Neither carries `plan_type` (the endpoint implies it) or `state_id` (rejected).
- Response types: `PlanCreateResponse` stays `{ created: [...] }`, but the bundle key differs
  per endpoint — local returns `delivery_plan`, the new ones return `route_plan`. Type the
  container bundle as `{ route_plan: DeliveryPlan }`; the domain child key present in the JSON
  is ignored (§3).
- Delete the dead `PlanTypeFields`, `PlanTypeStoreFields`, `PlanTypeState`,
  `PlanTypeDefaultsResolver` (register items 6 in [01](01_plan_core.md) §16) — replaced by
  real types.

**`plan/types/planMeta.ts`**
- `PlanQueryFilters.plan_type?: RoutePlanObjective | RoutePlanObjective[]` (backend accepts
  single or list).

**`plan/api/plan.api.ts`**
- `createInternationalShippingPlan(payload)` → `POST /international_shipping_plans/` `{ fields: [payload] }`
- `createStorePickupPlan(payload)` → `POST /store_pickup_plans/` `{ fields: [payload] }`

> **Placement rationale:** all three create calls stay in plan core. Plan *creation* is a
> plan-core concern (one form, one controller); the *workspaces* are the type-specific
> features. Putting the creates in the feature folders would force plan core to import
> feature internals, which `AGENTS.md` forbids.

**`plan/api/mappers/planCreateResponse.mapper.ts`** *(new)*
- `normalizePlanCreateBundle(bundle)` → `{ plan: DeliveryPlan, routeGroups: RouteGroup[] }`,
  absorbing the `delivery_plan` vs `route_plan` key asymmetry in one place.

---

### Phase 2 — Plan type domain (single source of truth)

**`plan/domain/planType.ts`** *(new)*
```ts
PLAN_TYPES: readonly RoutePlanObjective[]
DEFAULT_PLAN_TYPE = 'local_delivery'
isPlanType(value): value is RoutePlanObjective
normalizePlanType(value): RoutePlanObjective          // null/unknown → default
resolvePlanType(plan): RoutePlanObjective             // plan.plan_type → normalize
isLocalDeliveryPlan(plan): boolean
PLAN_TYPE_LABELS / PLAN_TYPE_SHORT_LABELS            // "Local delivery" / "Local"
PLAN_TYPE_DESCRIPTIONS                                // sourced from PLAN_MAIN_HEADER_INFO
PLAN_TYPE_OPTIONS                                     // for OptionPopoverSelect
```

**`plan/utils/planIconTypeMap.ts`** — add `international_shipping: InternationalIcon` and
`store_pickup: StoreIcon` (both already exist in `assets/icons`). Keep `routePlanIcon`.

**`plan/flows/planTypeWithFetch.flow.ts`** — currently `plan ? 'local_delivery' : null`.
Make it real: resolve from the plan, fetching by id when absent from the store.

**`plan/domain/planObjectiveMismatch.domain.ts`** *(new, pure)*
```ts
type ObjectiveMismatch = { orders: Order[]; targetPlanType: RoutePlanObjective }
resolveObjectiveMismatch({ orders, targetPlanType }): ObjectiveMismatch | null
  // null objective never mismatches (D3); returns null when nothing disagrees
resolveAutoCreatePlanType(orders): RoutePlanObjective   // assumption A1
```

---

### Phase 3 — Centralized workspace routing

**`home-route-operations/registry/planWorkspaceRegistry.ts`** *(new)*
```ts
export const planWorkspaceRegistry = {
  local_delivery: RouteGroupsPage,
  international_shipping: InternationalShippingOrdersPage,
  store_pickup: StorePickupOrdersPage,
} satisfies Record<RoutePlanObjective, ComponentType<{ payload: PayloadBase; onRequestClose?: () => void }>>
```
All three already accept the identical `{ planId?, freshAfter? }` payload — no signature work.

**`home-route-operations/flows/useActivePlanWorkspace.flow.ts`** *(new)*
- Reads `baseControlls.payload.planId`, resolves the plan from the store.
- **Cold-open guard:** when the plan is not in the store (deep link, notification target,
  refresh), fires `fetchPlanById` once and returns `status: 'resolving'` so the panel shows a
  loader instead of guessing a workspace. Resolves to the default type only if the fetch fails.
- Returns `{ status, planType, Workspace, isLocalDeliveryWorkspace, payload }`.

**`home-route-operations/views/HomeDesktopView.tsx`**
- L246: `<RouteGroupsPage .../>` → `<Workspace payload={...} onRequestClose={...}/>` (+ loader branch).
- L183-187: gate `RouteGroupWorkspaceRuntime` on `isLocalDeliveryWorkspace`.
- L208-209: gate `RouteGroupMapOverlay` on `isLocalDeliveryWorkspace`; non-local plans keep the
  order/zone overlays.

**`home-route-operations/views/HomeMobileView.tsx`** — L47, same substitution.

**`home-route-operations/flows/homeDesktopDerivedState.flow.ts`**
- Keep `isRouteOperationsOverlayActive` (drives layout + aurora dimming — type-independent).
- Add `isLocalDeliveryWorkspaceActive` for the two map gates above.

**Delete** `plan/utils/planSectionTypeMap.ts` and `plan/registry/planSections.registry.ts`
— both dead, and now genuinely superseded. (Flagged before deleting, per the repo rules on
destructive changes.)

---

### Phase 4 — The two workspace features

Identical build-out per feature, replacing the placeholder content. Folders already exist.

```
<feature>/
  domain/<x>PlanSummary.ts      view-model builder (label, date range, state, type)
  flows/<x>PageInitialization.flow.ts
  controllers/use<X>PageController.ts
  context/<X>.provider.tsx      extended: { planId, plan, planType, orders, isLoading }
  pages/<X>.page.tsx            provider + content (payload guard already written)
  pages/<X>Content.page.tsx     header + order list + empty state
  components/<X>PlanHeader.tsx
```

No `api/` or `store/` folder in either feature: the plan comes from the shared plan store, the
orders from the shared order store, and there are no domain child rows to hold (§3).

Behaviour, both features:
- **Init flow:** hydrate the plan (`fetchPlanById` when missing) and its orders
  (`usePlanOrders.fetchPlanOrders(planId)` → shared order store). Honours `freshAfter` the
  same way the route-group init flow does.
- **Orders:** `selectOrdersByPlanId(planId)` from the order store — already type-agnostic.
- **List:** reuse `features/order/components/lists/OrderList`. It takes `orders` + callbacks
  and renders `DraggableOrderCard`, so orders remain draggable out of the workspace (to
  another plan or to unschedule) for free.
- **Header:** plan type icon, label, date range, state chip, close button — mirroring
  `RouteGroupsPageHeader`'s shell without the rail/optimize/import row.
- **Empty state:** "No orders on this plan yet — drag orders here from the order list."
- **Not built:** map overlay, route optimization, route groups, stop ordering, domain fields.
  None apply.

Barrels (`index.ts`) already export the page components; extend with the provider and
controller. The placeholder `store/<x>Orders.store.ts` (an unused `isInitialized` flag) is
removed — the shared plan and order stores cover everything these pages need.

⚠️ Also fixed while here: `StorePickupOrders.page.tsx` currently ignores its own provider and
content component and inlines a "Coming Soon" div, and both `*Content.page.tsx` files carry an
unused `ReactNode` import plus an empty props type.

---

### Phase 5 — Create flow (form + controller)

**`plan/forms/planForm/`**
- `PlanForm.types.tsx` — `planForm: DeliveryPlan` now carries `plan_type`; `PopupPayload` gains
  an optional `initialPlanType` so a future "create international plan" entry point can
  pre-select. No separate domain-field state (§3).
- `planForm.setters.ts` — **implement the existing `handlePlanType` no-op**. Switching away
  from local delivery clears `selectedZoneIds`, so a type change can never smuggle zones into
  a payload that rejects them.
- `PlanForm.layout.tsx` — plan type `OptionPopoverSelect` under the plan name; the zone
  selector becomes conditional on `local_delivery`; `PlanTypeDescription` rendered under the
  selector.
- `PlanForm.validation.ts` / `.warnings.ts` — unchanged (name + dates only).
- `planFormBootstrap.flow.ts` — seed `plan_type: DEFAULT_PLAN_TYPE`.
- `PlanTypeDescription.tsx` — becomes `({ planType })` and returns the matching copy from
  `PLAN_TYPE_DESCRIPTIONS`. (It is currently a hardcoded local-delivery paragraph, exported
  but rendered nowhere.)
- `planForm.actions.ts` — before creating with `selectedOrderServerIds`, run the D2 mismatch
  check against the chosen type; cancel aborts the create.

**`plan/controllers/plan.controller.ts` → `createPlan(payload, options)`**
- New `options.planType` (defaults to `local_delivery`).
- Dispatch:
  - `local_delivery` → unchanged path, including `resolvePlanTypeDefaults` and `zone_ids`.
  - non-local → `createInternationalShippingPlan` / `createStorePickupPlan`; **skip
    `resolvePlanTypeDefaults` entirely** (no geolocation prompt, risk #5 in
    [05](05_plan_type_coupling_matrix.md)), and never send `zone_ids` / `route_group_defaults`
    (the endpoints reject them).
- Optimistic insert carries `plan_type` so the card/chip renders the right icon immediately.
- Response through `normalizePlanCreateBundle`.
- L187 `patchOrdersPlanByServerIds({ ..., planType })` — pass the created plan's real type.

---

### Phase 6 — Assignment + mismatch warning

**`plan/popups/PlanObjectiveMismatch/PlanObjectiveMismatchPopup.tsx`** *(new)*
- Registered as `plan.order-objective-mismatch` in `planPopupRegistry`.
- Copy: *"This order was created for **International shipping**, but **Q4 Overseas** is a
  **Store pickup** plan. Moving it will change its objective to Store pickup. Continue?"*
  Batch variant summarises counts per objective and lists the affected orders.
- Actions: **Move anyway** / **Cancel**.

**`plan/controllers/usePlanObjectiveMismatchController.ts`** *(new)* — mirrors the existing
`usePlanDndContactWarningController`: `requiresConfirmation(orders, targetPlanType)` and a
promise-returning `requestDecision(...)` resolved by the popup.

**`plan/hooks/usePlanOrderDndController.tsx` → `onDragEnd`** — gate inserted before
`execute(intent)`, after the existing contact-warning gate, for:

| Intent | Target type source |
|---|---|
| `ASSIGN_ORDER_TO_PLAN` | destination plan's `plan_type` |
| `ASSIGN_ORDERS_TO_PLAN_BATCH` | destination plan's `plan_type` |
| `CREATE_PLAN_FOR_DATE` | `resolveAutoCreatePlanType(orders)` (A1), then attached to the intent |

Route-stop drags onto a plan resolve into the same two assign intents, so they are covered.
`UNSCHEDULE_*` never prompts.

**Batch limitation to accept:** a selection-authority batch ("select all matching these
filters") cannot have every order inspected client-side. The gate uses
`resolveBatchTargetOrderIds` (the same ids the optimistic path uses) and checks the orders
present in the store. Orders outside the loaded page are not inspected — the backend still
performs the transition correctly, the user just is not warned about unseen rows. Documented,
not worked around.

**`plan/domain/planDndIntent.ts`** — `CREATE_PLAN_FOR_DATE` gains
`planType: RoutePlanObjective`, resolved in the controller (which has store access) rather
than in the pure resolver.

**`plan/controllers/useExecutePlanDndIntent.ts`**
- L163 → destination plan's `plan_type` instead of the literal.
- `CREATE_PLAN_FOR_DATE` → `createPlan(defaults, { newOrderLinks, planType: intent.planType })`;
  `buildCalendarPlanDefaults(dateKey, stateId, planType)` gains the third argument.

**Optimistic split** (per the intention: optimistic where we can, loading where we cannot)

| Knowable client-side → optimistic | Not knowable → loading, reconciled from the response |
|---|---|
| `order.delivery_plan_id` | new route stops when joining a local plan (stop order, ETA) |
| `order.order_plan_objective` = destination `plan_type` | plan rollup totals across a cross-type move |
| `route_group_id = null` for non-local destinations | route-solution resequencing on the source route |
| removal of the order's stops when leaving a local plan | |

`applyOptimisticOrderPlanAssignment` already takes `planType` and clears `route_group_id`;
`registerIncomingRouteGroupOrderPlaceholders` already provides the "incoming, still loading"
ghost cards. Both are reused — the change is passing the real type rather than the literal.

---

### Phase 7 — Remaining type-derived writers and guards

| File:line | Change |
|---|---|
| `order/controllers/orderMutations.controller.ts:78` | Resolve the destination plan's `plan_type` from the store instead of `"local_delivery"` |
| `order/controllers/orderBatchDeliveryPlan.controller.ts:156` | Keep the parameter; the fallback becomes the resolved type. Skip the route-artifact cleanup (placeholders, stop removal, `syncRouteGroupSummaries`) when neither source nor destination is local |
| `plan/routeGroup/actions/moveOrderToRouteGroup.action.ts:147` | **Stays `"local_delivery"`** — route groups only exist on local plans, so the literal is correct here |
| `order/domain/orderHiddenQueryFilters.ts:4` | Add `"store_pickup"`. **Required:** without it, every order moved to a store-pickup plan disappears from the order list — which is the drag source the whole flow depends on (risk #1) |
| `plan/domain/planReactiveVisibility.ts:42` | Compare against the plan's own `plan_type`; support a single value or an array |
| `plan/flows/planQueries.flow.ts` | No change — `normalizePlanQueryForRequest` already nests `plan_type` into `filters`, which is the shape the backend documents |

Route optimization needs no extra guard: optimize actions live inside `RouteGroupsPage`,
which after Phase 3 only renders for local plans.

---

### Phase 8 — Visual references

- **`plan/utils/planIconTypeMap.ts`** — wired to the existing `InternationalIcon` and
  `StoreIcon` from `assets/icons` as **placeholders**. You are adding dedicated SVGs later;
  swapping them is a one-line change per type in this file, with no other file touched.
- **`plan/components/cards/PlanCard.tsx`** — `planIconTypeMap[resolvePlanType(plan)]` instead of
  the literal index; hide the "n zones" metric for non-local plans (`route_groups_count` is
  always 0 there).
- **`plan/calendar/components/PlanCalendarPlanChip.tsx`** — add the same type icon to the chip;
  hide the zone count for non-local. State colour is untouched, as you asked.
- **`plan/calendar/components/PlanCalendarDayPlansOverlay.tsx`** — inherits the card change.
- The type→icon mapping lives in one file (`planIconTypeMap`), so iterating on the visual is a
  single-file change.

### Phase 9 — Tests

Colocated in existing `tests/` folders, matching current conventions:
- `planType.test.ts` — normalization, resolution, default fallback
- `planObjectiveMismatch.test.ts` — null never mismatches (D3); same value never mismatches;
  auto-create type resolution (A1) across unanimous / null / mixed / tie
- `planCreateResponse.mapper.test.ts` — `delivery_plan` vs `route_plan` normalization
- `plan.controller.test.ts` — endpoint dispatch per type; no route-group defaults on non-local
- `planReactiveVisibility.test.ts` — single value and array filters, all three types
- `useActivePlanWorkspace.test.ts` — cold-open resolving state; correct component per type

---

## 6. Risk register for this change

| # | Risk | Mitigation |
|---|---|---|
| 1 | Store-pickup orders vanish from the order list | Phase 7 widens `HIDDEN_ORDER_QUERY_FILTERS`. Landing Phase 7 **before** store-pickup plans become creatable in the UI |
| 2 | Cold-open of a non-local plan guesses the wrong workspace | Phase 3 `resolving` state; never guess before the plan is loaded |
| 3 | Optimistic objective disagrees with the server | Phases 5–7 make every writer read the destination plan's type — matching what the backend now does |
| 4 | Geolocation prompt on non-local creation | Phase 5 skips `resolvePlanTypeDefaults` for non-local |
| 5 | Deleting dead files (`planSectionTypeMap`, `planSectionsRegistry`, the two placeholder feature stores) | Confirmed dead in [05](05_plan_type_coupling_matrix.md); I will confirm with you before deleting |

## 7. Explicitly out of scope

- Domain-specific plan fields — `carrier_name`, `pickup_location`, `assigned_user_id` — in
  both the create form and the workspaces (§3)
- A plan-type filter control in the plan list header (the backend supports it; the intention
  does not ask for it — the list and calendar keep showing all types mixed)
- Editing a plan after creation (the plan form has no save button in edit mode today —
  pre-existing gap, unrelated)
- Making `order_plan_objective` editable on an assigned order (backend now rejects it; the two
  existing frontend gates already match that rule)
- Driver app changes (handoff §1 confirms none are needed)
- Route optimization, route groups, stops, or the map for non-local plans

## 8. Sequencing

```
Phase 1 ─ contracts        ─┐
Phase 2 ─ plan type domain ─┴→ Phase 3 ─ workspace routing ─→ Phase 4 ─ workspaces
                                   │
                                   ├→ Phase 5 ─ create flow
                                   ├→ Phase 6 ─ mismatch + assignment
                                   └→ Phase 7 ─ writers/guards   ← must land before store pickup ships
                                        └→ Phase 8 ─ visuals ─→ Phase 9 ─ tests
```

Phases 1–3 are the risky ones (they touch the shell). 4–9 are additive and independently
verifiable.
