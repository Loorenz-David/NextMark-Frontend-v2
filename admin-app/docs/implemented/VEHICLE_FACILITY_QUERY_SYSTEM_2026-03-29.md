# Vehicle + Facility Query System

Date: March 29, 2026  
Status: Implemented

## Scope Completed

- Added backend-first list/search query support for vehicles and facilities.
- Added per-feature query-domain helpers for `q`, `s`, exact filters, `limit`, and `cursor`.
- Updated feature flows/controllers to issue debounced backend searches.
- Kept the existing settings UI simple while preparing the controller contracts for richer exact-filter controls later.

## Facility Query Support

Supported query params:

- `q`
- `s`
- `client_id`
- `facility_type`
- `can_dispatch`
- `can_receive_returns`
- `sort`
- `limit`
- `cursor`

Implemented in:

- `src/features/infrastructure/facility/domain/facilityQuery.domain.ts`
- `src/features/infrastructure/facility/api/facilityApi.ts`
- `src/features/infrastructure/facility/hooks/useFacilityFlow.ts`
- `src/features/infrastructure/facility/hooks/useFacilityController.ts`

## Vehicle Query Support

Supported query params:

- `q`
- `s`
- `client_id`
- `travel_mode`
- `fuel_type`
- `status`
- `is_active`
- `home_facility_id`
- `sort`
- `limit`
- `cursor`

Implemented in:

- `src/features/infrastructure/vehicle/domain/vehicleQuery.domain.ts`
- `src/features/infrastructure/vehicle/api/vehicleApi.ts`
- `src/features/infrastructure/vehicle/hooks/useVehicleFlow.ts`
- `src/features/infrastructure/vehicle/hooks/useVehicleController.ts`

## Notes

- The current UI primarily exposes text search.
- Exact-filter UI wiring can be added later without changing backend-facing query contracts.
