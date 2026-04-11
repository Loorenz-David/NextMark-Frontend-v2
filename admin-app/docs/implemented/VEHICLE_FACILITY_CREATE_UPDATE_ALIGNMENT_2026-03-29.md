# Vehicle + Facility Create/Update Alignment

Date: March 29, 2026  
Status: Implemented

## Scope Completed

- Renamed the frontend `warehouse` feature to `facility` across feature paths, popup keys, page keys, settings registries, and imports.
- Aligned facility API usage to `/api_v2/infrastructures/facilities/`.
- Aligned vehicle API usage to `/api_v2/infrastructures/vehicles/`.
- Switched create mutations to backend `fields` envelopes.
- Switched update mutations to backend `target` / `targets` envelopes.
- Updated create reconciliation to consume backend `client_id -> id` maps.
- Treated PATCH success as `{}` and updated local optimistic reconciliation accordingly.

## Facility Alignment

- Expanded facility types to include:
  - `facility_type`
  - `can_dispatch`
  - `can_receive_returns`
  - `operating_hours`
  - `default_loading_time_seconds`
  - `default_unloading_time_seconds`
  - `max_orders_per_day`
  - `external_refs`
  - `team_id`
- Added parsing and validation for:
  - canonical `facility_type`
  - operating-hours JSON rows
  - duplicate operating days
  - HH:MM validation
  - close-after-open validation
  - external refs JSON
- Prepared the form to accept richer UI widgets later without changing the submission contract.

## Vehicle Alignment

- Expanded vehicle types to include:
  - `home_facility_id`
  - `status`
  - `is_active`
  - `capabilities`
  - `loading_time_per_stop_seconds`
  - `unloading_time_per_stop_seconds`
  - `fixed_cost`
- Added canonical enum handling for:
  - `fuel_type`
  - `travel_mode`
  - `status`
  - `capabilities`
- Prepared the form to accept richer selectors later while keeping payload shaping in domain logic.

## Enum Source of Truth

The frontend now sources infrastructure enum values from:

- `docs/handoff_from_backend/infrastructure-enum-options.ts`

An app-facing adapter was added in:

- `src/features/infrastructure/domain/infrastructureEnums.ts`

## Notes

- `facility_type: "warehouse"` remains a valid backend enum value. Only the feature/module naming changed.
- Facility and vehicle forms currently use raw text/select inputs for the newly added fields. That is intentional preparation for later UI wiring work.
