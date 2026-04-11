# Move Order to Route Group via Drag & Drop

**Status:** Under development
**Created:** 2026-03-27
**Updated:** 2026-03-28 — backend contracts reconciled from `ORDER_ROUTE_GROUP_ASSIGNMENT.md`
**Scope:** `admin-app` — `features/plan/routeGroup` only

---

## Overview

Enable users to drag a route stop card (single or grouped) from the route group order list and drop it onto a **RouteGroupRailAvatar** in the sidebar rail. On drop the order moves to the target route group (same plan) with a full optimistic update: old route stops are removed from the order, new stops are inserted per solution of the target group, and route group order counts are patched.

**Real endpoint (same-plan group move):**
- Single order: `PATCH /orders/{order_id}/plan/{plan_id}` — body `{ route_group_id, prevent_event_bus: false }`
- Multiple orders: `PATCH /plans/{plan_id}/batch` — body `{ orders: { selection: "by_ids", order_ids: [...] }, route_group_id, prevent_event_bus: false }`

For the DnD implementation we **always use the batch endpoint** to avoid branching — it handles 1 or N orders identically.

---

## Backend Contract Changes That Impact the Plan

The backend handoff (`ORDER_ROUTE_GROUP_ASSIGNMENT.md`) established two facts that required revisions from the original plan:

### 1. `Order` now has `route_group_id`

The `Order` type in `shared-domain/orders/order.ts` is missing `route_group_id`. This field must be added. It is the direct link between an order and the group executing it. The optimistic update must patch this field on the order when it moves.

```
route_plan_id  → which delivery plan owns the order
route_group_id → which group within the plan executes it
```

**Rule:** if `route_plan_id` is set, `route_group_id` must also be set.

### 2. Response shape is `updated: Bundle[]`, not a flat map

The backend returns a standard bundle array — same shape as existing plan-change endpoints:

```ts
type OrderGroupMovedBundle = {
  order: Order                      // updated order, includes new route_group_id
  order_stops?: RouteSolutionStop[] // new stops in target group's solutions
  route_solution?: RouteSolution[]  // both old and new solutions with updated stop_count
  plan_totals?: PlanTotalsEntry[]   // plan-level totals (plan stays the same for intra-plan moves)
}

type MoveOrderToRouteGroupResponse = {
  updated: OrderGroupMovedBundle[]
}
```

The `plan_totals` entries carry `total_orders` for the plan (unchanged for same-plan group moves). Route group `total_orders` is **not explicitly returned** — we keep our optimistic patch and the order list reconciles on next load.

---

## What Changes

### Layer map of all files touched

```
shared-domain/orders/order.ts                        ← add route_group_id to Order type
planDndIntent.ts                                     ← add planId to MOVE_ORDER_TO_ROUTE_GROUP intent
resolveDropIntent.ts                                 ← new route_group_rail overType branch + param
dnd/domain/resolveRouteSolutionRouteGroupId.ts       ← NEW domain helper
RouteGroupRailAvatar.tsx                             ← accept isDropTarget prop
DroppableRouteGroupRailAvatar.tsx                    ← NEW component (useDroppable wrapper)
RouteGroupRail.tsx                                   ← use DroppableRouteGroupRailAvatar
routeGroup.api.ts                                    ← add moveOrderToRouteGroup API call + types
routeGroup.slice.ts                                  ← add snapshot helpers
moveOrderToRouteGroup.action.ts                      ← NEW action file
useMoveOrderToRouteGroup.controller.ts               ← NEW controller
useExecutePlanDndIntent.ts                           ← new intent branch
usePlanOrderDndController.tsx                        ← pass new resolver param
```

---

## Step-by-Step Implementation

---

### Step 1 — Add `route_group_id` to the `Order` type

**File:** `packages/shared-domain/orders/order.ts`

Add the field after `route_plan_id`:

```ts
route_plan_id?: number | null
route_group_id?: number | null   // ← new: the group within the plan executing this order
```

This is the only change needed in `shared-domain`. The field is optional to maintain backward compatibility with contexts that don't yet set it.

---

### Step 2 — Add the new intent variant to `planDndIntent.ts`

**File:** `src/features/plan/domain/planDndIntent.ts`

Add a new union member:

```ts
| {
    kind: 'MOVE_ORDER_TO_ROUTE_GROUP'
    orderIds: number[]            // server IDs of the orders being moved
    planId: number                // server ID of the plan (needed for the batch endpoint URL)
    sourceRouteGroupId: number    // route group the stops currently belong to
    targetRouteGroupId: number    // rail avatar the user dropped onto
  }
```

`planId` is required because the batch endpoint is `PATCH /plans/{plan_id}/batch`. It is derived inside `resolveDropIntent` from the source route group's `route_plan_id`.

No changes to `derivePlanDndIntent` — that function handles the simple `order`/`plan` pairing only.

---

### Step 3 — Create `resolveRouteSolutionRouteGroupId.ts`

**File:** `src/features/plan/dnd/domain/resolveRouteSolutionRouteGroupId.ts`

Follows the same pattern as the existing `resolveRouteSolutionPlanClientId.ts`:

```ts
import {
  selectRouteSolutionByServerId,
  useRouteSolutionStore,
} from '@/features/plan/routeGroup/store/routeSolution.store'

export const resolveRouteGroupIdByRouteSolutionId = (
  routeSolutionId: number | null | undefined,
): number | null => {
  if (!routeSolutionId) return null
  const solution = selectRouteSolutionByServerId(routeSolutionId)(
    useRouteSolutionStore.getState(),
  )
  return solution?.route_group_id ?? null
}
```

This will be used inside `resolveDropIntent` to derive the source route group from the active drag's solution.

---

### Step 4 — Update `resolveDropIntent.ts`

**File:** `src/features/plan/dnd/controller/resolveDropIntent.ts`

#### 4a. Add the new param to `ResolveDropIntentParams`

```ts
resolveRouteGroupIdByRouteSolutionId: (routeSolutionId: number | null | undefined) => number | null
```

#### 4b. Add a helper to resolve `planId` from a route group

The action needs the plan's server ID. Add a new resolver param — or derive it inline using `selectRouteGroupByServerId` reading `route_plan_id`. Add as a param to keep the function pure:

```ts
resolvePlanIdByRouteGroupId: (routeGroupId: number | null | undefined) => number | null
```

Implement as a domain helper alongside the other resolvers:

```ts
// resolveRouteGroupPlanId.ts
import {
  selectRouteGroupByServerId,
  useRouteGroupStore,
} from '@/features/plan/routeGroup/store/routeGroup.slice'

export const resolvePlanIdByRouteGroupId = (
  routeGroupId: number | null | undefined,
): number | null => {
  if (!routeGroupId) return null
  const group = selectRouteGroupByServerId(routeGroupId)(useRouteGroupStore.getState())
  return group?.route_plan_id ?? null
}
```

#### 4c. New branch inside `resolveDropIntent`

Inside the `if (activeType === 'route_stop_group' || activeType === 'route_stop')` block, add **before** the `overType === 'plan'` check:

```ts
if (overType === 'route_group_rail') {
  const targetRouteGroupId = toPositiveInt(overData.routeGroupId)
  if (!targetRouteGroupId) return { type: 'noop' }

  const sourceRouteSolutionId = resolveActiveRouteSolutionId(activeData)
  const sourceRouteGroupId = resolveRouteGroupIdByRouteSolutionId(sourceRouteSolutionId)
  if (!sourceRouteGroupId) return { type: 'noop' }
  if (sourceRouteGroupId === targetRouteGroupId) return { type: 'noop' }

  const planId = resolvePlanIdByRouteGroupId(sourceRouteGroupId)
  if (!planId) return { type: 'noop' }

  const orderIds = resolveManualIdsForActive(activeType, activeData)
  if (!orderIds.length) return { type: 'noop' }

  return {
    type: 'intent',
    intent: {
      kind: 'MOVE_ORDER_TO_ROUTE_GROUP',
      orderIds,
      planId,
      sourceRouteGroupId,
      targetRouteGroupId,
    },
  }
}
```

No `preview` is returned — route group rail drops don't project a stop reorder preview.

---

### Step 5 — Create `DroppableRouteGroupRailAvatar.tsx`

**File:** `src/features/plan/routeGroup/components/routeGroupRail/DroppableRouteGroupRailAvatar.tsx`

```tsx
import { useDroppable } from '@dnd-kit/core'
import { RouteGroupRailAvatar } from './RouteGroupRailAvatar'
import type { RouteGroupRailItem } from './types'

type Props = {
  item: RouteGroupRailItem
  onClick: (item: RouteGroupRailItem) => void
}

export const DroppableRouteGroupRailAvatar = ({ item, onClick }: Props) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `route_group_rail-${item.route_group_id}`,
    data: {
      type: 'route_group_rail',
      routeGroupId: item.route_group_id,
    },
  })

  return (
    <div ref={setNodeRef}>
      <RouteGroupRailAvatar item={item} onClick={onClick} isDropTarget={isOver} />
    </div>
  )
}
```

**Droppable data contract** (read by `resolveDropIntent`):

| Field | Value |
|---|---|
| `type` | `'route_group_rail'` |
| `routeGroupId` | `item.route_group_id` (server ID, number) |

Drag ID format: `route_group_rail-{route_group_id}`

---

### Step 6 — Update `RouteGroupRailAvatar.tsx`

**File:** `src/features/plan/routeGroup/components/routeGroupRail/RouteGroupRailAvatar.tsx`

Add an optional `isDropTarget?: boolean` prop. When `true`, apply a highlight ring on the avatar circle to signal that the user is hovering over a valid drop target:

```tsx
type RouteGroupRailAvatarProps = {
  item: RouteGroupRailItem
  onClick: (item: RouteGroupRailItem) => void
  isDropTarget?: boolean                      // ← new
}
```

Apply the ring on the inner `<span>` that renders the conic-gradient border:

```tsx
className={`... ${
  isDropTarget
    ? 'border-[rgb(var(--color-light-blue-r),0.85)] ring-2 ring-[rgb(var(--color-light-blue-r),0.45)]'
    : item.isActive
      ? 'border-[rgb(var(--color-light-blue-r),0.58)]'
      : 'border-[rgb(var(--color-light-blue-r),0.22)]'
}`}
```

---

### Step 7 — Update `RouteGroupRail.tsx`

**File:** `src/features/plan/routeGroup/components/routeGroupRail/RouteGroupRail.tsx`

Replace `RouteGroupRailAvatar` with `DroppableRouteGroupRailAvatar`:

```tsx
import { DroppableRouteGroupRailAvatar } from './DroppableRouteGroupRailAvatar'

// inside the map:
<DroppableRouteGroupRailAvatar
  key={item.route_group_id}
  item={item}
  onClick={onClick}
/>
```

---

### Step 8 — Add API call and types to `routeGroup.api.ts`

**File:** `src/features/plan/routeGroup/api/routeGroup.api.ts`

#### New request/response types

```ts
import type { PlanTotalsEntry } from '@shared-domain'
import type { RouteSolutionStop } from '@/features/plan/routeGroup/types/routeSolutionStop'
import type { RouteSolution } from '@/features/plan/routeGroup/types/routeSolution'
import type { Order } from '@/features/order/types/order'

export type MoveOrderToRouteGroupPayload = {
  orders: {
    selection: 'by_ids'
    order_ids: number[]
  }
  route_group_id: number
  prevent_event_bus: false
}

export type OrderGroupMovedBundle = {
  order: Order                      // updated order with new route_group_id
  order_stops?: RouteSolutionStop[] // stops in new group's solutions
  route_solution?: RouteSolution[]  // old + new solutions with updated stop_count
  plan_totals?: PlanTotalsEntry[]   // plan-level totals (plan unchanged for intra-plan move)
}

export type MoveOrderToRouteGroupResponse = {
  updated_bundles: OrderGroupMovedBundle[]   // batch endpoint returns updated_bundles, not updated
  resolved_count?: number
  updated_count?: number
}
```

#### New API method

```ts
moveOrderToRouteGroup: (
  planId: number,
  payload: MoveOrderToRouteGroupPayload,
): Promise<ApiResult<MoveOrderToRouteGroupResponse>> =>
  apiClient.request<MoveOrderToRouteGroupResponse>({
    path: `/plans/${planId}/batch`,
    method: 'PATCH',
    body: payload,
  }),
```

> **Note:** `PlanTotalsEntry` is already defined in `shared-domain/orders/order.ts` and exported from `@shared-domain`. No new shared type needed.

---

### Step 9 — Add snapshot helpers to `routeGroup.slice.ts`

**File:** `src/features/plan/routeGroup/store/routeGroup.slice.ts`

The optimistic transaction needs to snapshot/restore route group store state (for `total_orders` rollback). The order/solution/stop snapshots are handled by the existing `createOrderOptimisticSnapshot` utility, but `routeGroup` is not included there. Add the two helpers here:

```ts
export const getRouteGroupSnapshot = () => {
  const state = useRouteGroupStore.getState()
  return structuredClone({
    byClientId: state.byClientId,
    idIndex: state.idIndex,
    allIds: state.allIds,
    visibleIds: state.visibleIds,
  })
}

export const restoreRouteGroupSnapshot = (
  snapshot: {
    byClientId: Record<string, RouteGroup>
    idIndex: Record<number, string>
    allIds: string[]
    visibleIds: string[] | null
  },
) => useRouteGroupStore.setState(snapshot)
```

---

### Step 10 — Create `moveOrderToRouteGroup.action.ts`

**File:** `src/features/plan/routeGroup/actions/moveOrderToRouteGroup.action.ts`

This action mirrors the pattern in `orderBatchDeliveryPlan.controller.ts`. It uses `optimisticTransaction` with a compound snapshot (orders + solutions + stops + route groups).

```ts
import { optimisticTransaction } from '@shared-optimistic'

import {
  createOrderOptimisticSnapshot,
  restoreOrderOptimisticSnapshot,
} from '@/features/order/utils/orderOptimisticSnapshot'
import { setOrder } from '@/features/order/store/order.store'
import { normalizeOrderStopResponse } from '@/features/order/domain/orderStopResponse'
import { useOrderStore } from '@/features/order/store/order.store'

import { routeGroupApi } from '@/features/plan/routeGroup/api/routeGroup.api'
import type { MoveOrderToRouteGroupResponse } from '@/features/plan/routeGroup/api/routeGroup.api'
import {
  upsertRouteSolution,
  selectRouteSolutionsByRouteGroupId,
  useRouteSolutionStore,
} from '@/features/plan/routeGroup/store/routeSolution.store'
import {
  removeRouteSolutionStopsByOrderId,
  upsertRouteSolutionStops,
  upsertRouteSolutionStop,
  selectRouteSolutionsByOrderId,    // does not exist yet — see note below
  useRouteSolutionStopStore,
} from '@/features/plan/routeGroup/store/routeSolutionStop.store'
import {
  updateRouteGroup,
  selectRouteGroupByServerId,
  useRouteGroupStore,
  getRouteGroupSnapshot,
  restoreRouteGroupSnapshot,
} from '@/features/plan/routeGroup/store/routeGroup.slice'

// ─── compound snapshot (orders + solutions + stops + route groups) ───────────

const takeSnapshot = () => ({
  ...createOrderOptimisticSnapshot(),
  routeGroups: getRouteGroupSnapshot(),
})

const restoreSnapshot = (snap: ReturnType<typeof takeSnapshot>) => {
  restoreOrderOptimisticSnapshot(snap)
  restoreRouteGroupSnapshot(snap.routeGroups)
}

// ─── apply server response ───────────────────────────────────────────────────

const applyResponse = (
  data: MoveOrderToRouteGroupResponse,
  onDrift: () => void,
) => {
  const bundles = data.updated_bundles ?? []
  const resolvedCount = data.resolved_count ?? 0
  const updatedCount = data.updated_count ?? 0

  for (const bundle of bundles) {
    const updatedOrder = bundle.order
    if (!updatedOrder?.id) continue

    // 1. Update the order (new route_group_id is now set)
    setOrder(updatedOrder)

    // 2. Remove old stops for this order, insert server-confirmed new stops
    removeRouteSolutionStopsByOrderId(updatedOrder.id)
    const normalizedStops = normalizeOrderStopResponse(bundle.order_stops)
    if (normalizedStops) {
      upsertRouteSolutionStops(normalizedStops)
    }

    // 3. Patch affected route solutions (stop_count changed on old + new group solutions)
    const changedSolutions = bundle.route_solution ?? []
    changedSolutions.forEach((solution) => {
      if (solution?.client_id) upsertRouteSolution(solution)
    })

    // 4. plan_totals is available if needed for future plan store patching
    // (plan total_orders does not change for same-plan group moves — currently a no-op)
  }

  // Drift detection: if the server processed more orders than it returned bundles for,
  // the caller should trigger a reload to reconcile. Mirrors orderBatchDeliveryPlan.controller.ts.
  const hasDrift = bundles.length === 0 || (resolvedCount > 0 && bundles.length < updatedCount)
  if (hasDrift) {
    onDrift()
  }
}

// ─── optimistic mutation ─────────────────────────────────────────────────────

const applyOptimisticMutation = (
  orderIds: number[],
  sourceRouteGroupId: number,
  targetRouteGroupId: number,
) => {
  const orderState = useOrderStore.getState()
  const stopState = useRouteSolutionStopStore.getState()

  // 1. Patch order.route_group_id optimistically
  for (const orderId of orderIds) {
    const clientId = orderState.idIndex[orderId]
    if (!clientId) continue
    const order = orderState.byClientId[clientId]
    if (!order) continue
    orderState.update(clientId, (o) => ({ ...o, route_group_id: targetRouteGroupId }))
  }

  // 2. Remove stops linking each order to any solution on the SOURCE group
  const sourceSolutions = selectRouteSolutionsByRouteGroupId(sourceRouteGroupId)(
    useRouteSolutionStore.getState(),
  )
  const sourceSolutionIds = new Set(sourceSolutions.map(s => s.id).filter(Boolean) as number[])

  for (const orderId of orderIds) {
    stopState.allIds
      .map(cid => stopState.byClientId[cid])
      .filter(stop => stop.order_id === orderId && sourceSolutionIds.has(stop.route_solution_id as number))
      .forEach(stop => useRouteSolutionStopStore.getState().remove(stop.client_id))
  }

  // 3. Insert placeholder stops for each solution on the TARGET group
  const targetSolutions = selectRouteSolutionsByRouteGroupId(targetRouteGroupId)(
    useRouteSolutionStore.getState(),
  )
  for (const solution of targetSolutions) {
    if (!solution.id) continue
    for (const orderId of orderIds) {
      upsertRouteSolutionStop({
        client_id: `optimistic-${solution.id}-${orderId}`,
        route_solution_id: solution.id,
        order_id: orderId,
        stop_order: null,
        eta_status: 'estimated',
        expected_arrival_time: 'loading',
      })
    }
  }

  // 4. Update total_orders on both route groups optimistically
  const groupState = useRouteGroupStore.getState()
  const sourceGroup = selectRouteGroupByServerId(sourceRouteGroupId)(groupState)
  const targetGroup = selectRouteGroupByServerId(targetRouteGroupId)(groupState)
  if (sourceGroup?.client_id) {
    updateRouteGroup(sourceGroup.client_id, g => ({
      ...g,
      total_orders: Math.max(0, (g.total_orders ?? 0) - orderIds.length),
    }))
  }
  if (targetGroup?.client_id) {
    updateRouteGroup(targetGroup.client_id, g => ({
      ...g,
      total_orders: (g.total_orders ?? 0) + orderIds.length,
    }))
  }
}

// ─── exported action ─────────────────────────────────────────────────────────

export const moveOrderToRouteGroupAction = async (params: {
  planId: number
  orderIds: number[]
  sourceRouteGroupId: number
  targetRouteGroupId: number
  onDrift?: () => void           // called when server returns fewer bundles than processed
}): Promise<{ success: boolean }> => {
  let success = false

  await optimisticTransaction({
    snapshot: takeSnapshot,
    mutate: () => applyOptimisticMutation(
      params.orderIds,
      params.sourceRouteGroupId,
      params.targetRouteGroupId,
    ),
    request: () => routeGroupApi.moveOrderToRouteGroup(params.planId, {
      orders: { selection: 'by_ids', order_ids: params.orderIds },
      route_group_id: params.targetRouteGroupId,
      prevent_event_bus: false,
    }),
    commit: (response) => {
      applyResponse(response.data, params.onDrift ?? (() => {}))
      success = true
    },
    rollback: restoreSnapshot,
    onError: (error) => {
      console.error('Failed to move order to route group', error)
    },
  })

  return { success }
}
```

> **Note on `removeRouteSolutionStopsByOrderId`:** The optimistic mutation calls this function directly from the store instead of using the action version — this is intentional so the removal is synchronous within the `mutate` callback. The same pattern is used in `orderBatchDeliveryPlan.controller.ts`.

---

### Step 11 — Create `useMoveOrderToRouteGroup.controller.ts`

**File:** `src/features/plan/routeGroup/controllers/useMoveOrderToRouteGroup.controller.ts`

```ts
import { useCallback } from 'react'
import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'
import { moveOrderToRouteGroupAction } from '@/features/plan/routeGroup/actions/moveOrderToRouteGroup.action'
import { useOrderFlow } from '@/features/order/flows/order.flow'
import { getQueryFilters, getQuerySearch } from '@/features/order/store/orderQuery.store'

export const useMoveOrderToRouteGroupMutation = () => {
  const { showMessage } = useMessageHandler()
  const { loadOrders } = useOrderFlow()

  const moveOrderToRouteGroup = useCallback(
    async (params: {
      planId: number
      orderIds: number[]
      sourceRouteGroupId: number
      targetRouteGroupId: number
    }) => {
      const result = await moveOrderToRouteGroupAction({
        ...params,
        // Drift: server processed more orders than returned bundles — reload to reconcile
        onDrift: () => {
          void loadOrders({ q: getQuerySearch(), filters: getQueryFilters() }, false)
        },
      }).catch((error) => {
        const message = error instanceof ApiError ? error.message : 'Failed to move order to route group.'
        const status = error instanceof ApiError ? error.status : 500
        showMessage({ status, message })
        return { success: false }
      })

      if (!result.success) {
        showMessage({ status: 500, message: 'Failed to move order to route group.' })
      }

      return result
    },
    [loadOrders, showMessage],
  )

  return { moveOrderToRouteGroup }
}
```

---

### Step 12 — Handle the intent in `useExecutePlanDndIntent.ts`

**File:** `src/features/plan/controllers/useExecutePlanDndIntent.ts`

```ts
import { useMoveOrderToRouteGroupMutation } from '@/features/plan/routeGroup/controllers/useMoveOrderToRouteGroup.controller'

// inside useExecutePlanDndIntent:
const { moveOrderToRouteGroup } = useMoveOrderToRouteGroupMutation()

// inside execute():
else if (intent.kind === 'MOVE_ORDER_TO_ROUTE_GROUP') {
  const result = await moveOrderToRouteGroup({
    planId: intent.planId,
    orderIds: intent.orderIds,
    sourceRouteGroupId: intent.sourceRouteGroupId,
    targetRouteGroupId: intent.targetRouteGroupId,
  })
  return { droppedPlanClientId: null, success: result.success }
}
```

---

### Step 13 — Wire new resolver params in `usePlanOrderDndController.tsx`

**File:** `src/features/plan/hooks/usePlanOrderDndController.tsx`

Import and pass the two new resolvers to both `resolveDropIntent` calls (in `onDragOver` and `onDragEnd`):

```ts
import { resolveRouteGroupIdByRouteSolutionId } from '@/features/plan/dnd/domain/resolveRouteSolutionRouteGroupId'
import { resolvePlanIdByRouteGroupId } from '@/features/plan/dnd/domain/resolveRouteGroupPlanId'

// inside resolveDropIntent({ ... }):
resolveRouteGroupIdByRouteSolutionId,
resolvePlanIdByRouteGroupId,
```

No other logic changes to this file.

---

## Optimistic State Changes Summary

| Store | Optimistic Write | On Commit (server response) | On Rollback |
|---|---|---|---|
| `order` store | Set `route_group_id = targetRouteGroupId` on each moved order | `setOrder(bundle.order)` — authoritative `route_group_id` | `restoreOrderSnapshot` |
| `routeSolutionStop` store | Remove stops linking order → source solutions; insert placeholders for order → target solutions | `removeRouteSolutionStopsByOrderId` + `upsertRouteSolutionStops` from `bundle.order_stops` | `restoreRouteSolutionStopSnapshot` |
| `routeSolution` store | No change (stop_count is server-computed) | `upsertRouteSolution` from `bundle.route_solution` | `restoreRouteSolutionSnapshot` |
| `routeGroup` store | `total_orders -N` on source, `+N` on target | No explicit patch — optimistic value kept (server doesn't return group totals in this response) | `restoreRouteGroupSnapshot` |

---

## API Contract (Real — from backend handoff)

**Endpoint:** `PATCH /plans/{plan_id}/batch`

**Request body:**
```json
{
  "orders": {
    "selection": "by_ids",
    "order_ids": [123]
  },
  "route_group_id": 15,
  "prevent_event_bus": false
}
```

**Response body:**
```json
{
  "updated": [
    {
      "order": {
        "id": 123,
        "route_plan_id": 42,
        "route_group_id": 15,
        "state": "routed_confirmed",
        "order_stops": [
          { "id": 2001, "stop_order": 5, "route_solution_id": 502, "client_id": "..." }
        ]
      },
      "route_solution": [
        { "id": 501, "route_group_id": 10, "stop_count": 9, "client_id": "..." },
        { "id": 502, "route_group_id": 15, "stop_count": 11, "client_id": "..." }
      ],
      "order_stops": [
        { "id": 2001, "stop_order": 5, "route_solution_id": 502, "client_id": "..." }
      ],
      "plan_totals": [
        { "id": 42, "total_orders": 25 }
      ]
    }
  ]
}
```

**Validation on backend:**
- `route_group_id` must belong to `plan_id`
- `route_group_id` must be different from the order's current group
- If not provided, backend attempts zone-based inference (can fail if ambiguous) — for DnD we always provide it explicitly

---

## Files to Create

| File | Type |
|---|---|
| `src/features/plan/dnd/domain/resolveRouteSolutionRouteGroupId.ts` | Domain helper |
| `src/features/plan/dnd/domain/resolveRouteGroupPlanId.ts` | Domain helper |
| `src/features/plan/routeGroup/components/routeGroupRail/DroppableRouteGroupRailAvatar.tsx` | Component |
| `src/features/plan/routeGroup/actions/moveOrderToRouteGroup.action.ts` | Action |
| `src/features/plan/routeGroup/controllers/useMoveOrderToRouteGroup.controller.ts` | Controller |

## Files to Modify

| File | Change |
|---|---|
| `packages/shared-domain/orders/order.ts` | Add `route_group_id?: number \| null` to `Order` |
| `src/features/plan/domain/planDndIntent.ts` | Add `MOVE_ORDER_TO_ROUTE_GROUP` variant (with `planId`) |
| `src/features/plan/dnd/controller/resolveDropIntent.ts` | New `route_group_rail` branch + two new params |
| `src/features/plan/routeGroup/components/routeGroupRail/RouteGroupRailAvatar.tsx` | Accept `isDropTarget` prop |
| `src/features/plan/routeGroup/components/routeGroupRail/RouteGroupRail.tsx` | Use `DroppableRouteGroupRailAvatar` |
| `src/features/plan/routeGroup/api/routeGroup.api.ts` | Add `moveOrderToRouteGroup` + new types |
| `src/features/plan/routeGroup/store/routeGroup.slice.ts` | Add `getRouteGroupSnapshot` / `restoreRouteGroupSnapshot` |
| `src/features/plan/controllers/useExecutePlanDndIntent.ts` | New intent branch |
| `src/features/plan/hooks/usePlanOrderDndController.tsx` | Pass two new resolver params |

---

## Out of Scope

- Dragging `order` or `order_group` types onto the rail (only `route_stop` and `route_stop_group` are in scope — these are already on the route)
- Cross-plan moves via the rail (plan boundary logic stays in the existing `ASSIGN_ORDERS_TO_PLAN_BATCH` path)
- Stop ordering within the new group (server decides position; placeholders reflect this)
- Handling the backend 422 "ambiguous group inference" error — not applicable here since we always pass `route_group_id` explicitly
