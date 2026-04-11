# Zone Template UI Wiring Preparation

Date: 2026-03-29
Status: Prepared for future UI wiring

## Purpose

This note records the structure already created for the zone-template backend alignment so future UI work can plug into the existing layers instead of rebuilding payload logic inside components.

## Prepared Layers

### Domain

File:
- `admin-app/src/features/zone/domain/zoneTemplateForm.domain.ts`

Already prepared here:
- backend-aligned template payload shape
- form-field parsing from string inputs
- route-end-strategy normalization
- capability allow-list validation
- operating-window validation
- preferred-vehicle parsing
- reusable initial-value mapping from template response to form state

This should remain the source of truth for:
- payload building
- validation rules
- string-to-domain parsing
- UI-independent normalization

### Types

File:
- `admin-app/src/features/zone/types/zone.ts`

Already prepared here:
- backend-aligned `ZoneTemplate`
- backend-aligned `ZoneTemplateConfig`
- expanded `ZoneVersion` response support

Future UI components should consume these types, not recreate local template contracts.

### API

File:
- `admin-app/src/features/zone/api/zone.api.ts`

Already prepared here:
- normalized zone-version responses
- backend-aligned template upsert payload
- support for version list filtering by `city_key`

Future UI work should call actions/controllers that depend on this API layer rather than building request bodies directly in components.

### Actions

Files:
- `admin-app/src/features/zone/actions/createZone.action.ts`
- `admin-app/src/features/zone/actions/updateZone.action.ts`

Already prepared here:
- create zone + optional template creation
- update zone + optional template update
- backend-aligned template payload submission

Future UI form changes should continue feeding these actions through controllers/popup flows.

### Form / Controller Boundary

Files:
- `admin-app/src/features/zone/forms/zoneForm/ZoneForm.layout.tsx`
- `admin-app/src/features/zone/forms/zoneForm/ZoneForm.popup.tsx`
- `admin-app/src/features/zone/components/ZoneTemplateForm.tsx`

Already prepared here:
- temporary raw inputs for all new backend template fields
- shared domain payload builder usage
- shared validation usage before submit

Important:
- the current inputs are placeholders
- field rendering can be replaced later without changing submission contracts
- richer selectors/pickers should only replace input UI, not domain parsing rules

## Safe Future UI Replacements

These current string inputs are safe to replace later with dedicated components:
- `default_facility_id`
  Replace with facility selector
- `preferred_vehicle_ids`
  Replace with vehicle multi-select
- `vehicle_capabilities_required`
  Replace with capability chips/toggles
- `default_route_end_strategy`
  Replace with select/dropdown
- `operating_window_start` / `operating_window_end`
  Replace with time picker components

## Re-entry Guidance

When resuming this work later:

1. Keep backend payload rules inside `zoneTemplateForm.domain.ts`
2. Replace only the input widgets in `ZoneForm.layout.tsx` and `ZoneTemplateForm.tsx`
3. Reuse `buildZoneTemplatePayload` and `validateZoneTemplatePayload`
4. Avoid putting parsing or validation into page/components
5. If new backend fields are added, extend `types` and `domain` first, then wire UI

## Related Files

- `admin-app/docs/implemented/ZONE_API_FRONTEND_GUIDE_2026-03-29.md`
- `admin-app/src/features/zone/components/ZoneDetailsPopover.tsx`
- `admin-app/src/features/zone/pages/ZoneManagement.page.tsx`
- `admin-app/src/features/zone/domain/tests/zoneTemplateForm.domain.test.ts`
