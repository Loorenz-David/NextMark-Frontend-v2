# Missing Contact Warning for Order-to-Plan Drag and Drop

**Status:** Implemented  
**Date:** 2026-07-26  
**Scope:** `admin-app` plan drag-and-drop and order client-form handoff

## Summary

When a user drags an unscheduled order with no primary email address and no
primary phone number onto a route plan, the app pauses the drop and presents a
confirmation popup.

The popup lets the user:

- enter a recipient and move the order before sending the client form
- move the order before sending the form to a linked device
- move the order without sending a form
- cancel the drop

For both send choices, the route-plan move and the form handoff now run
**concurrently**: the move is started first so its synchronous optimistic store
update (the order's new `delivery_plan_id`) lands before the handoff reads the
route-plan schedule, then both proceed at the same time. The form reaches the
customer or linked device alongside the plan assignment rather than after it.
The handoff is fire-and-forget — it is not gated on the move succeeding.

## Trigger Conditions

The warning is shown only when all of the following are true:

1. The resolved DnD intent is `ASSIGN_ORDER_TO_PLAN`.
2. The operation concerns one order, not a batch.
3. The order is currently unscheduled: `delivery_plan_id == null`.
4. Both of these values are blank after trimming:
   - `client_email`
   - `client_primary_phone.number`

The pure rule is implemented by
`shouldWarnForMissingOrderAssignmentContact`.

Existing moves between plans, route-stop moves, unscheduling operations, and
batch assignments continue through the existing DnD pipeline without this
warning.

## User Experience

### Initial view

The popup explains that the order has no primary contact information and
offers four outcomes:

| Action | Result |
| --- | --- |
| **Send form to customer** | Opens the recipient form inside the same popup. |
| **Move & send to linked device** | Closes the popup, then moves the order and requests the client form on the linked device concurrently. |
| **Move anyway** | Closes the popup and moves the order without a form handoff. |
| **Cancel** | Cancels the drop without a mutation or handoff. |

Escape, backdrop dismissal, the popup close button, and popup unmount are also
treated as cancellation.

### Customer recipient view

The customer view contains compact Email and Phone fields.

- Both fields are displayed.
- At least one recipient is required.
- Any populated field must be valid.
- Email is trimmed.
- The phone number is trimmed and receives the existing default prefix when
  necessary.
- **Move & send form** remains disabled until the recipient state is valid.
- **Back** returns to the initial choices without moving the order.

The entered values are delivery recipients for this handoff. They are not
saved directly as the order's primary contact information.

### Linked-device availability

The linked-device action is disabled when:

- the order has not been persisted
- no linked employee device is available
- another order is already awaiting that linked device

The popup displays the blocking reason. Availability is checked again by the
handoff flow before emitting the realtime request.

## Decision Contract

The popup resolves exactly once with
`OrderAssignmentContactWarningDecision`:

```ts
type OrderAssignmentContactWarningDecision =
  | { kind: "cancel" }
  | { kind: "move_anyway" }
  | { kind: "send_customer"; recipients: ClientFormRecipients }
  | { kind: "send_linked_device" };
```

The one-shot settlement guard prevents a button action and a subsequent
unmount from resolving the pending DnD decision twice.

## Execution Sequence

The orchestration order is:

```text
resolve drop intent
  -> evaluate missing-contact rule
  -> reset drag overlay
  -> await popup decision
  -> cancel, or start the route-plan move
  -> start the selected form handoff (if any) in the same tick
  -> await both concurrently
```

`runPlanDndMoveWithHandoff` owns the concurrency contract:

- The move is started before the handoff so the move's synchronous optimistic
  store update (the order's new `delivery_plan_id`) is applied before the
  handoff resolves the route-plan schedule it streams to the device.
- Both then run concurrently; the handoff is **not** gated on the move
  succeeding (fire-and-forget).
- `move_anyway` supplies no handoff and ends after the existing move pipeline.
- Customer and linked-device choices supply a handoff callback that runs
  alongside the move.

The move still runs through `useExecutePlanDndIntent.execute`, wrapped by the
existing route-map refresh flow. Existing mutation feedback, label downloads,
map refreshes, and success animations remain owned by the established DnD
pipeline.

## Customer Handoff

After a successful move, the customer handoff:

1. Checks whether the order already has a generated client-form link.
2. Generates the link when required.
3. Updates the existing link-preview and order stores.
4. Sends the link to the normalized email and/or phone recipient.
5. Returns a typed `sent` or `error` result.

Link generation is centralized in `ensureOrderClientFormLink`. The existing
order-details action also reuses this action, so link generation and local
store updates have one implementation.

Recipient normalization is centralized in
`resolveClientFormRecipients`. Both the existing Send Form popup and the new
DnD warning use `useClientFormRecipientFieldsController`, keeping their email
and phone validation behavior consistent.

## Linked-Device Handoff

Persisted-order linked-device requests are centralized in
`requestOrderClientFormOnLinkedDevice`.

The flow:

1. Resolves the current employee user ID.
2. Checks for another pending order on the linked device.
3. Clears stale live-progress state.
4. Registers the order as pending.
5. Registers the initial live-progress state.
6. Emits one external-form realtime request.
7. Clears pending and live state if emission throws.

The existing order-form linked-device controller now delegates persisted-order
requests to this reusable flow. Draft-order requests remain local to the open
order form because they do not have a persisted order ID.

The existing global receiver and floating live-progress widget continue to
consume the registered state. No second socket listener or progress UI was
introduced for the DnD entry point.

## Result and Failure Behavior

The reusable order handoff returns:

```ts
type OrderClientFormHandoffResult =
  | { status: "sent"; kind: "customer" | "linked_device" }
  | {
      status: "blocked" | "error";
      kind: "customer" | "linked_device";
      message: string;
    };
```

| Situation | Behavior |
| --- | --- |
| Popup is cancelled or dismissed | No move and no form handoff. |
| Move fails | Existing move error feedback is shown. The form may already have been sent, since the handoff runs concurrently; each reports its own outcome. |
| Move succeeds with **Move anyway** | The operation ends with no handoff. |
| Customer handoff succeeds | A success message confirms the client form was sent (the move reports separately). |
| Linked-device handoff succeeds | A success message confirms the linked-device request; live tracking remains active (the move reports separately). |
| Handoff fails | A contextual error explains that the form was not sent; the move is unaffected. |
| Another linked-device request is already pending | The availability check returns `blocked`; no duplicate request is emitted. |

The move is never rolled back on a form-handoff failure, and — because the two
run concurrently — a form may be sent even when the move later fails on the
server. That is an accepted trade-off for sending at the same time as the move;
users can retry either side from the order's existing Send Form controls.

## Architecture and Ownership

### Plan feature

| Layer | Responsibility |
| --- | --- |
| `domain/orderAssignmentContactWarning.domain.ts` | Pure warning rule and popup decision contract. |
| `popups/OrderAssignmentContactWarning/OrderAssignmentContactWarningPopup.tsx` | Warning choices and inline customer-recipient UI. |
| `controllers/usePlanDndContactWarning.controller.ts` | Opens the registered popup and exposes a Promise-based decision to DnD. |
| `flows/runPlanDndMoveWithHandoff.flow.ts` | Starts the move, then the handoff, and awaits both concurrently (fire-and-forget handoff). |
| `hooks/usePlanOrderDndController.tsx` | Connects the resolved drop intent, popup decision, existing move executor, and order handoff interface. |
| `registry/planPopups.registry.ts` | Registers `plan.order-assignment-contact-warning`. |

### Order feature

| Layer | Responsibility |
| --- | --- |
| `domain/clientFormRecipients.domain.ts` | Pure recipient normalization and validation result. |
| `controllers/useClientFormRecipientFields.controller.ts` | Owns recipient field state for both popup entry points. |
| `actions/ensureOrderClientFormLink.action.ts` | Generates a missing link and updates existing feature stores. |
| `flows/orderClientFormHandoff.flow.ts` | Executes a customer or linked-device handoff and returns a typed result. |
| `flows/requestOrderClientFormOnLinkedDevice.flow.ts` | Owns persisted-order pending state, live state, socket emission, and emission-failure cleanup. |
| `controllers/useOrderClientFormHandoff.controller.ts` | Adapts the handoff flow to UI messages and the active linked-device identity. |
| `index.ts` | Exposes only the recipient and handoff interfaces required by the plan feature. |

The plan feature imports the order handoff through the order feature barrel.
It does not deep-import order internals.

## Key Files

- `src/features/plan/hooks/usePlanOrderDndController.tsx`
- `src/features/plan/controllers/usePlanDndContactWarning.controller.ts`
- `src/features/plan/domain/orderAssignmentContactWarning.domain.ts`
- `src/features/plan/flows/runPlanDndMoveWithHandoff.flow.ts`
- `src/features/plan/popups/OrderAssignmentContactWarning/OrderAssignmentContactWarningPopup.tsx`
- `src/features/order/controllers/useOrderClientFormHandoff.controller.ts`
- `src/features/order/domain/clientFormRecipients.domain.ts`
- `src/features/order/flows/orderClientFormHandoff.flow.ts`
- `src/features/order/flows/requestOrderClientFormOnLinkedDevice.flow.ts`
- `src/features/order/actions/ensureOrderClientFormLink.action.ts`

## Tests

Focused tests cover:

- recipient normalization and validation
- the missing-contact warning guard
- move/handoff concurrency: move started before handoff, both run
- handoff still runs when the move fails (fire-and-forget)
- customer link generation and sending
- linked-device pending/live registration
- single realtime emission
- linked-device conflict blocking

Test files:

- `src/features/order/domain/tests/clientFormRecipients.domain.test.ts`
- `src/features/order/flows/tests/orderClientFormHandoff.flow.test.ts`
- `src/features/order/flows/tests/requestOrderClientFormOnLinkedDevice.flow.test.ts`
- `src/features/plan/domain/tests/orderAssignmentContactWarning.domain.test.ts`
- `src/features/plan/flows/tests/runPlanDndMoveWithHandoff.flow.test.ts`

Verification completed for the implementation:

- `npm run build`
- `npm run check:popup-contract`
- focused ESLint checks for all changed files
- focused execution of the new domain and flow tests
- `git diff --check`

The repository-wide lint command still reports unrelated pre-existing findings;
the files in this implementation pass the focused lint run.

## Maintenance Notes

- Keep the trigger rule pure and based on the order's persisted
  `delivery_plan_id`; do not infer scheduled state from visual placement.
- Preserve the start-move-before-handoff ordering so the optimistic
  `delivery_plan_id` update is applied before the handoff reads the route-plan
  schedule; the two are otherwise concurrent and the handoff is fire-and-forget.
- New order handoff consumers should import from `@/features/order`, not from
  order feature internals.
- Reuse the linked-device request flow for persisted orders so pending
  protection, live tracking, cleanup, and socket emission remain consistent.
- Batch assignment is intentionally outside the scope of this warning.
- This change adds no new backend endpoint or database migration.
