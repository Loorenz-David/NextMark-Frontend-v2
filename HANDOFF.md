# Frontend Recovery Handoff — NextMark

**Context:** Commit `93964aa "finish app for deploying in ec2"` from the monorepo root mixed uncommitted work across multiple in-progress features. It wiped several files to empty blobs and introduced type mismatches. A multi-session recovery effort has fixed most issues. This document captures exactly what was fixed, what remains, and the precise steps to finish.

---

## Recovery Status: What Has Been Fixed

The following files were repaired across two build passes. All changes are committed to the working tree (not yet staged/committed to git).

### shared-domain (`packages/shared-domain/orders/order.ts`)
- Restored `route_group_id?: number | null` on `Order`
- Restored `item_type_counts?: Record<string, number> | null` on `Order`
- Added `item_type_counts?: Record<string, number> | null` to `PlanTotalsEntry`
- Added `plan_totals?: PlanTotalsEntry[]` to `OrderPlanUpdateBundle`
- Added `state_changes` (route_groups + route_plans arrays) to `OrderPlanUpdateBundle`
- **Note:** `order_notes` is `string[] | null` — the old structured `OrderNote` type `{ type, content }` is gone

### shared-api (`packages/shared-api/orders/createOrdersApi.ts`)
- Removed `OrderNote` import (type no longer exists)
- `OrderNoteMutationPayload.order_notes` → `string | string[]`
- `OrderNoteMutationResponse.order_notes` → `string[] | null`

### shared-realtime
- `packages/shared-realtime/src/channels/clientForm.ts` — restored full `createClientFormChannel` implementation (was wiped to 0 bytes)
- `packages/shared-realtime/src/channels/index.ts` — added `export * from './clientForm'`

### admin-app
- `features/order/types/order.ts` — removed `OrderNote` from re-export list
- `features/order/domain/orderReactiveVisibility.ts` — `resolveOrderPlanId` uses `delivery_plan_id` only
- `features/order/store/order.store.ts` — `selectOrdersByPlanId` and `setOrderPlanId` use `delivery_plan_id`
- `features/order/flows/orderMapData.flow.ts` — `order.route_plan_id` → `order.delivery_plan_id`
- `features/order/flows/orderMapMarkers.flow.ts` — same
- `features/order/forms/orderForm/state/OrderForm.types.ts` — added `route_group_id` to `OrderFormState`, `routeGroupId` to `OrderFormPayload`
- `features/order/forms/orderForm/flows/orderFormBootstrap.flow.ts` — restored `payloadRouteGroupId` param + `orderUpdatedAt` / `orderItemsUpdatedAt` / `orderClientFormSubmittedAt` in reinit key params
- `features/order/popups/FailureNote/FailureNotePopup.tsx` — failure note is now a `string`, wrapped in `[failureNote]` array
- `features/order/controllers/orderState.controller.ts` — replaced `appendFailureOrderNote` with `appendOrderNotes` that works on `string[]`
- `features/order/controllers/order.controller.ts` — simplified `normalizeOrderNotesForOptimistic` to handle `string[]`
- `features/order/controllers/orderPlanPatch.controller.ts` — all `route_plan_id` → `delivery_plan_id` (type + usages)
- `features/order/controllers/orderMutations.controller.ts` — `order.route_plan_id` → `order.delivery_plan_id`
- `features/order/domain/orderNotes.ts` — removed `OrderNote` import; `toMutableOrderNotes` returns `string[]`; `toOrderNotePayload` returns `string`; `replaceOrderNoteAtIndex` and `removeOrderNoteAtIndex` updated to work with `string[]`
- `features/order/controllers/orderNotes.controller.ts` — `optimisticNote` is now a plain `string` (was spread of `OrderNote` object + `creation_date`)
- `features/order/components/clientFormLink/clientFormLink.api.ts` — restored from git (was wiped; recovered from commit `23ac47b`)
- `realtime/clientForm/clientForm.realtime.ts` — restored full subscribe/unsubscribe module (was wiped)
- `realtime/business/AdminBusinessRealtimeProvider.tsx` — `payload?.delivery_plan` → `payload?.route_plan`, cast to `DeliveryPlan`
- `realtime/client.ts` — `onAuthError` wrapped with `void` to satisfy `() => void | Promise<void>` signature
- `realtime/notifications/AdminNotificationClickBridge.tsx` — destructured narrow-typed fields to satisfy `setPendingAdminNotificationWorkspacePayload` call
- `realtime/notifications/playAdminNotificationChime.ts` — cast `context.state as string` to avoid TS no-overlap error

### driver-app
- `features/routes/orders/api/orders.dto.ts` — removed `OrderNote` import, `order_notes: string[] | null`
- `features/routes/orders/domain/orders.types.ts` — same
- `app/services/realtime.ts` — `onAuthError` fix (same as admin-app)
- `features/route-execution/domain/stopDetailDisplay.types.ts` — added `orderScalarLabel: string | null` to `StopDetailHeaderDisplay`
- `features/route-execution/domain/mapActiveRoutesToAssignedRouteViewModel.ts` — removed `local_delivery_plan_id` (never on `RouteSolution`), added `route_group_id`
- `features/routes/flows/hydrateDriverRouteById.flow.ts` — added `route_solution_id` and `route_group_id` to `toRouteSummary`

### client-form-app
- All config files restored from git commit `23ac47b`: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `postcss.config.js`
- Still needs `npm install` before building

---

## Remaining Issues (Codex pick up here)

### 1. `ClientFormLinkModal.tsx` — FILE IS EMPTY (CRITICAL)

**File:** `admin-app/src/features/order/components/clientFormLink/ClientFormLinkModal.tsx`

**Problem:** The file is 0 bytes. It needs to be restored from git.

**Fix:** Run this command and write the output to the file:
```bash
cd /path/to/repo && git cat-file -p 23ac47b:"Front_end/admin-app/src/features/order/components/clientFormLink/ClientFormLinkModal.tsx"
```

The modal accepts these props and renders a copy-URL dialog with a two-step regenerate confirmation:
```ts
type Props = {
  formUrl: string
  expiresAt: string
  onClose: () => void
  onRegenerate: () => void
  isRegenerating?: boolean
}
```

---

### 2. `ClientFormLinkButton.tsx` — Props mismatch with callsite

**File:** `admin-app/src/features/order/components/clientFormLink/ClientFormLinkButton.tsx`

**Problem:** `OrderDetailTracking.tsx` (line 159–165) passes 4 props that `ClientFormLinkButton` does not accept:

```tsx
<ClientFormLinkButton
  orderId={order.id}
  clientId={order.client_id}          // ← not in Props type
  hasGeneratedLink={Boolean(order.client_form_token_hash)}  // ← not in Props type
  initialEmail={order.client_email ?? null}                 // ← not in Props type
  initialPhone={order.client_primary_phone ?? null}         // ← not in Props type
/>
```

**Context:** These were added to `OrderDetailTracking.tsx` in commit `93964aa` (the bad commit), but `ClientFormLinkButton.tsx` was not updated to match. The intent is clear from the prop names:
- `clientId` — for potential re-use or tracking
- `hasGeneratedLink` — to change button label/state (e.g., "Regenerate" vs "Send")
- `initialEmail` / `initialPhone` — pre-fill or display contact info alongside the link

**Fix:** Add these 4 props to the `Props` type in `ClientFormLinkButton.tsx` and implement the intended behavior (at minimum accept and use `hasGeneratedLink` to show "Regenerate" vs "Send" in the button label; accept `clientId`, `initialEmail`, `initialPhone` even if only stored for future use). The phone type is `Phone | null` from `@shared-domain`.

**What `ClientFormLinkStatus` is:** A separate read-only badge component in the same folder. It renders a green "Client info received" or yellow "Awaiting client" badge. It is already complete and used in `OrderDetailTracking.tsx`. No changes needed there.

---

### 3. `AddressAutocomplete` — missing `onCurrentLocationLoadingChange` prop

**File:** `admin-app/src/shared/inputs/address-autocomplete/AddressAutocomplete.tsx`

**Problem:** `DeliveryAddressStep.tsx` passes `onCurrentLocationLoadingChange={setIsResolvingCurrentLocation}` but `AddressAutocompleteProps` does not declare this prop (line 10–29).

**Fix:**
1. Check if `@shared-inputs`'s `AddressAutocomplete` (the underlying component) accepts `onCurrentLocationLoadingChange?: (loading: boolean) => void`. If yes, add it to `AddressAutocompleteProps` and spread it through via `...props`.
2. If the shared component does NOT support it, add it to `AddressAutocompleteProps` (so TypeScript doesn't error) but implement the loading state tracking in this wrapper component instead.

**Search command:**
```bash
grep -n "onCurrentLocationLoadingChange" packages/shared-inputs/src/
```

---

### 4. Final Build Verification

After fixing the 3 issues above, run clean builds:

```bash
# admin-app
cd Front_end/admin-app && npm run build

# driver-app
cd Front_end/driver-app && npm run build

# client-form-app (needs install first)
cd Front_end/client-form-app && npm install && npm run build
```

**Expected:** Zero TypeScript errors in all three builds.

**Note on tracking-order-app:** All source files in `tracking-order-app/src/` are empty. This app was never implemented in git history. Skip unless explicitly told to scaffold it.

---

## Key Type Facts for Codex

| Old type/field | Current type/field | Notes |
|---|---|---|
| `Order.route_plan_id` | `Order.delivery_plan_id` | Backend FK rename |
| `OrderNote { type, content }` | `string` (plain text) | Structured notes gone |
| `Order.order_notes: OrderNote[]` | `Order.order_notes: string[] \| null` | |
| `OrderNoteMutationPayload.order_notes` | `string \| string[]` | API accepts both |
| `PlanDetailResponse.delivery_plan` | `PlanDetailResponse.route_plan` | Realtime payload key |
| `onAuthError: () => Promise<boolean>` | `onAuthError: () => void \| Promise<void>` | `createRealtimeClient` signature |

## Architecture Reminders

- Layer order: `packages → app/services → features/api → features/actions → features/flows → features/controllers → pages/components`
- `packages/` must be framework-agnostic — no React, no Zustand, no app hooks
- Feature state must not leak across feature boundaries
- No business logic in page components or routers
