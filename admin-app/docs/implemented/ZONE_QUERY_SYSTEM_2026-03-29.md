# Zone Query System

Date: 2026-03-29
Source handoff: `docs/handoff_from_backend/QUERY_SYSTEM_HANDOFF.md`
Status: Implemented

## Implemented Scope

Zone querying now uses the backend-backed query contract on:

- `GET /api_v2/zones/{version_id}/zones`

Supported parameters in the frontend zone query layer:

- `q`
- `s`
- `zone_type`
- `is_active`
- `city_key`
- `limit`
- `cursor`

## Implemented Layers

### Domain

- `admin-app/src/features/zone/domain/zoneSearch.domain.ts`

Prepared here:
- searchable column allow-list
- query builder for `q` and `s`
- exact-filter query mapping
- local fallback filtering using the same query semantics

### Action

- `admin-app/src/features/zone/actions/searchZones.query.ts`

Prepared here:
- backend-backed zone query action
- version-scoped endpoint usage
- query parameter handoff from flow to API

### Flow

- `admin-app/src/features/zone/flows/useZoneSearch.flow.ts`

Prepared here:
- debounced zone search
- remote query execution when `versionId` is present
- local fallback when no version context is available or request fails

### Controller / UI

- `admin-app/src/features/zone/controllers/useZoneSelectorController.ts`
- `admin-app/src/features/zone/components/zone_selector/ZoneSelector.tsx`
- `admin-app/src/features/zone/components/zone_selector/ZoneSelector.types.ts`

Prepared here:
- explicit `versionId` boundary for remote querying
- optional query narrowing and exact filters
- existing selector UI kept intact

## Notes

- The current selector UI still only exposes text search by default.
- The query system is prepared for future filter UI without changing the API/action/flow contract.
- Vehicles and facilities remain pending in `docs/handoff_from_backend/QUERY_SYSTEM_HANDOFF.md`.

## Verification

- `npx eslint src/features/zone/**/*.ts src/features/zone/**/*.tsx`
- `npm run build`
