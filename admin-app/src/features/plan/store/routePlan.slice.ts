import type { EntityTable } from "@shared-store";
import type { DeliveryPlan } from "@/features/plan/types/plan";
import type { DeliveryPlanState } from "@/features/plan/types/planState";

import { createEntityStore } from "@shared-store";
import {
  selectAll,
  selectByClientId,
  selectByServerId,
  selectVisible,
} from "@shared-store";
import { useRoutePlanStateStore } from "@/features/plan/store/routePlanState.store";

export const useRoutePlanStore = createEntityStore<DeliveryPlan>();

const selectRoutePlansInternal = selectAll<DeliveryPlan>();
export const selectAllRoutePlans = (state: EntityTable<DeliveryPlan>) =>
  selectRoutePlansInternal(state);
const selectVisibleRoutePlansInternal = selectVisible<DeliveryPlan>();
export const selectVisibleRoutePlans = (state: EntityTable<DeliveryPlan>) =>
  selectVisibleRoutePlansInternal(state);

export const selectRoutePlanByClientId =
  (clientId: string | null | undefined) => (state: EntityTable<DeliveryPlan>) =>
    selectByClientId<DeliveryPlan>(clientId)(state);

export const selectRoutePlanByServerId =
  (id: number | null | undefined) => (state: EntityTable<DeliveryPlan>) =>
    selectByServerId<DeliveryPlan>(id)(state);

export const selectRoutePlanStateById =
  (stateId: number | null | undefined) =>
  (state: EntityTable<DeliveryPlanState>) =>
    selectByServerId<DeliveryPlanState>(stateId)(state);

export const useRoutePlanStateById = (stateId: number | null | undefined) =>
  useRoutePlanStateStore(selectRoutePlanStateById(stateId));

export const insertRoutePlan = (routePlan: DeliveryPlan) =>
  useRoutePlanStore.getState().insert(routePlan);

export const insertRoutePlans = (table: {
  byClientId: Record<string, DeliveryPlan>;
  allIds: string[];
}) => useRoutePlanStore.getState().insertMany(table);

export const upsertRoutePlan = (routePlan: DeliveryPlan) => {
  const state = useRoutePlanStore.getState();
  if (state.byClientId[routePlan.client_id]) {
    state.update(routePlan.client_id, (existing) => ({
      ...existing,
      ...routePlan,
    }));
    return;
  }
  state.insert(routePlan);
};

export const upsertRoutePlans = (table: {
  byClientId: Record<string, DeliveryPlan>;
  allIds: string[];
}) => {
  table.allIds.forEach((clientId) => {
    const routePlan = table.byClientId[clientId];
    if (routePlan) {
      upsertRoutePlan(routePlan);
    }
  });
};

export const updateRoutePlan = (
  clientId: string,
  updater: (routePlan: DeliveryPlan) => DeliveryPlan,
) => useRoutePlanStore.getState().update(clientId, updater);

export const removeRoutePlan = (clientId: string) =>
  useRoutePlanStore.getState().remove(clientId);

export const clearRoutePlans = () => useRoutePlanStore.getState().clear();

export const setVisibleRoutePlans = (clientIds: string[] | null) =>
  useRoutePlanStore.getState().setVisibleIds(clientIds);

export const appendVisibleRoutePlans = (clientIds: string[]) => {
  if (clientIds.length === 0) return;

  const { visibleIds, setVisibleIds } = useRoutePlanStore.getState();
  const existingIds = visibleIds ?? [];
  const existingIdSet = new Set(existingIds);
  const dedupedIncoming = clientIds.filter(
    (clientId) => !existingIdSet.has(clientId),
  );

  if (dedupedIncoming.length === 0) return;

  setVisibleIds([...existingIds, ...dedupedIncoming]);
};

export const addVisibleRoutePlan = (clientId: string) => {
  const { visibleIds, setVisibleIds } = useRoutePlanStore.getState();
  if (!visibleIds) return;
  if (visibleIds.includes(clientId)) return;
  setVisibleIds([clientId, ...visibleIds]);
};

export const setRoutePlanStateId = (clientId: string, stateId: number | null) =>
  useRoutePlanStore.getState().update(clientId, (routePlan) => ({
    ...routePlan,
    state_id: stateId ?? null,
  }));

export const patchRoutePlanTotals = (
  routePlanId: number,
  totals: Partial<
    Pick<
      DeliveryPlan,
      | "total_weight"
      | "total_volume"
      | "total_items"
      | "item_type_counts"
      | "total_orders"
    >
  >,
) => {
  const state = useRoutePlanStore.getState();
  const clientId = state.idIndex[routePlanId];
  if (!clientId) return;
  state.update(clientId, (existing) => ({ ...existing, ...totals }));
};
