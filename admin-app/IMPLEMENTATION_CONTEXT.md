# Implementation Context Snapshot (Frontend)

## Date
- 2026-03-04

## Purpose
This file captures the current frontend implementation context (OrderForm + Costumer + Delivery Windows) so we can pause/refactor and return without losing architecture/behavior decisions.

## High-Level Scope Implemented
1. OrderForm SRP refactor (providers/flows/context decomposition and compatibility path).
2. Costumer create/edit form feature + popup structure aligned to order-form architecture.
3. Embedded CostumerForm inside OrderForm customer panel with expanded desktop layout flow.
4. Costumer selection stability fixes (create vs edit safeguards, lookup dedupe/debounce, prompt flow).
5. Costumer operating-hours editor + payload shaping (create/edit semantics).
6. Delivery windows form-side integration workstream (state/payload conventions and `FULL_RANGE` calendar intent).

## OrderForm Refactor Context
1. OrderForm internals were reorganized by SRP boundaries (`context/`, `providers/`, `flows/`, `controllers/`, `state/`, `components/`).
2. Composition-oriented provider model is used (`OrderFormContextComposer` naming).
3. Slice-based hooks were introduced to reduce broad rerenders and leakage from monolithic context access.
4. `useOrderForm()` compatibility behavior is preserved during migration.

## Customer Panel + Embedded CostumerForm
1. `OrderFormCustomerPanel` behaves as a small state machine:
   - `search`
   - `details`
   - `form-create`
   - `form-edit`
2. Expanded layout mode (`customer-expanded`) is triggered only from explicit actions (`Create`/`Edit`) and collapses back to `default` on close/save.
3. Search bar is shown in `search` state and hidden in `details`/form states.
4. `details` state actions are rendered from `ThreeDotMenu` action list.
5. Embedded form supports custom header/back-close behavior and unsaved close confirmation.
6. Embedded save path returns selected/saved costumer back into order flow and collapses panel layout.

## Costumer Selection Safeguards (OrderForm)
1. Auto-lookup by email is create-mode only.
2. Lookup uses debounce + dedupe + exact normalized email matching before resolve.
3. Manual selection from panel/embedded form is guarded to avoid extra lookup calls.
4. Edit mode does not auto-overwrite order snapshot from email lookup.
5. Edit-mode customer change is prompt-driven:
   - Replace snapshot fields with new costumer data
   - Keep existing snapshot fields but change association
   - Cancel selection change
6. Back navigation from customer search to details is supported when a costumer is already selected.

## Costumer Form Feature (Create/Edit)
1. Feature and popup structure follow order-style architecture (`forms/costumerForm` + `popups/CostumerForm` + registry wiring).
2. Editable fields include:
   - `first_name`
   - `last_name`
   - `email`
   - address (default row)
   - primary phone
   - secondary phone
   - operating hours
3. Form uses existing shared input pieces (`PhoneField`, `AddressAutocomplete`, `SplitRow`, `Cell`).
4. Create/edit submission routes through `useCostumerController`.
5. Embedded and popup modes share logic with host-specific close behavior options (`closeOnSuccess`, `onSavedCostumer`, etc.).

## Operating Hours Frontend Context
1. Operating-hours editor supports Monday..Sunday selection, unselection, and closed-day mode.
2. Weekday mapping follows Monday-first (`Mon=0 ... Sun=6`).
3. Default for newly selected day: `09:00-17:00`.
4. Validation rules include:
   - unique weekday
   - open days require valid times
   - `open_time < close_time`
5. Row-based list layout replaced the previous day-detail-card pattern.
6. Interaction bug fixes were applied around row/checkbox click behavior to avoid unintended day toggles.

## Costumer Submit Payload Behavior
1. Create payload sends meaningful rows and includes `operating_hours` list.
2. Edit payload is backend-aligned and supports:
   - `delete_phone_ids`
   - `delete_address_ids`
   - `operating_hours`
   - `replace_operating_hours: true` when hours changed
3. Clearing persisted address/phone in edit mode maps to delete-id semantics.

## Unsaved-Changes / Form-Open Stability Notes
1. Initial create-open false positives were addressed in form dirty/snapshot behavior.
2. Prefix memorization behavior is preserved intentionally (stored prefix is reused for user convenience).

## Delivery Windows Frontend Context (Current Direction)
1. Delivery windows are treated as authoritative scheduling constraints for orders.
2. UI/state direction supports multiple windows per day (non-overlap enforced).
3. Calendar-built windows from current date+time flow should emit `window_type: "FULL_RANGE"`.
4. Edit hydration direction is UTC API -> local display model; submit direction is local -> UTC.
5. Delivery windows must be part of unsaved-change snapshot logic.

## Important Working Note
1. `src/features/order/forms/orderForm/flows/orderFormCostumerLoad.flow.ts` is in-progress user work and must not be removed during refactors.

## Suggested Resume Checklist
1. Run frontend build/tests after major component refactor moves.
2. Keep panel-state transitions and lookup safeguards covered by tests.
3. Preserve embedded form contract (`onSavedCostumer`) while simplifying layout code.
