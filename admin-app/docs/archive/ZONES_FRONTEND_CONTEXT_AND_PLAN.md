> Archived on 2026-03-27 12:39:37 CET.
> Replaced by: `admin-app/docs/implemented/ZONE_ROUTEGROUP_ARCHITECTURE.md`.

# ZONES — Frontend Context, Current System & What It Becomes

> This document is written for Copilot (worker) in the admin-app.
> Read this before touching any plan, routeGroup, or zone-related file.
> It explains the system as it exists today and exactly how it changes after the Zone + RouteGroup backend migration (Phase 1) completes.
>
> Backend reference: `Back_end/docs/under_development/ZONES_CURRENT_STATE_AND_VISION.md`
> Implementation phases: `Back_end/docs/under_development/ZONES_IMPLEMENTATION_PHASES.md`

---

## PART 1 — HOW THE SYSTEM WORKS TODAY

Understanding this is essential. You are not starting from a blank slate.

### 1.1 The Plan–RouteGroup–RouteSolution chain

The current data model is a strict 1:1:N chain:

```
RoutePlan (1)
  └── RouteGroup (1)  ← exactly one per plan, always
        └── RouteSolution (N)  ← multiple versions, one is selected
              └── RouteSolutionStop (N)
```

**Key implication:** A plan and its single route group are created together in a single API call. The frontend expects this. There is no separate "add route group" step today.

---

### 1.2 Plan creation flow (today)

File: `features/plan/controllers/plan.controller.ts`

When `createPlan` is called:

1. An optimistic `DeliveryPlan` and `RouteGroup` are inserted into local stores immediately
2. A single POST to `/route_plans/` is fired with `{ label, start_date, plan_type_defaults: { route_solution: { ... } } }`
3. The API responds with `{ created: [{ delivery_plan, route_group, route_solution? }] }`
4. The controller reads `created[0].delivery_plan` and `created[0].route_group` and syncs them to store

The `plan_type_defaults` payload carries the initial route solution config (start location, driver, service times, etc.) that the backend uses to seed the first RouteSolution inside the RouteGroup.

There is **no zone selection** in this flow. Plans have no concept of zones today.

---

### 1.3 Plan form (today)

File: `features/plan/forms/planForm/planFormBootstrap.flow.ts`

The plan creation form collects:

- `label` (auto-generated as "Plan for {date}")
- `start_date`
- `end_date` (optional)

That is all. No zone step, no group configuration beyond what lives in `plan_type_defaults`.

---

### 1.4 RouteGroup data model (today)

File: `features/plan/routeGroup/types/routeGroup.ts`

```ts
export type RouteGroup = {
  id?: number;
  client_id: string;
  actual_start_time?: string | null;
  actual_end_time?: string | null;
  is_optimized?: boolean;
  driver_id?: number | null;
  route_plan_id?: number | null;
  updated_at?: string | null;
  route_solutions_ids?: number[];
  is_loading?: LoadingScenarios;
  optimization_started_at?: number | null;
};
```

No zone fields. No name. No geometry. No template snapshot.

---

### 1.5 RouteGroups page (today)

File: `features/plan/routeGroup/pages/RouteGroups.page.tsx`

The page renders a `RouteGroupRail` — a sidebar that lists route groups for the current plan. Because today a plan always has exactly one route group, this rail shows a single item in practice.

**Note:** The rail component already supports multiple items. The `MOCK_ROUTE_GROUPS` array on line 17 shows 4 items for development purposes. The structure for multi-group display already exists — it just has no real data to fill it with yet.

The page initialization flow (`routeGroupPageInitialization.flow.ts`) considers the workspace "hydrated" when:

- `routeGroups.length > 0`
- A selected route group exists
- Route solutions exist for that group
- A selected route solution exists

This means a plan with zero route groups is currently treated as "needs refresh" and will keep fetching. This behavior needs to change.

---

### 1.6 RouteGroup store (today)

File: `features/plan/routeGroup/store/routeGroup.slice.ts`

The store uses `selectRouteGroupsByPlanId(planId)` to find all route groups for a plan. This selector is already written to return an **array** — it does not assume one group per plan. The store is architecturally ready for multiple groups.

---

### 1.7 What does NOT exist today

- No `features/zone/` module — there is no zone feature folder at all
- No zone API calls anywhere in the frontend
- No zone types
- No zone map layer
- No zone selection UI
- No "materialize route groups" flow
- Plans are created with an implicit, auto-created route group. There is no user step to define zone partitions.

---

## PART 2 — WHAT CHANGES AFTER PHASE 1 BACKEND

Phase 1 of the backend migration makes these structural changes:

1. **`route_plan_id` unique constraint is removed** — a plan can now have multiple route groups
2. **`RouteGroup` gets new fields**: `zone_id`, `name`, `zone_geometry_snapshot`, `template_snapshot`
3. **`zone_template` table is created** — operational defaults per zone
4. **Zone management API is stabilized** — CRUD for versions, zones, and templates
5. **A materialize endpoint is added**: `POST /api_v2/route-plans/<plan_id>/route-groups/materialize`

This changes the plan creation contract and the shape of the `RouteGroup` type. The frontend must be updated to match.

---

## PART 3 — WHAT THE SYSTEM BECOMES

### 3.1 New data model

```
RoutePlan (1)
  └── RouteGroup (N)  ← one per selected zone, materialized explicitly
        └── RouteSolution (N)  ← unchanged
              └── RouteSolutionStop (N)  ← unchanged

ZoneDefinition (team-scoped, long-lived)
  └── ZoneTemplate (optional operational defaults)

ZoneVersion (groups zone definitions for a city at a point in time)

OrderZoneAssignment (auto-assigned when order is created)
```

A Route Plan no longer owns a route group implicitly. Route Groups are created explicitly by calling the materialize endpoint after selecting zones.

---

### 3.2 Updated `RouteGroup` type

The `RouteGroup` type must be extended with zone fields. The existing fields remain unchanged.

```ts
export type RouteGroup = {
  id?: number;
  client_id: string;
  name?: string | null; // NEW — zone-derived label, e.g. "Stockholm North"
  zone_id?: number | null; // NEW — reference to the originating Zone Definition
  zone_geometry_snapshot?: GeoJSONPolygon | null; // NEW — snapshotted at materialization
  template_snapshot?: ZoneTemplateConfig | null; // NEW — snapshotted at materialization
  actual_start_time?: string | null;
  actual_end_time?: string | null;
  is_optimized?: boolean;
  driver_id?: number | null;
  route_plan_id?: number | null;
  updated_at?: string | null;
  route_solutions_ids?: number[];
  is_loading?: LoadingScenarios;
  optimization_started_at?: number | null;
};
```

New supporting types to add in `features/plan/routeGroup/types/routeGroup.ts` or a shared zone types file:

```ts
export type GeoJSONPolygon = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][];
};

export type ZoneTemplateConfig = {
  vehicle_type_id?: number | null;
  default_service_time_seconds?: number | null;
  depot_id?: number | null;
  max_stops?: number | null;
  constraints?: Record<string, unknown> | null;
};
```

---

### 3.3 Plan creation flow changes

**Today:** `createPlan` → single API call → plan + route group created together.

**After Phase 1:** Plan creation and route group materialization are **two separate steps**.

Step 1 — Create the plan (label, dates):

- API call: `POST /route_plans/` with `{ label, start_date, end_date }`
- Response: `{ delivery_plan }` only — **no route_group in the response anymore**
- The controller must not expect or handle `created.route_group` from this call

Step 2 — Materialize route groups (zone selection):

- User selects which zones to include in this plan
- API call: `POST /api_v2/route-plans/<plan_id>/route-groups/materialize` with `{ zone_ids: number[] }`
- Response: `[RouteGroup, ...]` — one entry per selected zone
- These route groups are inserted into the route group store

**What this means for `plan.controller.ts`:**

- Remove the optimistic `insertRouteGroup` call from `createPlan`
- Remove the `routeGroupClientId` logic from `createPlan`
- Remove reading `created.route_group` from the response
- Add a new `materializeRouteGroups(planId, zoneIds)` function

---

### 3.4 Plan form changes

The plan creation form needs a new zone selection step between "set dates" and "confirm".

**New flow:**

1. User fills in label and dates (existing step — unchanged)
2. User selects zones from a list/map (new step — zone selection)
3. System creates the plan, then calls materialize with selected zone_ids

The zone selection step renders the available zones for the team (fetched from `/api_v2/zones/<active_version_id>/zones`). The user checks which zones to include. At minimum, one zone must be selected.

If the team has no zones configured yet, the step shows an empty state with a link to the zone management page.

---

### 3.5 RouteGroups page changes

The rail already supports multiple items. The following behavioral changes are needed:

**Initialization flow (`routeGroupPageInitialization.flow.ts`):**

- A plan with `routeGroups.length === 0` is now a **valid state** — it means zones have not been materialized yet
- Do not treat zero route groups as "needs refresh" indefinitely — instead, show a "no zones selected" empty state and prompt the user to select zones

**Rail items:**

- Each `RouteGroupRailItem` label should use `routeGroup.name` (the zone name snapshotted at materialization)
- The rail currently uses a hardcoded `label` field — this should map from `routeGroup.name`

**Zone polygon overlay (new):**

- When a route group is selected and it has `zone_geometry_snapshot`, the map should render the zone polygon as a background layer underneath the order markers
- This is display-only — not interactive at this stage

---

### 3.6 New feature module: `features/zone/`

This module is entirely new. It does not exist today. It is responsible for zone management (creating versions, drawing polygons, attaching templates) — independent of the plan feature.

The full folder structure and task list for this module is defined in:
`Back_end/docs/under_development/ZONES_IMPLEMENTATION_PHASES.md` → Section `2-FE`

Short summary of what goes here:

```
features/zone/
  api/
    zone.api.ts           → fetchZoneVersions, createZoneVersion, activateZoneVersion,
                            fetchZonesForVersion, createZone, fetchZoneTemplate, upsertZoneTemplate
  types/
    zone.ts               → ZoneVersion, ZoneDefinition, ZoneTemplate, GeoJSONPolygon
  store/
    zone.store.ts         → activeVersion, zones[], selectedZoneId
  components/
    ZoneMapLayer.tsx      → renders GeoJSON polygons on the map (display + draw modes)
    ZoneTemplateForm.tsx  → form for editing zone operational defaults
  pages/
    ZoneManagement.page.tsx  → version list, zone list, activate, create
```

---

## PART 4 — FILE CHANGE MAP

This table tells you exactly which files change, which are new, and which stay the same.

### Files that CHANGE

| File                                                                   | What changes                                                                                                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `features/plan/routeGroup/types/routeGroup.ts`                         | Add `name`, `zone_id`, `zone_geometry_snapshot`, `template_snapshot` fields                                                          |
| `features/plan/types/plan.ts`                                          | Remove `RouteGroup` from `PlanCreateResultBundle` — plan creation no longer returns a route group                                    |
| `features/plan/controllers/plan.controller.ts`                         | Remove optimistic route group insert from `createPlan`; remove `created.route_group` handling; add `materializeRouteGroups` function |
| `features/plan/api/plan.api.ts`                                        | Update `PlanCreateResponse` type to no longer include `route_group`; add `materializeRouteGroups` API call                           |
| `features/plan/forms/planForm/planFormBootstrap.flow.ts`               | Add zone selection step to the form flow                                                                                             |
| `features/plan/routeGroup/flows/routeGroupPageInitialization.flow.ts`  | Treat `routeGroups.length === 0` as valid state, not "needs refresh"                                                                 |
| `features/plan/routeGroup/components/routeGroupRail/types.ts`          | Update `RouteGroupRailItem` label to come from `routeGroup.name`                                                                     |
| `features/plan/routeGroup/controllers/useRouteGroupRail.controller.ts` | Map `routeGroup.name` to rail item label                                                                                             |

### Files that are NEW

| File                                                                  | Purpose                                            |
| --------------------------------------------------------------------- | -------------------------------------------------- |
| `features/zone/` (entire module)                                      | Zone management — versions, polygons, templates    |
| `features/plan/routeGroup/components/overlays/ZonePolygonOverlay.tsx` | Renders `zone_geometry_snapshot` on the map        |
| `features/plan/forms/planForm/components/ZoneSelectionStep.tsx`       | Zone picker in plan creation form                  |
| `features/plan/routeGroup/api/routeGroup.api.ts` (or extend existing) | `materializeRouteGroups(planId, zoneIds)` API call |

### Files that STAY THE SAME

| File                                                                   | Why unchanged                                                |
| ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| `features/plan/routeGroup/store/routeGroup.slice.ts`                   | Already supports multiple groups per plan via array selector |
| `features/plan/routeGroup/store/routeSolution.store.ts`                | Unchanged — solutions remain per group                       |
| `features/plan/routeGroup/forms/routeGroupEditForm/`                   | Edit form for route group settings — unchanged               |
| `features/plan/routeGroup/controllers/routeOptimization.controller.ts` | Optimization flow unchanged                                  |
| `features/plan/routeGroup/components/overlays/RouteGroupStatsOverlay/` | Stats overlay unchanged                                      |
| `features/plan/routeGroup/pages/RouteGroupsPageContent.page.tsx`       | Content area unchanged                                       |
| All route solution and stop files                                      | Unchanged                                                    |

---

## PART 5 — NEW API CONTRACTS TO CONSUME

These are the endpoints that will exist after Phase 1 backend completes. Do not call them before they are confirmed stable.

### Zone endpoints (existing — verify shape)

```
GET /api_v2/zones/
Response: [{ id, team_id, city_key, version_number, is_active, created_at }]

PUT /api_v2/zones/
Body: { city_key: string }
Response: { id, team_id, city_key, version_number, is_active, created_at }

PATCH /api_v2/zones/<version_id>/activate
Response: { id, ..., is_active: true }

GET /api_v2/zones/<version_id>/zones
Response: [{ id, name, zone_type, centroid_lat, centroid_lng, geometry, is_active, template: { ... } | null }]

PUT /api_v2/zones/<version_id>/zones
Body: { name, zone_type, geometry, centroid_lat, centroid_lng, min_lat, max_lat, min_lng, max_lng }
Response: { id, name, zone_type, centroid_lat, centroid_lng, geometry, ... }
```

### Zone template endpoints (new)

```
GET /api_v2/zones/<version_id>/zones/<zone_id>/template
Response: { id, zone_id, name, config_json, version, is_active } | null

PUT /api_v2/zones/<version_id>/zones/<zone_id>/template
Body: { name, config_json: { vehicle_type_id?, default_service_time_seconds?, depot_id?, max_stops?, constraints? } }
Response: { id, zone_id, name, config_json, version, is_active }
```

### Route Group endpoints (new)

```
GET /api_v2/route-plans/<plan_id>/route-groups
Response: [{
  id, client_id, name, zone_id, zone_geometry_snapshot, template_snapshot,
  driver_id, state, total_orders, route_solutions_ids
}]

POST /api_v2/route-plans/<plan_id>/route-groups/materialize
Body: { zone_ids: number[] }
Response: [{ id, client_id, name, zone_id, zone_geometry_snapshot, template_snapshot, ... }]
```

### Plan creation endpoint (shape change)

```
POST /route_plans/
Body: { client_id, label, start_date, end_date?, order_ids? }
Response: {
  created: [{
    delivery_plan: { id, client_id, label, start_date, end_date, ... }
    // route_group is NO LONGER in this response
  }]
}
```

---

## PART 6 — DO NOT BUILD YET

The following are defined in the backend phases doc but are **not part of this phase**. Do not implement them until the plan and the backend phase are confirmed ready:

- Zone polygon drawing / editing (Phase 2-FE)
- Zone template form (Phase 2-FE)
- Zone management page (Phase 2-FE)
- Zone polygon overlay on the route group map (Phase 4-FE)
- AI zone reasoning tools (explicitly deferred — build manual system first)
- Auto-zone generation UI (V2 feature)

What IS in scope now (Phase 1 completion tasks):

- Update `RouteGroup` type with zone fields
- Update plan creation controller to not expect a route group back
- Scaffold the `features/zone/` folder structure and type definitions (types only, no API calls yet — wait for backend confirmation)
- Update `PlanCreateResponse` type
