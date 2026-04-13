# Route Group Incoming Order Feedback

## Goal

When an order is moved from one route plan to another through the batch endpoint:

- while the batch request is in flight, every route group in the target plan should show inline loading order cards
- when the response arrives, those loading cards should disappear
- the UI should then give clear feedback about where the order actually landed

The original intended UX evolved like this:

1. First attempt:
   show an inline helper card inside the currently viewed route group list:
   `Order moved to route group <name>`

2. Later attempt:
   remove that helper card and instead animate the destination route-group avatar in the route-group rail

The current problem is with step 2:

- the rail animation is not firing at the correct time
- opening the target plan can already show an animation before the batch response arrives
- when the response actually arrives, the expected destination-group animation is not reliable

## Current Relevant Files

### Batch move controller

- `admin-app/src/features/order/controllers/orderBatchDeliveryPlan.controller.ts`

This is the place where route-group-to-plan drags eventually land for batch plan assignment.

Relevant current behavior:

- optimistic placeholder cards are registered before request:
  - `registerIncomingRouteGroupOrderPlaceholders(planId, count)`
- placeholders are cleared on commit / rollback:
  - `clearIncomingRouteGroupOrderPlaceholders(planId, placeholderToken)`
- after commit, destination route-group ids are derived from the backend payload:
  - `resolveBundleDestinationRouteGroupId(...)`
- after commit, destination route-group pulses are triggered:
  - `triggerIncomingRouteGroupPulse(routeGroupId)`

### Placeholder loading cards

- `admin-app/src/features/plan/routeGroup/store/routeGroupIncomingOrderPlaceholder.store.ts`
- `admin-app/src/features/plan/routeGroup/components/RouteGroupOrderList.tsx`

This part is working correctly.

Behavior:

- if the user opens the target plan while the batch request is in flight, each route group shows loading order cards
- when the response arrives, those loading cards disappear

### Route-group rail pulse

- `admin-app/src/features/plan/routeGroup/store/routeGroupIncomingPulse.store.ts`
- `admin-app/src/features/plan/routeGroup/components/routeGroupRail/DroppableRouteGroupRailAvatar.tsx`
- `admin-app/src/features/plan/routeGroup/components/routeGroupRail/RouteGroupRailAvatar.tsx`

This is the current feedback implementation that is not behaving correctly.

### Notification animation reference

- `admin-app/src/realtime/notifications/AdminNotificationsTrigger.tsx`

This file contains the visual pulse / wobble pattern that was copied conceptually into the route-group rail avatar.

Important note:

- the user referenced `AdminNotificationsPushCta.tsx`
- but the actual useful animation reference was found in `AdminNotificationsTrigger.tsx`

## Current Intended Flow

### During request

1. User drags a route stop / route stop group to another route plan
2. DnD resolves to `ASSIGN_ORDERS_TO_PLAN_BATCH`
3. `orderBatchDeliveryPlan.controller.ts` starts optimistic transaction
4. target plan placeholder cards are registered immediately
5. user can open the target route plan and see loading cards in all route groups

### After response

1. commit runs
2. backend payload is applied to orders / stops / route solutions
3. loading cards are removed
4. destination route-group id(s) are resolved from payload
5. destination rail avatar should animate

## Actual Problem Observed By User

When the target route plan has multiple route groups:

- user opens the target route plan while the batch request is still pending
- one route-group avatar animates immediately on open
- this happens before the batch response comes back
- when the response actually arrives and the loading cards disappear, no meaningful destination animation plays

So there is a timing / trigger problem.

## Important Current Hypothesis

The wrong animation is probably not coming from the pulse store itself only.

Likely sources:

1. The avatar component already has its own ordinary mount / transition behavior, which can look like an attention animation when the route-group page opens
2. The destination-group pulse signal may be too weak or too early for the UI to distinguish from normal render/mount motion
3. The route-group page may be mounting after the store already contains active pulse state, so the avatar renders directly in an "already active" visual state rather than reacting to a fresh event
4. The current implementation keys pulse state only by route-group id, not by explicit event sequence tied to the page’s own observation lifecycle

## Fix Attempts Already Tried

### 1. Inline helper card in route-group list

Implemented:

- transient UI store for moved-order notices
- helper card appended to route-group order list after loading cards disappear

Problems encountered:

- card sometimes rendered in the destination route group too
- multiple attempts were made to filter by:
  - active route group id
  - last opened route group id by plan
  - selected route solution route_group_id at render time

This path was abandoned by user decision.

Files involved in the abandoned approach:

- `routeGroupMovedOrderNotice.store.ts`
- `RouteGroupMovedOrderNoticeCard.tsx`

These files were removed.

### 2. Boolean-like destination pulse state

Implemented:

- route-group pulse store
- rail avatar reacts to `useHasIncomingRouteGroupPulse(routeGroupId)`

Observed issue:

- opening the route plan could already look animated
- response timing was not clear enough

### 3. Token-based pulse state

Refined implementation:

- pulse store now exposes token-like state per route-group id instead of simple active boolean
- avatar listens to token changes and starts a short local animation when token changes
- ordinary progress-label mount animation was removed to reduce false-positive motion on page open

This still does not satisfy the user.

## Current Pulse Store State

File:

- `admin-app/src/features/plan/routeGroup/store/routeGroupIncomingPulse.store.ts`

Current model:

- store owns `activeTokenByRouteGroupId`
- `triggerIncomingRouteGroupPulse(routeGroupId)` writes a new token
- token auto-clears after timeout
- rail item subscribes to token for its route-group id

Potential structural issue:

- the store is not page-session aware
- if the page mounts while a token is already active, the avatar can still enter a visually highlighted state without a fresh post-response event

## Why The Placeholder Cards Work But The Rail Animation Does Not

The placeholder cards are stateful presence UI:

- render while request is pending
- disappear when request resolves

This is simple and stable because it maps directly to current state.

The rail pulse is event UI:

- it should fire once, after response
- it should not appear just because the page mounted while some state already exists

So the missing piece is likely not more conditional rendering, but a more explicit event delivery model.

## Suggested Direction For Fresh Analysis

Claude should likely evaluate replacing the current pulse-state approach with a more explicit event-driven model.

Possible stronger design:

1. Store an event queue or latest event id per route-group, not just active token presence
2. Include `createdAt` / monotonic sequence
3. Let the route-group rail avatar compare the latest seen event id against a local ref
4. Only animate when a new event id is observed after the component is mounted

That would cleanly separate:

- "this route group has an active visual state"
from
- "a new incoming-order event happened and should animate now"

Alternative:

- keep pulse state in a dedicated plan/route-group event store
- trigger the animation from a feature flow tied to route-group page lifecycle rather than directly from avatar render state

## Things That Already Work And Should Probably Be Kept

These parts seem correct and should be preserved unless root redesign requires otherwise:

1. Batch payload destination resolution helper:
   `resolveBundleDestinationRouteGroupId(...)`

2. Plan-scoped loading cards during in-flight batch request:
   `routeGroupIncomingOrderPlaceholder.store.ts`

3. Commit timing in batch controller:
   pulse/feedback should only happen inside `commit`, after authoritative response is applied

## Requested Outcome

The target behavior the user wants now is:

- while request is pending:
  loading cards show in all route groups of the target plan

- after response:
  loading cards disappear

- then:
  only the route-group avatar that actually received the moved order should play the attention animation

- and:
  that animation should begin when the response resolves, not when the route plan page merely opens
