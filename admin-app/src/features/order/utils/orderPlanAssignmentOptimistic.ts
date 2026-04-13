import type { Order } from "../types/order";
import { useOrderStore } from "../store/order.store";

export type OptimisticOrderPlanAssignmentEntry = {
  clientId: string;
  serverId: number;
  previousDeliveryPlanId: number | null;
  previousOrderPlanObjective: string | null;
  previousRouteGroupId: number | null;
};

export const collectOptimisticOrderPlanAssignmentEntries = (
  orderServerIds: number[],
): OptimisticOrderPlanAssignmentEntry[] => {
  const state = useOrderStore.getState();
  const uniqueOrderIds = Array.from(
    new Set(orderServerIds.filter((id) => Number.isFinite(id) && id > 0)),
  );

  return uniqueOrderIds.reduce<OptimisticOrderPlanAssignmentEntry[]>(
    (acc, orderServerId) => {
      const clientId = state.idIndex[orderServerId];
      const order = clientId ? state.byClientId[clientId] : null;
      if (!clientId || !order) {
        return acc;
      }

      acc.push({
        clientId,
        serverId: orderServerId,
        previousDeliveryPlanId: order.delivery_plan_id ?? null,
        previousOrderPlanObjective: order.order_plan_objective ?? null,
        previousRouteGroupId: order.route_group_id ?? null,
      });
      return acc;
    },
    [],
  );
};

export const applyOptimisticOrderPlanAssignment = (
  entries: OptimisticOrderPlanAssignmentEntry[],
  params: {
    targetPlanId: number;
    planType: string;
    clearRouteGroup?: boolean;
  },
) => {
  if (!entries.length) {
    return;
  }

  const state = useOrderStore.getState();
  const patch = {
    delivery_plan_id: params.targetPlanId,
    order_plan_objective: params.planType,
    ...(params.clearRouteGroup ? { route_group_id: null } : {}),
  };

  state.patchMany(
    entries.map((entry) => entry.clientId),
    patch,
  );
};

export const restoreOptimisticOrderPlanAssignment = (
  entries: OptimisticOrderPlanAssignmentEntry[],
) => {
  if (!entries.length) {
    return;
  }

  const state = useOrderStore.getState();
  entries.forEach((entry) => {
    state.update(entry.clientId, (order: Order) => ({
      ...order,
      delivery_plan_id: entry.previousDeliveryPlanId,
      order_plan_objective: entry.previousOrderPlanObjective,
      route_group_id: entry.previousRouteGroupId,
    }));
  });
};

export const collectAffectedRouteGroupIdsFromAssignments = (
  entries: OptimisticOrderPlanAssignmentEntry[],
) =>
  Array.from(
    new Set(
      entries
        .map((entry) => entry.previousRouteGroupId)
        .filter(
          (routeGroupId): routeGroupId is number =>
            typeof routeGroupId === "number" && Number.isFinite(routeGroupId),
        ),
    ),
  );
