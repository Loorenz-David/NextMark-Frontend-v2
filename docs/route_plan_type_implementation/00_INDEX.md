# Route Plan Type Implementation — Baseline Documentation

**Purpose.** This folder is the grounding document set for adding non-route plan types
(store pickup, international shipping) to the admin app. It describes the codebase **as it
is today**, before any backend or frontend change for simple container plans.

It exists so that when a change is proposed we can answer, without re-reading the code:

- What does this file do?
- Who calls it, and what does it call?
- If plan type becomes a variable here, what else has to change?

**These documents describe the current state. They are not a plan.** The plan will be built
on top of them once the backend changes are known.

---

## Document map

| Doc | Covers | Depth |
|---|---|---|
| [01_plan_core.md](01_plan_core.md) | `admin-app/src/features/plan/**` excluding `routeGroup/` — types, stores, api, flows, controllers, form, calendar, DnD, cards | Function level |
| [02_route_group.md](02_route_group.md) | `admin-app/src/features/plan/routeGroup/**` — the local_delivery workspace | File level (responsibility + exports); function level on the ~20 plan-type seam files |
| [03_order_coupling.md](03_order_coupling.md) | `admin-app/src/features/order/**` where it touches plans or `order_plan_objective` | Function level |
| [04_registries_and_shell.md](04_registries_and_shell.md) | `home-route-operations/**`, resource-manager base/section/popup wiring, realtime, notification targets, the two empty scaffold features | Function level |
| [05_plan_type_coupling_matrix.md](05_plan_type_coupling_matrix.md) | Every place plan type is decided, assumed, or hardcoded — plus a change-impact matrix | Cross-cutting |

Read 05 first if you want the short version. Read 01–04 when you need to know what a
specific file actually does.

---

## Vocabulary (used consistently across these docs)

| Term | Meaning in code | Notes |
|---|---|---|
| **Plan** / **Route Plan** / **Delivery Plan** | `DeliveryPlan` type, `useRoutePlanStore`, API `/route_plans/` | Three names, one entity. The backend calls it `RoutePlan`; the frontend type is `DeliveryPlan`; the store is `routePlan`. |
| **Plan type** / **plan objective** | The string `local_delivery` \| `store_pickup` \| `international_shipping` | On the **order** it is `order_plan_objective`. The **plan** itself currently carries no type field at all. |
| **Route Group** | `RouteGroup` — a zone-scoped bucket inside a plan | local_delivery only. Holds route solutions. |
| **Route Solution** | An optimized ordering of stops for one route group | local_delivery only. |
| **Route Solution Stop** | One order's position in a route solution | local_delivery only. |
| **Base** | The `baseControlls` slot in the route-operations shell — the workspace panel opened by clicking a plan | Currently always renders `RouteGroupsPage`. |
| **Section** | A stacked panel (order detail, customer, etc.) managed by `sectionManager` | Registered in `homeSectionRegistry`. |
| **Workspace** | Informal: base + map overlay + runtime hooks for one plan | Today there is exactly one workspace implementation. |

---

## The one-paragraph summary of the current state

A plan is a **typeless** container: `DeliveryPlan` has a label, dates, a state, and rollup
totals — no objective field. Type is expressed indirectly, in two places: (1) on each order
as `order_plan_objective`, which every plan-assignment path forcibly sets to
`local_delivery`; and (2) implicitly, by the fact that the only workspace the shell can
render for a plan is `RouteGroupsPage`. Everything downstream — route groups, solutions,
stops, optimization, the map overlay, the driver hand-off — hangs off that single
assumption. Adding a plan type means introducing a discriminator on the plan, then making
roughly a dozen currently-constant decision points read it.
