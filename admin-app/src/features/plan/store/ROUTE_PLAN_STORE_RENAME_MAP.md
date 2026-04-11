# RoutePlan Store Rename Map

## Scope

This document defines the intentional breaking rename from Plan naming to RoutePlan naming in the store layer.

Current status:
- RoutePlan symbol migration completed
- Store file renames completed
- Consumer import migration completed
- `admin-app` build verified clean after migration

Compatibility policy:
- No backward compatibility aliases
- No temporary fallback exports
- Consumers must migrate to the new labels

## File Renames (completed)

- plan.slice.ts -> routePlan.slice.ts
- planState.store.ts -> routePlanState.store.ts
- planList.store.ts -> routePlanList.store.ts
- planPagination.store.ts -> routePlanPagination.store.ts
- planDateFilterUI.store.ts -> routePlanDateFilterUI.store.ts
- usePlan.selector.ts -> useRoutePlan.selector.ts
- planList.selector.ts -> routePlanList.selector.ts
- usePlanState.selector.ts -> useRoutePlanState.selector.ts

## Symbol Renames

### plan.slice.ts

- usePlanStore -> useRoutePlanStore
- selectAllPlans -> selectAllRoutePlans
- selectVisiblePlans -> selectVisibleRoutePlans
- selectPlanByClientId -> selectRoutePlanByClientId
- selectPlanByServerId -> selectRoutePlanByServerId
- selectDeliveryPlanStateById -> selectRoutePlanStateById
- useDeliveryPlanStateById -> useRoutePlanStateById
- insertPlan -> insertRoutePlan
- insertPlans -> insertRoutePlans
- upsertPlan -> upsertRoutePlan
- upsertPlans -> upsertRoutePlans
- updatePlan -> updateRoutePlan
- removePlan -> removeRoutePlan
- clearPlans -> clearRoutePlans
- setVisiblePlans -> setVisibleRoutePlans
- appendVisiblePlans -> appendVisibleRoutePlans
- addVisiblePlan -> addVisibleRoutePlan
- setDeliveryPlanStateId -> setRoutePlanStateId
- patchPlanTotals -> patchRoutePlanTotals

### planState.store.ts

- PLAN_STATE_TRANSITIONS -> ROUTE_PLAN_STATE_TRANSITIONS
- useDeliveryPlanStateStore -> useRoutePlanStateStore
- selectAllDeliveryPlanStates -> selectAllRoutePlanStates
- useDeliveryPlanState -> useRoutePlanState
- selectDeliveryPlanStateByClientId -> selectRoutePlanStateByClientId
- selectDeliveryPlanStateByServerId -> selectRoutePlanStateByServerId
- insertDeliveryPlanState -> insertRoutePlanState
- insertDeliveryPlanStates -> insertRoutePlanStates
- updateDeliveryPlanState -> updateRoutePlanState
- removeDeliveryPlanState -> removeRoutePlanState
- clearDeliveryPlanStates -> clearRoutePlanStates

### planList.store.ts

- usePlanListStore -> useRoutePlanListStore
- selectPlanListStats -> selectRoutePlanListStats
- selectPlanListPagination -> selectRoutePlanListPagination
- selectPlanListQuery -> selectRoutePlanListQuery
- selectPlanListLoading -> selectRoutePlanListLoading
- selectPlanListError -> selectRoutePlanListError
- setPlanListResult -> setRoutePlanListResult
- setPlanListLoading -> setRoutePlanListLoading
- setPlanListError -> setRoutePlanListError
- clearPlanList -> clearRoutePlanList
- incrementPlanListTotal -> incrementRoutePlanListTotal

### planPagination.store.ts

- PlanPaginationState -> RoutePlanPaginationState
- usePlanPaginationStore -> useRoutePlanPaginationStore
- selectPlanCurrentPage -> selectRoutePlanCurrentPage
- selectPlanHasMore -> selectRoutePlanHasMore
- selectPlanIsLoadingPage -> selectRoutePlanIsLoadingPage
- selectPlanNextCursor -> selectRoutePlanNextCursor

### planDateFilterUI.store.ts

- PlanDateFilterUIState -> RoutePlanDateFilterUIState
- usePlanDateFilterUIStore -> useRoutePlanDateFilterUIStore
- usePlanDateFilterUIState -> useRoutePlanDateFilterUIState
- usePlanDateFilterUIActions -> useRoutePlanDateFilterUIActions

### usePlan.selector.ts

- usePlans -> useRoutePlans
- useVisiblePlans -> useVisibleRoutePlans
- usePlanByClientId -> useRoutePlanByClientId
- usePlanByServerId -> useRoutePlanByServerId
- useDeliveryPlanStateById -> useRoutePlanStateById
- usePlanType -> useRoutePlanType

### planList.selector.ts

- usePlanListStats -> useRoutePlanListStats

### usePlanState.selector.ts

- useDeliveryPlanStates -> useRoutePlanStates
- useDeliveryPlanStateByClientId -> useRoutePlanStateByClientId
- useDeliveryPlanStateByServerId -> useRoutePlanStateByServerId

## Removed Names

The old names above are intentionally removed from exports.

## Consumer Checklist

- [x] Update all store imports in features that consume plan store APIs
- [x] Update selector hook imports in flows/controllers/components/pages
- [x] Update realtime provider imports
- [x] Run build and verify no unresolved symbol or old-path imports remain

## Progress

- [x] Phase A: Store symbol rename
- [x] Mapping document created
- [x] Phase B: Store file renames
- [x] Phase C: Consumer import migration
- [x] Phase D: Route operations build validation
