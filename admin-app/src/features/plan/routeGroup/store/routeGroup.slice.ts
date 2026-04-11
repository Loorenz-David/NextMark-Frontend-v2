import type { EntityTable } from "@shared-store";
import type { RouteGroup } from "@/features/plan/routeGroup/types/routeGroup";

import { createEntityStore } from "@shared-store";
import { selectAll, selectByClientId, selectByServerId } from "@shared-store";
import {
  selectRoutePlanByServerId,
  useRoutePlanStore,
} from "@/features/plan/store/routePlan.slice";

export const useRouteGroupStore = createEntityStore<RouteGroup>();

export const selectAllRouteGroups = (state: EntityTable<RouteGroup>) =>
  selectAll<RouteGroup>()(state);

export const selectRouteGroupByClientId =
  (clientId: string | null | undefined) => (state: EntityTable<RouteGroup>) =>
    selectByClientId<RouteGroup>(clientId)(state);

export const selectRouteGroupByServerId =
  (id: number | null | undefined) => (state: EntityTable<RouteGroup>) =>
    selectByServerId<RouteGroup>(id)(state);

export const selectRouteGroupsByPlanId =
  (planId: number | null | undefined) => (state: EntityTable<RouteGroup>) => {
    if (planId == null) return [];
    return state.allIds.reduce<RouteGroup[]>((acc, clientId) => {
      const plan = state.byClientId[clientId];
      if (plan?.route_plan_id === planId) {
        acc.push(plan);
      }
      return acc;
    }, []);
  };

export const getPlanEndDateByRouteGroupId = (routeGroupId?: number | null) => {
  if (routeGroupId == null) return null;
  const localPlan = selectRouteGroupByServerId(routeGroupId)(
    useRouteGroupStore.getState(),
  );
  if (!localPlan?.route_plan_id) return null;
  const plan = selectRoutePlanByServerId(localPlan.route_plan_id)(
    useRoutePlanStore.getState(),
  );
  return plan?.end_date ?? null;
};

export const insertRouteGroup = (plan: RouteGroup) =>
  useRouteGroupStore.getState().insert(plan);

export const insertRouteGroups = (table: {
  byClientId: Record<string, RouteGroup>;
  allIds: string[];
}) => useRouteGroupStore.getState().insertMany(table);

export const upsertRouteGroup = (plan: RouteGroup) => {
  const state = useRouteGroupStore.getState();
  if (state.byClientId[plan.client_id]) {
    state.update(plan.client_id, (existing) => ({ ...existing, ...plan }));
    return;
  }
  state.insert(plan);
};

export const upsertRouteGroups = (table: {
  byClientId: Record<string, RouteGroup>;
  allIds: string[];
}) => {
  table.allIds.forEach((clientId) => {
    const plan = table.byClientId[clientId];
    if (plan) {
      upsertRouteGroup(plan);
    }
  });
};

export const updateRouteGroup = (
  clientId: string,
  updater: (plan: RouteGroup) => RouteGroup,
) => useRouteGroupStore.getState().update(clientId, updater);

export const removeRouteGroup = (clientId: string) =>
  useRouteGroupStore.getState().remove(clientId);

export const clearRouteGroups = () => useRouteGroupStore.getState().clear();

export const getRouteGroupSnapshot = () => {
  const state = useRouteGroupStore.getState();
  return structuredClone({
    byClientId: state.byClientId,
    idIndex: state.idIndex,
    allIds: state.allIds,
    visibleIds: state.visibleIds,
  });
};

export const restoreRouteGroupSnapshot = (snapshot: {
  byClientId: Record<string, RouteGroup>;
  idIndex: Record<number, string>;
  allIds: string[];
  visibleIds: string[] | null;
}) => useRouteGroupStore.setState(snapshot);
