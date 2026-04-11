# No-Zone Route Group Defaults

**Status:** Implemented  
**Date:** 2026-03-28  
**Scope:** `admin-app` plan creation and route-group edit-form preference persistence

## Summary

Plan creation now sends `plan_type_defaults.route_group_defaults.route_solution` so the backend can initialize the auto-created no-zone route group with frontend-managed defaults.

Those defaults are sourced from the existing team-scoped route-group edit-form localStorage preferences, but only when the user edits a **no-zone** route group. Zone-based route groups no longer overwrite those defaults.

## Implemented Flow

1. User edits a no-zone route group.
2. Route-group form setters persist route-solution preferences to localStorage.
3. User creates a plan.
4. Plan creation resolves `plan_type_defaults` from stored preferences plus runtime fallbacks.
5. `planApi.createPlan(...)` sends `plan_type_defaults`.
6. Backend creates the plan and its no-zone route group using those defaults.

## Implemented Changes

### 1. Plan defaults contract fixed

[`plan.ts`](/Users/davidloorenz/Desktop/Developer/BeyoApps_2025/NextMark-app/Front_end/admin-app/src/features/plan/types/plan.ts)

- `PlanTypeDefaults` now uses the correct nesting:
  - `route_group_defaults.route_solution`
- `RouteGroupDefaults.route_solution` now includes:
  - `vehicle_id`

### 2. Default constants updated

[`planTypeDefaults.constants.ts`](/Users/davidloorenz/Desktop/Developer/BeyoApps_2025/NextMark-app/Front_end/admin-app/src/features/plan/constants/planTypeDefaults.constants.ts)

- added `PLAN_DEFAULT_VEHICLE_ID_KEY`
- changed fallback end time from `17:00` to `23:59`

### 3. Geolocation fallback added

[`resolveUserCurrentLocation.ts`](/Users/davidloorenz/Desktop/Developer/BeyoApps_2025/NextMark-app/Front_end/admin-app/src/shared/utils/resolveUserCurrentLocation.ts)

- wraps browser geolocation
- returns an address-like object with:
  - `street_address: "Current Location"`
  - `coordinates`
- returns `null` on denial, timeout, or unavailability

### 4. Route-group defaults generator wired with fallbacks

[`routeGroupDefaults.generator.ts`](/Users/davidloorenz/Desktop/Developer/BeyoApps_2025/NextMark-app/Front_end/admin-app/src/features/plan/routeGroup/domain/planTypeDefaults/routeGroupDefaults.generator.ts)

Implemented fallback behavior:

- `set_start_time`
  - today: current team time + 5 minutes
  - otherwise: `09:00`
- `set_end_time`
  - stored value or `23:59`
- `start_location`
  - stored value, else browser geolocation, else `null`
- `route_end_strategy`
  - stored value or `round_trip`
  - forced to `round_trip` when no start location resolves
- `end_location`
  - stored value or mirrored start location for non-round-trip
  - `null` for round-trip
- `driver_id`
  - stored value, else current session user id
- `vehicle_id`
  - stored value, else `null`
- `eta_tolerance_seconds`
  - derived from stored minutes, else `0`
- `stops_service_time`
  - stored value mapped to seconds, else `null`

### 5. Plan creation now sends defaults

[`plan.controller.ts`](/Users/davidloorenz/Desktop/Developer/BeyoApps_2025/NextMark-app/Front_end/admin-app/src/features/plan/controllers/plan.controller.ts)

- `createPlan()` now calls `resolvePlanTypeDefaults(...)`
- injects `resolveUserCurrentLocation`
- adds `plan_type_defaults` to the create-plan payload when resolution succeeds
- geolocation/default-resolution failure does not block plan creation

### 6. Only no-zone route groups persist defaults

[`routeGroupEditForm.setters.ts`](/Users/davidloorenz/Desktop/Developer/BeyoApps_2025/NextMark-app/Front_end/admin-app/src/features/plan/routeGroup/forms/routeGroupEditForm/routeGroupEditForm.setters.ts)  
[`RouteGroupEditForm.provider.tsx`](/Users/davidloorenz/Desktop/Developer/BeyoApps_2025/NextMark-app/Front_end/admin-app/src/features/plan/routeGroup/forms/routeGroupEditForm/RouteGroupEditForm.provider.tsx)

- added `isNoZoneGroup`
- guarded all `save*Preference()` writes behind that flag
- non-zone route groups still edit normally, but no longer mutate the stored defaults

## Final Behavior

- no-zone route-group edits define the defaults for future plans
- zone-based route-group edits do not change those defaults
- new plans can bootstrap the auto-created no-zone group using:
  - stored values when present
  - runtime fallbacks when absent

## Verification

- `npm run build` in `admin-app` passed
