# Zone + Route Group Architecture (Implemented)

Status: implemented and active in admin-app.
Implemented on: 2026-03-27 12:39:37 CET.
Last updated: 2026-03-27 14:16:00 CET (zone creation mode added).

## Purpose

This document is the current source of truth for how zone-aware route planning works in the frontend after the route operations migration, including the zone creation mode added in the second implementation phase.

## Purpose

This document is the current source of truth for how zone-aware route planning works in the frontend after the route operations migration.

## Scope

Applies to admin-app only.

Main feature areas:

- plan creation and plan lifecycle
- route group materialization per zone
- route group map overlays
- zone data module (versions, zones, templates)
- zone creation mode UI (drawing, form, CRUD operations)

## Current Architecture

Data flow:
packages -> app/services -> features/api -> features/actions -> features/flows -> features/controllers -> pages/components

Route planning shape:

- One plan can own zero or many route groups.
- Route groups are created explicitly by materialization, not implicitly during plan creation.

RouteGroup model includes zone snapshots:

- name
- zone_id
- zone_geometry_snapshot
- template_snapshot

## Implemented Frontend Contracts

Plan creation contract:

- Create plan returns delivery_plan only.
- Frontend does not require route_group in create response.

Route group materialization contract:

- Endpoint: POST /api_v2/route-plans/<plan_id>/route-groups/materialize
- Payload: { zone_ids: number[] }
- Response: RouteGroup[]

Zone contracts consumed by frontend:

- GET /api_v2/zones/
- PUT /api_v2/zones/
- PATCH /api_v2/zones/<version_id>/activate
- GET /api_v2/zones/<version_id>/zones
- PUT /api_v2/zones/<version_id>/zones
- GET /api_v2/zones/<version_id>/zones/<zone_id>/template
- PUT /api_v2/zones/<version_id>/zones/<zone_id>/template

## Key Files

Plan and route group:

- src/features/plan/controllers/plan.controller.ts
- src/features/plan/api/plan.api.ts
- src/features/plan/types/plan.ts
- src/features/plan/routeGroup/api/routeGroup.api.ts
- src/features/plan/routeGroup/types/routeGroup.ts
- src/features/plan/routeGroup/flows/routeGroupPageInitialization.flow.ts
- src/features/plan/routeGroup/controllers/useRouteGroupRail.controller.ts

Plan form zone step:

- src/features/plan/forms/planForm/components/ZoneSelectionStep.tsx
- src/features/plan/forms/planForm/planForm.actions.ts
- src/features/plan/forms/planForm/PlanForm.provider.tsx

Route group map overlays:

- src/features/plan/routeGroup/components/overlays/RouteGroupMapOverlay.tsx
- src/features/plan/routeGroup/components/overlays/ZonePolygonOverlay.tsx
- src/shared/map/domain/types.ts
- src/shared/map/domain/services/MapController.ts
- src/shared/map/infrastructure/GoogleMapAdapter.ts
- src/shared/map/hooks/useMap.ts

Zone feature module:

- src/features/zone/api/zone.api.ts
- src/features/zone/types/zone.ts
- src/features/zone/store/zone.store.ts
- src/features/zone/pages/ZoneManagement.page.tsx
- src/features/zone/index.ts

Zone creation mode components:

- src/features/zone/controllers/useZoneModeController.ts
- src/features/zone/components/ZoneMapOverlay.tsx
- src/features/zone/components/ZonePolygonLayer.tsx
- src/features/zone/components/ZoneHoverCard.tsx
- src/features/zone/forms/zoneForm/ZoneForm.tsx
- src/features/zone/forms/zoneForm/ZoneForm.popup.tsx
- src/features/zone/registry/zone.popups.registry.ts

Zone creation actions (CRUD with optimistic patterns):

- src/features/zone/actions/createZone.action.ts
- src/features/zone/actions/updateZone.action.ts
- src/features/zone/actions/deleteZone.action.ts

Map drawing and zone layer:

- src/shared/map/infrastructure/drawing/ZoneGeometryExtractor.ts (pure shape → GeoJSON converter)
- src/shared/map/infrastructure/drawing/DrawingManagerService.ts (zone capture mode)
- src/shared/map/infrastructure/GoogleMapAdapter.ts (zone polygon layer)
- src/shared/map/domain/services/MapController.ts (facade methods)

## Behavior Notes

- A plan with zero route groups is valid.
- Route group rail labels come from routeGroup.name.
- Zone polygon overlay is display-only (non-interactive) and rendered under route markers.
- Plan creation can proceed without selected zones; materialization can happen later.
- Zone creation mode is entered from the home map (top-right "Zones" button).
- Zones can be created, edited (name + template defaults), and deleted in zone mode.
- Only zones in inactive versions are editable or deletable (410 error if version is active).
- Zone creation and deletion use optimistic store updates; rollback on API failure.
- Zone polygon layer is zone-mode-exclusive; zones render as interactive polygon + label markers when in zone mode.
- Zone hover tooltip shows zone name and template defaults in a fixed-position card.
- Zone mode is mutually exclusive with order and route group selection modes (selection guard enforces this for UX clarity).

## Zone Creation Mode Workflows

### Create Zone

1. User clicks "Zones" button at home map top-right → zone mode activates.
2. User selects shape (polygon, rectangle, circle) and draws on the map.
3. Shape geometry is extracted and displayed; "Discard shape" / "Create Zone" buttons appear.
4. User clicks "Create Zone" → popup form opens.
5. User enters zone name and optional template defaults.
6. Form submits → zone is optimistically added to store and map layer.
7. Server creates zone; response includes server ID → optimistic ID is replaced.
8. Form popup closes.

### Edit Zone

1. User clicks existing zone polygon on map while in zone mode.
2. Form popup opens in edit mode with pre-filled name and template defaults.
3. User can change name and template defaults.
4. Form submits → server PATCH for name (if changed) and PUT for template (if changed).
5. Store updates with server response.
6. Form closes.

### Delete Zone

1. User opens edit form for a zone.
2. User clicks "Delete Zone" button (visible only in edit mode).
3. Zone is optimistically removed from store and map layer.
4. Server DELETE call executes.
5. On success, form closes.
6. On failure (e.g., 410 active version, or derived route groups exist), zone is restored and error message shown.

## API Contracts Used

Create zone:

- Endpoint: `PUT /api_v2/zones/<version_id>/zones`
- Payload: zone name, geometry, centroid, bounds
- Response: created zone with server ID

Update zone:

- Endpoint: `PATCH /api_v2/zones/<version_id>/zones/<zone_id>`
- Payload: name (optional), geometry (optional), centroid (optional), bounds (optional)
- Response: updated zone
- Error: 410 if version is active

Delete zone:

- Endpoint: `DELETE /api_v2/zones/<version_id>/zones/<zone_id>`
- Response: { deleted: boolean, zone_id: number }
- Error: 410 if version is active or derived route groups exist

Upsert template:

- Endpoint: `PUT /api_v2/zones/<version_id>/zones/<zone_id>/template`
- Payload: { name, config_json: ZoneTemplateConfig }
- Response: template object

Load zones for version:

- Endpoint: `GET /api_v2/zones/<version_id>/zones`
- Response: ZoneDefinition[]

Load versions:

- Endpoint: `GET /api_v2/zones/`
- Response: ZoneVersion[] (includes is_active flag per version)

## Operational Guidance

When extending this system:

- Keep plan creation and route-group materialization as separate operations.
- Keep DTO mapping boundaries clean before store writes.
- Keep map rendering side effects in map/overlay layers, not controllers.
- Add new zone workflows through features/zone public exports only.

## Historical Reference

The migration planning document is archived at:

- docs/archive/ZONES_FRONTEND_CONTEXT_AND_PLAN.md

The zone creation mode implementation plan is archived at:

- docs/archive/ZONE_CREATION_MODE_PLAN.md

The backend API handoff document is archived at:

- docs/archive/ZONES_ENDPOINT_HANDOFF_2026-03-27_13-07-56.md
