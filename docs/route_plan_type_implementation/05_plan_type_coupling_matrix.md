# 05 — Plan Type Coupling Matrix

The cross-cutting view: every place plan type is **decided**, **assumed**, or **hardcoded**,
and what breaks what.

Read this first. Use [01](01_plan_core.md)–[04](04_registries_and_shell.md) to look up what a
specific file does.

---

## 1. Where plan type lives today

| Question | Answer in the current code |
|---|---|
| Does a plan have a type? | **No.** `DeliveryPlan` has no type/objective field |
| Does an order have a type? | **Yes** — `order_plan_objective?: string \| null` |
| Where is a plan's type derived from? | Nowhere. `usePlanTypeWithFetch` returns `'local_delivery'` for any plan that exists, and has no callers |
| How is a plan's type expressed to the user? | Only implicitly: every plan opens a route-group workspace |
| Is plan type ever sent to the server? | **No.** Neither assignment endpoint carries it; plan create does not carry it |
| Is plan type ever received from the server? | Only indirectly, as `order_plan_objective` on each order |

**The load-bearing assumption:** *plan ⇒ local_delivery*. It is asserted in 17 places
(§2) and relied on structurally in one (§3).

---

## 2. Complete inventory of hardcoded / assumed sites

### A. Type declarations that can only hold one value

| # | File:line | Symbol | Live? |
|---|---|---|---|
| A1 | `plan/types/plan.ts:8` | `RoutePlanObjective = "local_delivery"` | Live (typing `PlanQueryFilters.plan_type`) |
| A2 | `plan/domain/planTypeDefaults/planTypeDefaults.types.ts:14` | `PlanTypeDefaultsResolver(planType: 'local_delivery', ...)` | Dead |
| A3 | `plan/types/plan.ts:50` | `PlanTypeFields = { local_delivery?: RouteGroupInput }` | Live in `PlanUpdateFields`, never populated |
| A4 | `plan/types/plan.ts:54` | `PlanTypeStoreFields = { local_delivery_plan?: RouteGroupInput }` | Same |
| A5 | `plan/types/plan.ts:76` | `PlanTypeDefaults = { route_group_defaults?: ... }` | Live, but see D3 |

### B. Constant maps indexed with a literal key

| # | File:line | Code | Live? |
|---|---|---|---|
| B1 | `plan/utils/planIconTypeMap.ts:6` | `planIconTypeMap = { local_delivery: RouteIcon }` | Live |
| B2 | `plan/components/cards/PlanCard.tsx:44` | `planIconTypeMap.local_delivery` | Live — every plan card shows the route icon |
| B3 | `plan/routeGroup/components/pageHeaders/routeGroupPageHeader.tsx:119` | `planIconTypeMap.local_delivery` | Live |
| B4 | `plan/utils/planSectionTypeMap.ts:7` | `PlanSectionTypesMap = { local_delivery: RouteGroupsPage }` | **Dead** |
| B5 | `plan/domain/planTypeDefaults/planTypeDefaults.registry.ts:4` | `resolvePlanTypeDefaults = buildRouteGroupPlanTypeDefaults` | Live — alias, not a map |

### C. Runtime writes of the literal `"local_delivery"`

| # | File:line | Path |
|---|---|---|
| C1 | `plan/controllers/plan.controller.ts:187` | Plan create with pre-linked orders |
| C2 | `plan/controllers/useExecutePlanDndIntent.ts:163` | Batch drag onto a plan |
| C3 | `order/controllers/orderMutations.controller.ts:78` | Single-order assignment |
| C4 | `order/controllers/orderBatchDeliveryPlan.controller.ts:156` | Batch assignment default (`planType ?? "local_delivery"`) |
| C5 | `plan/routeGroup/actions/moveOrderToRouteGroup.action.ts:147` | Cross-route-group move |

### D. Behavioral gates keyed on the literal

| # | File:line | Behavior | Risk |
|---|---|---|---|
| D1 | `plan/domain/planReactiveVisibility.ts:42` | `filters.plan_type && filters.plan_type !== 'local_delivery' → hide the plan` | **High.** The moment a plan-type filter is used, all non-local plans vanish from the list |
| D2 | `order/domain/orderHiddenQueryFilters.ts:4` | Every order query is forced to `plan_type: ["local_delivery","international_shipping"]` | **High.** `store_pickup` orders are invisible app-wide |
| D3 | `plan/controllers/plan.controller.ts` (create) | Sends `route_group_defaults`, while `PlanCreatePayload` declares `plan_type_defaults` | **Medium.** Type/runtime drift that must be resolved before per-type defaults are possible |
| D4 | `plan/flows/planTypeWithFetch.flow.ts:5` | `plan ? 'local_delivery' : null` | Dead, but it is the intended resolver |
| D5 | `order/forms/orderForm/components/OrderFormFields.tsx:287` | Objective selector hidden when `delivery_plan_id != null` | Intentional; see [03](03_order_coupling.md) §5 |
| D6 | `order/api/mappers/orderForm.normalize.ts:36` | Objective nulled in the payload when `delivery_plan_id != null` | Second, independent gate on the same rule |

### E. Structural assumptions (no literal, but local_delivery-only by construction)

| # | File:line | Assumption |
|---|---|---|
| E1 | `home-route-operations/views/HomeDesktopView.tsx:246` | Every open plan panel renders `RouteGroupsPage` |
| E2 | `home-route-operations/views/HomeMobileView.tsx:47` | Same, mobile |
| E3 | `home-route-operations/views/HomeDesktopView.tsx:208-209` | Any open plan panel swaps the map to `RouteGroupMapOverlay` |
| E4 | `home-route-operations/views/HomeDesktopView.tsx:183-186` | Any open plan panel mounts `RouteGroupWorkspaceRuntime` |
| E5 | `home-route-operations/flows/homeDesktopDerivedState.flow.ts:21` | `isRouteOperationsOverlayActive = baseControlls.isBaseOpen` — "route operations mode" ≡ "a plan is open" |
| E6 | `plan/actions/usePlanActions.ts:32-43` | `openPlanSection(plan)` passes only `{ planId }` — no type reaches the workspace |
| E7 | `plan/forms/planForm/PlanForm.layout.tsx` | The create form offers a **zone selector** (a route-group concept) and no type selector |
| E8 | `plan/controllers/plan.controller.ts` (create step 3) | `resolvePlanTypeDefaults` runs on every create — geolocation prompt + route preferences |
| E9 | `plan/components/cards/PlanCard.tsx` | Shows `route_groups_count` as "n zones" for every plan |
| E10 | `realtime/notifications/adminNotificationTargets.ts` | Plan notifications use target kind `local_delivery_workspace` |
| E11 | `home-route-operations/flows/mapSelectionModeGuard.flow.ts:19,41,69` | Map selection conflicts are resolved in terms of route-group selection (`disable_local_delivery`) |

---

## 3. The single structural blocker

Everything in §2 A–D is a **value** that can be made variable. §2 E1–E5 is different: there
is **no second workspace to render**. The shell does not look anything up — it names
`RouteGroupsPage` directly in JSX, three times, plus the map overlay and the runtime.

```
openPlanSection(plan)                       plan/actions/usePlanActions.ts
   └─ baseControlls.openBase({ planId })    payload = { planId, freshAfter } only
        └─ HomeDesktopView / HomeMobileView
             └─ <RouteGroupsPage payload={...}/>          ← hardcoded, no dispatch
             └─ <RouteGroupMapOverlay/>                   ← hardcoded
             └─ <RouteGroupWorkspaceRuntime/>             ← hardcoded
```

Today, opening a plan that has no route groups shows `RouteGroupsPage`'s **"No Route Groups
Yet — Create Route Group"** empty state. That is precisely what a store-pickup or
international-shipping plan would display.

---

## 4. Change-impact matrix

Rows = a change you might make. Columns = what else must move with it.

| If you change… | You must also touch | Because |
|---|---|---|
| **Add a type field to `DeliveryPlan`** | `types/plan.ts`; whatever normalizes plan responses (`planQueries.flow.ts`, `routeGroupOverview.flow.ts` `applyRouteGroupPayload`); `makeRoutePlan` fixture | The field has to survive every store write path |
| **Add a type to `PlanCreatePayload`** | `plan.controller.ts` create; `planForm.actions.ts`; `PlanForm.types.tsx` `PopupPayload`; `useOpenCreatePlanFormAction`; `buildCalendarPlanDefaults` (calendar drop-create); `useExecutePlanDndIntent` `CREATE_PLAN_FOR_DATE` | Four independent creation entry points: the form, a calendar `+`, an empty-day drop, and an order-multi-select |
| **Make `resolvePlanTypeDefaults` type-aware** | `planTypeDefaults.registry.ts`, `.types.ts` (use the unused `PlanTypeDefaultsResolver`), `plan.controller.ts`, and **resolve D3 first** | Otherwise per-type defaults land in a key the type doesn't declare |
| **Render a different workspace per type** | E1–E5 (5 JSX sites in 2 files + the derived boolean); optionally revive `PlanSectionTypesMap`; the new workspace needs a provider + page pair | The only real architectural work |
| **Stop forcing `local_delivery` on assignment** | C1–C5 (5 sites) — each must read the target plan's type | Every one is a different code path (create, single, batch, DnD batch, route-group move) |
| **Send objective to the server on assignment** | `packages/shared-api/orders/createOrdersApi.ts` (`UpdateOrderDeliveryPlanPayload` and the batch body) | Neither endpoint has a field for it today |
| **Let a planned order change its objective** | D5 **and** D6 — both gates | They are independent; removing one changes nothing |
| **Allow `store_pickup` orders in the app** | D2 (`orderHiddenQueryFilters.ts:4`) | Otherwise every list, search, and map-marker query drops them |
| **Filter plans by type in the list** | D1 (`planReactiveVisibility.ts:42`), `PlanQueryFilters.plan_type` (A1), `normalizePlanQueryForRequest` (already nests it correctly), `PlanMainHeader` filter UI | Server filter + client reactive filter must agree, or optimistic inserts flicker |
| **Show a per-type icon** | B1–B3 | Two call sites index the constant key |
| **Show a per-type plan card** | `PlanCard.tsx` (icon, "n zones" metric), optionally `PlanTypeDescription` | `route_groups_count` is meaningless for container plans |
| **Skip route cleanup for container plans** | `orderBatchDeliveryPlan.controller.ts` (placeholder registration, stop removal, `syncRouteGroupSummaries`) | Currently unconditional; harmless but wasteful |
| **Route notifications per type** | `adminNotificationTargets.ts` + backend `_build_notification_target` | Target kind is named for one type |
| **Build out the scaffold features** | `international-shipping-orders/`, `store-pickup-orders/` + registration in the shell | Nothing imports them today |

---

## 5. Ranked risk register

| Rank | Risk | Trigger | Blast radius |
|---|---|---|---|
| 1 | **`store_pickup` orders become invisible** | Backend starts setting `order_plan_objective = "store_pickup"` | Every order list, search, filter, and map-marker query in the admin app — `orderHiddenQueryFilters.ts:4` |
| 2 | **A container plan opens the route workspace** | Any user clicks a non-route plan | Shows "No Route Groups Yet"; the Create Route Group button would materialize route artifacts on a container plan |
| 3 | **Optimistic objective disagrees with the server** | Backend derives objective from the plan type while C1–C5 still write `local_delivery` | Store shows the wrong objective until refetch; item labels print the wrong plan objective |
| 4 | **Plan type filter hides everything** | A `plan_type` filter is introduced without fixing `planReactiveVisibility.ts:42` | Plan list and calendar silently empty |
| 5 | **Geolocation prompt on container-plan creation** | Any plan creation | `resolvePlanTypeDefaults` → `getCurrentLocationAddress()`; user-visible permission prompt for a plan that has no route |
| 6 | **`plan_type_defaults` vs `route_group_defaults` drift** | Per-type defaults work begins | Silent — TypeScript does not catch it (spread bypasses excess-property checking) |
| 7 | **Route map overlay on a container plan** | Plan panel opens | `RouteGroupMapOverlay` replaces the order/zone overlays with nothing to draw |

---

## 6. Assets that already exist (don't rebuild these)

| Asset | Location |
|---|---|
| Product copy for all three plan types | `plan/info/planMainHeader.info.ts` — "Route plans", "International shipping plans", "Store plans" |
| All three objective options in the order form | `order/forms/orderForm/OrderForm.layout.model.tsx` |
| Item label rendering for all three objectives | `templates/printDocument/.../sevenByTenTemplateItem.pdf.ts` |
| `plan_type` already a supported query filter key | `PlanQueryFilters.plan_type`, `orderStringFilters` |
| A generic "orders in this plan" endpoint + hook | `planApi.getPlanOrders` + `usePlanOrders` |
| A generic plan-orders selector | `order/store/order.store.ts` `selectOrdersByPlanId` |
| Type-parameterized optimistic assignment | `order/utils/orderPlanAssignmentOptimistic.ts` |
| Type-agnostic plan CRUD, list, calendar, states, pagination, date filter | `plan/**` (see [01](01_plan_core.md)) |
| A working registry pattern to copy | `homePopupRegistry` |
| Scaffolded feature folders with the right payload shape | `international-shipping-orders/`, `store-pickup-orders/` |
| A stated intent to compose by plan type | `HomeRouteOperationsManagersProvider` docstring; `plan/index.ts` header comment |

---

## 7. Open questions for the backend changes

To be answered when the backend diff arrives; each one changes the frontend plan materially.

1. **Where does the plan's type live?** A column on `RoutePlan`, a workflow-type field, or a
   separate table? What is the serialized field name, and is it present on the list endpoint
   as well as the detail endpoint?
2. **What are the exact values?** Do they match the order objective strings
   (`local_delivery` / `store_pickup` / `international_shipping`), or is there a separate
   plan-type vocabulary with a mapping?
3. **How is type set at creation?** A field on `POST /route_plans/`? Does the existing
   `route_group_defaults` / `zone_ids` payload become conditional?
4. **Does assignment still force `local_delivery`?** Is `update_order_route_plan.py` changed
   to derive the objective from the plan? If so, the five frontend writers should stop
   predicting and start reading the plan (or stop writing entirely).
5. **Is there an overview endpoint for container plans?** Or should the workspace use
   `GET /route_plans/{id}/orders/` directly?
6. **Do container plans have states?** Same `Open/Ready/Processing/Completed/Fail` lifecycle,
   or a reduced one?
7. **What do the list filters accept?** Does `plan_type` become a real server-side filter on
   `GET /route_plans/`?
8. **What realtime events fire for container plans?** Still `delivery_plan.updated`, or the
   per-type names already declared in `shared-realtime` (`local_delivery_plan.updated`)?
9. **Does `order_plan_objective` remain editable on a planned order?** This decides whether
   the two gates (D5, D6) stay.
10. **Are store-pickup orders expected in the main order list?** This decides `orderHiddenQueryFilters`.
