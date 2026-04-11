import type { OrderBatchMoveResponse, PlanTotalsEntry } from "@shared-domain";

import {
  patchRoutePlanTotals,
  selectRoutePlanByServerId,
  updateRoutePlan,
  useRoutePlanStore,
} from "@/features/plan/store/routePlan.slice";
import {
  selectRouteGroupByServerId,
  updateRouteGroup,
  useRouteGroupStore,
} from "@/features/plan/routeGroup/store/routeGroup.slice";

type BatchStateChanges = {
  route_groups?: Array<{
    id: number;
    state_id: number | null;
    total_orders: number | null;
    order_state_counts?: Record<string, number> | null;
    item_type_counts?: Record<string, number> | null;
    route_plan_id?: number | null;
    zone_id?: number | null;
  }>;
  route_plans?: Array<{
    id: number;
    state_id: number | null;
    total_orders: number | null;
    item_type_counts?: Record<string, number> | null;
  }>;
};

type BatchMoveLikePayload = Partial<OrderBatchMoveResponse> & {
  updated?: OrderBatchMoveResponse["updated_bundles"];
};

type BatchMoveStateSyncResult = {
  hasRouteGroupStateChanges: boolean;
  hasRoutePlanStateChanges: boolean;
};

const extractFirstPlanTotals = (
  payload: BatchMoveLikePayload | null | undefined,
): PlanTotalsEntry[] => {
  if (Array.isArray(payload?.plan_totals) && payload.plan_totals.length > 0) {
    return payload.plan_totals;
  }

  const bundles = payload?.updated_bundles ?? payload?.updated ?? [];
  for (const bundle of bundles) {
    if (Array.isArray(bundle?.plan_totals) && bundle.plan_totals.length > 0) {
      return bundle.plan_totals;
    }
  }

  return [];
};

const extractFirstStateChanges = (
  payload: BatchMoveLikePayload | null | undefined,
): BatchStateChanges | null => {
  if (payload?.state_changes) {
    return payload.state_changes;
  }

  const bundles = payload?.updated_bundles ?? payload?.updated ?? [];
  for (const bundle of bundles) {
    if (bundle?.state_changes) {
      return bundle.state_changes;
    }
  }

  return null;
};

export const applyOrderBatchMoveStateSync = (
  payload: BatchMoveLikePayload | null | undefined,
): BatchMoveStateSyncResult => {
  const planTotals = extractFirstPlanTotals(payload);
  planTotals.forEach((totals) => {
    patchRoutePlanTotals(totals.id, {
      total_weight: totals.total_weight,
      total_volume: totals.total_volume,
      total_items: totals.total_items,
      item_type_counts: totals.item_type_counts,
      total_orders: totals.total_orders,
    });
  });

  const stateChanges = extractFirstStateChanges(payload);

  const routePlanChanges = Array.isArray(stateChanges?.route_plans)
    ? stateChanges?.route_plans
    : [];

  routePlanChanges.forEach((planChange) => {
    const routePlan = selectRoutePlanByServerId(planChange.id)(
      useRoutePlanStore.getState(),
    );
    if (!routePlan?.client_id) return;

    updateRoutePlan(routePlan.client_id, (existing) => ({
      ...existing,
      state_id: planChange.state_id,
      total_orders: planChange.total_orders,
      item_type_counts: planChange.item_type_counts ?? null,
    }));
  });

  const routeGroupChanges = Array.isArray(stateChanges?.route_groups)
    ? stateChanges?.route_groups
    : [];

  routeGroupChanges.forEach((groupChange) => {
    const routeGroup = selectRouteGroupByServerId(groupChange.id)(
      useRouteGroupStore.getState(),
    );
    if (!routeGroup?.client_id) return;

    updateRouteGroup(routeGroup.client_id, (existing) => ({
      ...existing,
      state_id: groupChange.state_id,
      total_orders: groupChange.total_orders,
      order_state_counts: groupChange.order_state_counts ?? null,
      item_type_counts: groupChange.item_type_counts ?? null,
      route_plan_id:
        groupChange.route_plan_id ?? existing.route_plan_id ?? null,
      zone_id: groupChange.zone_id ?? existing.zone_id ?? null,
    }));
  });

  return {
    hasRouteGroupStateChanges: routeGroupChanges.length > 0,
    hasRoutePlanStateChanges: routePlanChanges.length > 0,
  };
};
