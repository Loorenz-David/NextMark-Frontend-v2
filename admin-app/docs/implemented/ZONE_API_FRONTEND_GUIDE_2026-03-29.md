# Zone API Frontend Alignment

Date: 2026-03-29
Source handoff: `docs/handoff_from_backend/ZONE_API_FRONTEND_GUIDE.md`
Status: Implemented

## What Was Aligned

- Zone version responses are normalized to frontend-friendly `version_number` while preserving backend `version`.
- Zone version creation now uses the backend-required `name` field.
- Zone template payloads now match backend fields directly instead of using the legacy nested `config_json` shape.
- Zone create/edit flows submit template payloads using:
  - `default_facility_id`
  - `max_orders_per_route`
  - `max_vehicles`
  - `operating_window_start`
  - `operating_window_end`
  - `eta_tolerance_seconds`
  - `vehicle_capabilities_required`
  - `preferred_vehicle_ids`
  - `default_route_end_strategy`
  - `meta`
- Template route-end strategy input accepts `last_stop` and normalizes it to `end_at_last_stop`.
- Zone details surfaces now read backend-aligned template fields directly.
- Zone version listing API now supports the documented optional `city_key` filter.

## Validation Added

- Template name required when a template payload is submitted.
- Template name max length of 255.
- `max_orders_per_route >= 1`
- `max_vehicles >= 1`
- `eta_tolerance_seconds` limited to `0..7200`
- `operating_window_end > operating_window_start`
- both window fields must be provided together
- capability validation against currently known values:
  - `cold_chain`
  - `fragile`
- preferred vehicle ids must be positive integers

These rules currently live in the zone domain layer so richer UI inputs can be wired later without changing the core submission logic.

## Main Files Updated

- `admin-app/src/features/zone/types/zone.ts`
- `admin-app/src/features/zone/api/zone.api.ts`
- `admin-app/src/features/zone/domain/zoneTemplateForm.domain.ts`
- `admin-app/src/features/zone/forms/zoneForm/ZoneForm.layout.tsx`
- `admin-app/src/features/zone/forms/zoneForm/ZoneForm.popup.tsx`
- `admin-app/src/features/zone/components/ZoneTemplateForm.tsx`
- `admin-app/src/features/zone/components/ZoneDetailsPopover.tsx`
- `admin-app/src/features/zone/actions/createZone.action.ts`
- `admin-app/src/features/zone/actions/updateZone.action.ts`
- `admin-app/src/features/zone/pages/ZoneManagement.page.tsx`

## Follow-Up UI Work

- Replace raw numeric/text inputs with dedicated facility, vehicle, capabilities, and route-strategy components.
- Add field-level validation rendering instead of first-error message handling.
- Wire backend-provided capability options once that endpoint or enum source is available.
- Add richer version filtering UI if zone version filtering by `city_key` is surfaced to users.

## Verification

- `npx eslint src/features/zone/**/*.ts src/features/zone/**/*.tsx`
- `npm run build`
