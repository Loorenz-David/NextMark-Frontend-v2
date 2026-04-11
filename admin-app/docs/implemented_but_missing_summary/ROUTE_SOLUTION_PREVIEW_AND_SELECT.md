# Route Solution Preview and Select — Implementation Plan

## Goal

Decouple "viewing a route solution" from "confirming it as selected on the backend." Users can freely browse route solutions in the `RouteOptimizationDropdownButton` dropdown. Browsing (preview) renders the solution's stops, orders, and stats without touching the server. A dedicated "Select" action persists the choice to the backend and purges unneeded solution data from the store.

---

## Background: Current vs. New Behavior

### Current
- Clicking a solution in the dropdown calls `selectRouteSolution(id)` → immediately hits `PATCH /route_solutions/{id}/select` → updates `is_selected` in store.
- Only one solution (the backend-selected one) ever has its stops loaded in the stop store.

### New
- Clicking a solution in the dropdown **previews** it: loads it from the server if not already full in store, sets it as the active UI view — **no server write**.
- A "Select" button appears when the previewed solution differs from the backend-confirmed one. Tapping it calls `PATCH /api_v2/route_plans/<plan_id>/route-groups/<group_id>/route-solutions/<solution_id>/select` → backend confirmation + realtime events + analytics.
- After a successful select, all non-selected solutions (and their stops) for that route group are **purged** from the store.

---

## New Backend Endpoints

### 1. Load any solution (preview)
```
GET /api_v2/route_plans/<plan_id>/route-groups/<group_id>/route-solutions/<solution_id>
Response: { route_solution: RouteSolution (full), route_solution_stop: RouteSolutionStopMap }
```

### 2. Confirm selected solution
```
PATCH /api_v2/route_plans/<plan_id>/route-groups/<group_id>/route-solutions/<solution_id>/select
Response: same shape as existing RouteSolutionUpdateResponse — { route_solution?, route_solution_stops? }
```

---

## Architecture Overview

```
RouteOptimizationDropdownButton
  → solution item click → previewRouteSolution(solutionId)
      → if not loaded: GET /api_v2/.../<solution_id>      ← new endpoint
      → upsert solution + stops in store
      → set previewedSolutionIdByGroupId[routeGroupId] = solutionId

  → "Select this route" button → confirmSelectRouteSolution(solutionId)
      → PATCH /api_v2/.../<solution_id>/select             ← new endpoint
      → update is_selected flag in routeSolution store
      → purgeNonSelectedRouteSolutionsForGroup(routeGroupId)
      → clear previewedSolutionIdByGroupId[routeGroupId]

useActiveRouteGroupResourcesController
  → selectedRouteSolution = previewedSolution ?? backendSelectedSolution ?? first
  → routeSolutionStops = stops for selectedRouteSolution.id (unchanged selector)
```

All downstream consumers (order list, map markers, route stats) react automatically because they derive from `selectedRouteSolution` and `routeSolutionStops` in the page state context — no extra wiring needed.

---

## Step 1 — Add new API methods to `routeSolution.api.ts`

**File:** `src/features/plan/routeGroup/api/routeSolution.api.ts`

Add a new response type and two new methods:

```ts
export type RouteSolutionFullGetResponse = {
  route_solution: RouteSolution;
  route_solution_stop: RouteSolutionStopMap;
};
```

```ts
// Add to routeSolutionApi object:

getRouteSolutionFull: (
  planId: number,
  routeGroupId: number,
  routeSolutionId: number,
): Promise<ApiResult<RouteSolutionFullGetResponse>> =>
  apiClient.request<RouteSolutionFullGetResponse>({
    path: `/api_v2/route_plans/${planId}/route-groups/${routeGroupId}/route-solutions/${routeSolutionId}`,
    method: 'GET',
  }),

selectRouteSolutionV2: (
  planId: number,
  routeGroupId: number,
  routeSolutionId: number,
): Promise<ApiResult<RouteSolutionUpdateResponse>> =>
  apiClient.request<RouteSolutionUpdateResponse>({
    path: `/api_v2/route_plans/${planId}/route-groups/${routeGroupId}/route-solutions/${routeSolutionId}/select`,
    method: 'PATCH',
  }),
```

Keep the existing `selectRouteSolution` and `getRouteSolution` methods in place — they are used by existing code that has not been migrated yet and should not be broken.

---

## Step 2 — New preview state store

**New file:** `src/features/plan/routeGroup/store/routeSolutionPreview.store.ts`

This is a thin Zustand slice that holds which solution is currently being previewed per route group. It lives outside the entity store so that preview state can change without causing entity store churn.

```ts
import { create } from 'zustand';

type RouteSolutionPreviewState = {
  previewedIdByGroupId: Record<number, number | null>;
  loadingPreviewGroupId: number | null;

  setPreviewedId: (routeGroupId: number, solutionId: number | null) => void;
  clearPreviewedId: (routeGroupId: number) => void;
  setLoadingPreviewGroupId: (routeGroupId: number | null) => void;
};

export const useRouteSolutionPreviewStore = create<RouteSolutionPreviewState>((set) => ({
  previewedIdByGroupId: {},
  loadingPreviewGroupId: null,

  setPreviewedId: (routeGroupId, solutionId) =>
    set((state) => ({
      previewedIdByGroupId: { ...state.previewedIdByGroupId, [routeGroupId]: solutionId },
    })),

  clearPreviewedId: (routeGroupId) =>
    set((state) => {
      const next = { ...state.previewedIdByGroupId };
      delete next[routeGroupId];
      return { previewedIdByGroupId: next };
    }),

  setLoadingPreviewGroupId: (routeGroupId) =>
    set({ loadingPreviewGroupId: routeGroupId }),
}));

export const getPreviewedSolutionId = (routeGroupId: number | null | undefined): number | null => {
  if (routeGroupId == null) return null;
  return useRouteSolutionPreviewStore.getState().previewedIdByGroupId[routeGroupId] ?? null;
};
```

---

## Step 3 — Store purge helpers

### `routeSolution.store.ts`

Add a new purge function that removes all non-backend-selected solutions for a route group:

```ts
export const purgeNonSelectedRouteSolutionsForGroup = (routeGroupId: number): string[] => {
  const state = useRouteSolutionStore.getState();
  const toRemove: string[] = [];
  state.allIds.forEach((clientId) => {
    const solution = state.byClientId[clientId];
    if (solution?.route_group_id === routeGroupId && !solution.is_selected) {
      toRemove.push(clientId);
    }
  });
  toRemove.forEach((clientId) => state.remove(clientId));
  return toRemove; // return removed client_ids so stop purge can match by solution id
};
```

### `routeSolutionStop.store.ts`

Add a batch removal by solution ID array (solution entity store only holds `id`, not `clientId`, so pass server IDs):

```ts
export const removeRouteSolutionStopsBySolutionIds = (solutionIds: number[]) => {
  if (!solutionIds.length) return;
  const idSet = new Set(solutionIds);
  const state = useRouteSolutionStopStore.getState();
  state.allIds.forEach((clientId) => {
    const stop = state.byClientId[clientId];
    if (stop?.route_solution_id != null && idSet.has(stop.route_solution_id)) {
      state.remove(clientId);
    }
  });
};
```

The caller resolves which server IDs to purge before calling the stop store. See Step 4 for the combined purge operation.

---

## Step 4 — Update `routeSolution.controller.ts`

**File:** `src/features/plan/routeGroup/controllers/routeSolution.controller.ts`

### 4a — Add combined purge helper (module-level)

```ts
const purgeNonSelectedSolutionsAndStopsForGroup = (routeGroupId: number) => {
  // First collect the server IDs of solutions about to be removed
  const state = useRouteSolutionStore.getState();
  const solutionIdsToRemove: number[] = [];
  state.allIds.forEach((clientId) => {
    const solution = state.byClientId[clientId];
    if (solution?.route_group_id === routeGroupId && !solution.is_selected && solution.id != null) {
      solutionIdsToRemove.push(solution.id);
    }
  });
  // Remove stops first (they reference solution IDs)
  removeRouteSolutionStopsBySolutionIds(solutionIdsToRemove);
  // Then remove the solutions
  purgeNonSelectedRouteSolutionsForGroup(routeGroupId);
};
```

### 4b — Add `previewRouteSolution`

```ts
const previewRouteSolution = useCallback(
  async (
    routeSolutionId: number,
    planId: number,
    routeGroupId: number,
  ) => {
    // If already being previewed, no-op
    const currentPreview = getPreviewedSolutionId(routeGroupId);
    if (currentPreview === routeSolutionId) return;

    // Check if the solution is already fully loaded with stops
    const storedSolution = selectRouteSolutionByServerId(routeSolutionId)(
      useRouteSolutionStore.getState(),
    );
    const stopsAlreadyLoaded =
      storedSolution?._representation === 'full' &&
      useRouteSolutionStopStore
        .getState()
        .allIds.some(
          (cid) =>
            useRouteSolutionStopStore.getState().byClientId[cid]?.route_solution_id ===
            routeSolutionId,
        );

    if (!stopsAlreadyLoaded) {
      useRouteSolutionPreviewStore.getState().setLoadingPreviewGroupId(routeGroupId);
      try {
        const response = await routeSolutionApi.getRouteSolutionFull(
          planId,
          routeGroupId,
          routeSolutionId,
        );
        if (!response.ok || !response.data) throw new Error('Failed to load route solution');
        // Upsert solution
        upsertRouteSolution(response.data.route_solution);
        // Replace stops for this solution
        replaceRouteSolutionStopsForSolution(routeSolutionId, response.data.route_solution_stop);
      } catch (error) {
        const resolved = resolveError(error, 'Unable to load route solution preview.');
        console.error('Failed to load route solution for preview', error);
        showMessage({ status: resolved.status, message: resolved.message });
        return;
      } finally {
        useRouteSolutionPreviewStore.getState().setLoadingPreviewGroupId(null);
      }
    }

    // Set preview (this triggers re-render in resources controller)
    useRouteSolutionPreviewStore.getState().setPreviewedId(routeGroupId, routeSolutionId);
  },
  [showMessage],
);
```

### 4c — Add `confirmSelectRouteSolution`

```ts
const confirmSelectRouteSolution = useCallback(
  async (
    routeSolutionId: number,
    planId: number,
    routeGroupId: number,
  ) => {
    // Snapshot previous is_selected state for rollback
    const state = useRouteSolutionStore.getState();
    const previous = selectRouteSolutionsByRouteGroupId(routeGroupId)(state).map((s) => ({
      client_id: s.client_id,
      is_selected: s.is_selected ?? false,
    }));

    // Optimistic flag update
    setSelectedRouteSolution(routeSolutionId, routeGroupId);

    try {
      const response = await routeSolutionApi.selectRouteSolutionV2(
        planId,
        routeGroupId,
        routeSolutionId,
      );
      if (!response.ok || !response.data) throw new Error('Select failed');

      applyUpdatePayload(response.data);

      // Clear preview (confirmed solution is now the backend selection)
      useRouteSolutionPreviewStore.getState().clearPreviewedId(routeGroupId);

      // Purge all non-selected solutions and their stops for this group
      purgeNonSelectedSolutionsAndStopsForGroup(routeGroupId);

      return response.data;
    } catch (error) {
      // Rollback is_selected flags
      previous.forEach((entry) => {
        useRouteSolutionStore.getState().update(entry.client_id, (solution) => ({
          ...solution,
          is_selected: entry.is_selected,
        }));
      });
      const resolved = resolveError(error, 'Unable to select route solution.');
      console.error('Failed to confirm route solution selection', error);
      showMessage({ status: resolved.status, message: resolved.message });
      return null;
    }
  },
  [showMessage],
);
```

### 4d — Expose new mutations from `useRouteSolutionMutations`

```ts
return {
  updateRouteSolutionAddress,
  updateRouteSolutionTimes,
  selectRouteSolution,            // keep existing — some callsites may still use it
  previewRouteSolution,           // new
  confirmSelectRouteSolution,     // new
  routeReadyForDelivery,
};
```

---

## Step 5 — Update `useRouteGroupPageActions`

**File:** `src/features/plan/routeGroup/actions/useRouteGroupPageActions.tsx`

The `previewRouteSolution` and `confirmSelectRouteSolution` mutations need `planId` and `routeGroupId` which are already available in the `Props` of this hook.

```ts
// Destructure from useRouteSolutionMutations:
const {
  routeReadyForDelivery,
  selectRouteSolution: selectRouteSolutionMutation,
  previewRouteSolution: previewRouteSolutionMutation,
  confirmSelectRouteSolution: confirmSelectRouteSolutionMutation,
} = useRouteSolutionMutations();
```

Add action wrappers:

```ts
const previewRouteSolution = (solutionId: number) => {
  if (!routeGroupId || !planId) return;
  void previewRouteSolutionMutation(solutionId, planId, routeGroupId);
};

const confirmSelectRouteSolution = () => {
  if (!routeGroupId || !planId || !selectedRouteSolution?.id) return;
  void confirmSelectRouteSolutionMutation(
    selectedRouteSolution.id,
    planId,
    routeGroupId,
  );
};
```

Keep existing `selectRouteSolution` wrapper unchanged (it is still used by the DnD system and other places).

Return from hook:

```ts
return {
  handleCreateOrder,
  handleEditLocalPlan,
  handlePrintRouteSolution,
  routeReadyForDelivery: routeReadyForDeliveryAction,
  optimizeRoute,
  reOptimizeRoute,
  selectRouteSolution,              // existing (backend-select immediately)
  previewRouteSolution,             // new
  confirmSelectRouteSolution,       // new
  resolveRouteWarnings,
};
```

---

## Step 6 — Update `useActiveRouteGroupResourcesController`

**File:** `src/features/plan/routeGroup/controllers/useActiveRouteGroupResources.controller.ts`

Add preview store subscription:

```ts
import {
  useRouteSolutionPreviewStore,
} from '../store/routeSolutionPreview.store';

// Inside the controller:
const previewedSolutionId = useRouteSolutionPreviewStore(
  (s) => s.previewedIdByGroupId[routeGroupId ?? -1] ?? null,
);
const isLoadingPreview = useRouteSolutionPreviewStore(
  (s) => s.loadingPreviewGroupId === routeGroupId,
);

// Replace the existing selectedRouteSolution derivation:
const storedSelectedRouteSolution = useSelectedRouteSolutionByRouteGroupId(routeGroupId);

const selectedRouteSolution = useMemo(() => {
  if (previewedSolutionId != null) {
    const previewed = routeSolutions.find((s) => s.id === previewedSolutionId) ?? null;
    if (previewed) return previewed;
  }
  return storedSelectedRouteSolution ?? routeSolutions[0] ?? null;
}, [previewedSolutionId, routeSolutions, storedSelectedRouteSolution]);
```

Expose `isLoadingPreview` and `previewedSolutionId`:

```ts
return {
  // ...existing fields
  selectedRouteSolution,
  previewedSolutionId,
  isLoadingPreview,
  storedSelectedRouteSolutionId: storedSelectedRouteSolution?.id ?? null,
  // ...rest
};
```

---

## Step 7 — Update `RouteGroupPageStateContextValue` and `RouteGroupPageProvider`

**File:** `src/features/plan/routeGroup/context/RouteGroupPage.context.ts`

Add two new fields to `RouteGroupPageStateContextValue`:

```ts
previewedSolutionId: number | null;    // currently previewed (may differ from selectedRouteSolution if loads are in-flight)
isLoadingPreview: boolean;             // true while fetching a not-yet-loaded solution
```

**File:** `src/features/plan/routeGroup/providers/RouteGroupPageProvider.tsx`

Thread the two new fields from `useRouteGroupPageResourcesController` into the `stateValue` memo (and its dependency array).

---

## Step 8 — Update `RouteOptimizationDropdownButton`

**File:** `src/features/plan/routeGroup/components/RouteOptimizationDropdownButton.tsx`

### 8a — Change solution-item click from select → preview

```tsx
onClick={() => solution.id && routeGroupPageActions.previewRouteSolution(solution.id)}
```

### 8b — Mark the "currently previewed" item

In each list item, derive two states:
- `isBackendSelected = solution.is_selected === true`
- `isPreviewing = solution.id === previewedSolutionId && previewedSolutionId != null`

Show a distinct visual for each:
- `is_selected` + not previewing → `CheckMarkIcon` (existing, means backend-confirmed)
- `isPreviewing` → eye / "previewing" indicator (not yet committed to backend)

Read `previewedSolutionId` and `isLoadingPreview` from `useRouteGroupPageState()`.

```tsx
const {
  routeSolutionsOrdered,
  bestRouteSolutionId,
  isSelectedSolutionOptimized,
  previewedSolutionId,       // new
  isLoadingPreview,          // new
} = useRouteGroupPageState();
```

### 8c — Add "Select this route" confirm button

Show this section **only when** `previewedSolutionId != null` and the previewed solution is not already the backend-confirmed selection:

```tsx
const previewedIsBackendSelected =
  previewedSolutionId != null &&
  routeSolutionsOrdered.find((s) => s.id === previewedSolutionId)?.is_selected === true;

const showConfirmSelect =
  previewedSolutionId != null && !previewedIsBackendSelected;
```

Add below the solutions list (before the Re-optimize section):

```tsx
{showConfirmSelect && (
  <div className="pt-2 mt-2 border-t border-[var(--color-border)]">
    <BasicButton
      params={{
        variant: 'toolbarPrimary',        // or whichever filled variant fits
        onClick: routeGroupPageActions.confirmSelectRouteSolution,
        className: 'w-full',
      }}
    >
      Select this route
    </BasicButton>
  </div>
)}
```

### 8d — Loading indicator while preview fetches

When `isLoadingPreview` is `true`, show a subtle loading state on the solution list (e.g., disable clicks, show a spinner on the item being clicked). The simplest approach: track which solution ID is being clicked in local component state and show a spinner next to it until `isLoadingPreview` becomes `false`.

---

## Step 9 — Clear preview on route group navigation

When the active route group changes (user clicks a different group in the rail), the preview for the old group should be cleared so it doesn't linger.

**File:** `src/features/plan/routeGroup/flows/syncActiveRouteSolutionSelection.flow.ts`

Add a cleanup effect that clears the preview when `routeGroupId` changes:

```ts
import { useRouteSolutionPreviewStore } from '../store/routeSolutionPreview.store';

// Add inside the flow hook:
useEffect(() => {
  if (routeGroupId == null) return;
  return () => {
    useRouteSolutionPreviewStore.getState().clearPreviewedId(routeGroupId);
  };
}, [routeGroupId]);
```

This runs the cleanup when `routeGroupId` changes or the component unmounts.

---

## Step 10 — Verify `useSyncActiveRouteSolutionSelectionFlow` is unaffected

The sync flow only touches `is_selected` in the `routeSolution` store. Since the preview store is separate and the `is_selected` flag continues to reflect the backend-confirmed state, no change is needed in this flow.

The only caution: after `purgeNonSelectedSolutionsAndStopsForGroup` removes solutions from the store, the sync flow's `routeSolutions` list will shrink. If the sync flow was about to set a fallback, it may now have fewer solutions to choose from — but this is the correct behavior since we just reduced to the confirmed one.

---

## File Summary

### New files

| File | Purpose |
|------|---------|
| `src/features/plan/routeGroup/store/routeSolutionPreview.store.ts` | Thin Zustand slice for previewed solution ID per group + loading flag |

### Modified files

| File | Change |
|------|--------|
| `src/features/plan/routeGroup/api/routeSolution.api.ts` | Add `getRouteSolutionFull` and `selectRouteSolutionV2` |
| `src/features/plan/routeGroup/store/routeSolution.store.ts` | Add `purgeNonSelectedRouteSolutionsForGroup` |
| `src/features/plan/routeGroup/store/routeSolutionStop.store.ts` | Add `removeRouteSolutionStopsBySolutionIds` |
| `src/features/plan/routeGroup/controllers/routeSolution.controller.ts` | Add `previewRouteSolution`, `confirmSelectRouteSolution`, combined purge helper |
| `src/features/plan/routeGroup/actions/useRouteGroupPageActions.tsx` | Expose `previewRouteSolution` and `confirmSelectRouteSolution` action wrappers |
| `src/features/plan/routeGroup/controllers/useActiveRouteGroupResources.controller.ts` | Derive `selectedRouteSolution` from preview store; expose `previewedSolutionId` + `isLoadingPreview` |
| `src/features/plan/routeGroup/context/RouteGroupPage.context.ts` | Add `previewedSolutionId` and `isLoadingPreview` to state context type |
| `src/features/plan/routeGroup/providers/RouteGroupPageProvider.tsx` | Thread new fields into stateValue memo |
| `src/features/plan/routeGroup/components/RouteOptimizationDropdownButton.tsx` | Preview on click, loading indicator, "Select this route" confirm button |
| `src/features/plan/routeGroup/flows/syncActiveRouteSolutionSelection.flow.ts` | Clear preview on route group change / unmount |

---

## Key Invariants

- **`is_selected` flag always reflects backend-confirmed state.** Preview state is orthogonal and stored in `routeSolutionPreview.store.ts`. The entity store and sync flow do not need to know about preview.

- **Stops are always loaded before preview is set.** `previewRouteSolution` only calls `setPreviewedId` after the GET response has been applied to the stop store. This ensures `routeSolutionStops` in the resources controller is never empty for the previewed solution.

- **Purge is safe.** `purgeNonSelectedSolutionsAndStopsForGroup` is only called after a successful `confirmSelectRouteSolution`. At that point `is_selected` has been updated from the server response, so the selected solution is never removed.

- **No regression for DnD select.** The existing `selectRouteSolution` action wrapper (which calls the old `selectRouteSolutionMutation`) is kept unchanged and continues to work for the DnD drop intent. The new preview/confirm flow is additive.

- **Store does not grow unbounded.** Each `confirmSelectRouteSolution` call purges all previously-previewed solutions for that group. Users who browse multiple solutions and then confirm will end up with exactly one solution (and its stops) in the store for that group.
