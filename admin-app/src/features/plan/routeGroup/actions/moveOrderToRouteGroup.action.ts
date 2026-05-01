import { optimisticTransaction } from "@shared-optimistic";

import { normalizeOrderStopResponse } from "@/features/order/domain/orderStopResponse";
import { setOrder, useOrderStore } from "@/features/order/store/order.store";
import {
  createOrderOptimisticSnapshot,
  restoreOrderOptimisticSnapshot,
} from "@/features/order/utils/orderOptimisticSnapshot";

import {
  routeGroupApi,
  type MoveOrderToRouteGroupResponse,
} from "@/features/plan/routeGroup/api/routeGroup.api";
import {
  selectRouteGroupByServerId,
  updateRouteGroup,
  useRouteGroupStore,
  getRouteGroupSnapshot,
  restoreRouteGroupSnapshot,
} from "@/features/plan/routeGroup/store/routeGroup.slice";
import {
  selectRouteSolutionsByRouteGroupId,
  upsertRouteSolution,
  useRouteSolutionStore,
} from "@/features/plan/routeGroup/store/routeSolution.store";
import {
  removeRouteSolutionStop,
  removeRouteSolutionStopsByOrderId,
  upsertRouteSolutionStop,
  upsertRouteSolutionStops,
  useRouteSolutionStopStore,
} from "@/features/plan/routeGroup/store/routeSolutionStop.store";
import { syncRouteGroupSummaries } from "@/features/plan/routeGroup/flows/syncRouteGroupSummaries.flow";
import { applyOrderBatchMoveStateSync } from "@/features/order/actions/applyOrderBatchMoveStateSync.action";

const takeSnapshot = () => ({
  ...createOrderOptimisticSnapshot(),
  routeGroups: getRouteGroupSnapshot(),
});

const restoreSnapshot = (snapshot: ReturnType<typeof takeSnapshot>) => {
  restoreOrderOptimisticSnapshot(snapshot);
  restoreRouteGroupSnapshot(snapshot.routeGroups);
};

const applyResponse = (
  data: MoveOrderToRouteGroupResponse,
  onDrift: () => void,
  affectedRouteGroupIds: number[],
) => {
  const bundles = data.updated_bundles ?? data.updated ?? [];
  const resolvedCount = data.resolved_count ?? 0;
  const updatedCount = data.updated_count ?? bundles.length;

  bundles.forEach((bundle) => {
    const updatedOrder = bundle.order;
    if (!updatedOrder?.id) return;

    setOrder(updatedOrder);
    removeRouteSolutionStopsByOrderId(updatedOrder.id);

    const normalizedStops = normalizeOrderStopResponse(bundle.order_stops);
    if (normalizedStops) {
      upsertRouteSolutionStops(normalizedStops);
    }

    const changedSolutions = bundle.route_solution ?? [];
    changedSolutions.forEach((solution) => {
      if (solution?.client_id) {
        upsertRouteSolution(solution);
      }
    });
  });

  const hasDrift =
    bundles.length === 0 ||
    (resolvedCount > 0 && bundles.length < updatedCount);

  const syncResult = applyOrderBatchMoveStateSync(data);
  if (!syncResult.hasRouteGroupStateChanges) {
    syncRouteGroupSummaries(affectedRouteGroupIds);
  }

  if (hasDrift) {
    onDrift();
  }
};

const applyOptimisticMutation = (
  orderIds: number[],
  sourceRouteGroupId: number,
  targetRouteGroupId: number,
) => {
  const targetRouteGroup = selectRouteGroupByServerId(targetRouteGroupId)(
    useRouteGroupStore.getState(),
  );
  const targetPlanId = targetRouteGroup?.route_plan_id ?? null;
  const orderState = useOrderStore.getState();
  const stopState = useRouteSolutionStopStore.getState();

  if (typeof targetPlanId === "number" && Number.isFinite(targetPlanId)) {
    const patchedClientIds = orderIds
      .map((orderId) => orderState.idIndex[orderId])
      .filter((clientId): clientId is string =>
        Boolean(clientId && orderState.byClientId[clientId]),
      );

    if (patchedClientIds.length > 0) {
      orderState.patchMany(patchedClientIds, {
        delivery_plan_id: targetPlanId,
        order_plan_objective: "local_delivery",
      });
    }
  }

  orderIds.forEach((orderId) => {
    const clientId = orderState.idIndex[orderId];
    if (!clientId) return;
    const order = orderState.byClientId[clientId];
    if (!order) return;
    orderState.update(clientId, (existing) => ({
      ...existing,
      route_group_id: targetRouteGroupId,
    }));
  });

  const sourceSolutions = selectRouteSolutionsByRouteGroupId(
    sourceRouteGroupId,
  )(useRouteSolutionStore.getState());
  const sourceSolutionIds = new Set(
    sourceSolutions
      .map((solution) => solution.id)
      .filter((id): id is number => typeof id === "number"),
  );

  const stopIdsToRemove = stopState.allIds.filter((clientId) => {
    const stop = stopState.byClientId[clientId];
    if (!stop) return false;
    if (!orderIds.includes(stop.order_id ?? -1)) return false;
    if (typeof stop.route_solution_id !== "number") return false;
    return sourceSolutionIds.has(stop.route_solution_id);
  });

  const sourceLoadingThresholdBySolutionId = stopIdsToRemove.reduce<
    Record<number, number>
  >((acc, clientId) => {
    const stop = stopState.byClientId[clientId];
    if (
      !stop ||
      typeof stop.route_solution_id !== "number" ||
      typeof stop.stop_order !== "number"
    ) {
      return acc;
    }

    const currentThreshold = acc[stop.route_solution_id];
    if (
      typeof currentThreshold !== "number" ||
      stop.stop_order < currentThreshold
    ) {
      acc[stop.route_solution_id] = stop.stop_order;
    }

    return acc;
  }, {});

  stopIdsToRemove.forEach((clientId) => removeRouteSolutionStop(clientId));

  const sourceStopStateAfterRemoval = useRouteSolutionStopStore.getState();
  sourceStopStateAfterRemoval.allIds.forEach((clientId) => {
    const stop = sourceStopStateAfterRemoval.byClientId[clientId];
    if (
      !stop ||
      typeof stop.route_solution_id !== "number" ||
      typeof stop.stop_order !== "number"
    ) {
      return;
    }

    const threshold =
      sourceLoadingThresholdBySolutionId[stop.route_solution_id];
    if (typeof threshold !== "number") {
      return;
    }

    if (stop.stop_order > threshold) {
      sourceStopStateAfterRemoval.update(clientId, (existing) => ({
        ...existing,
        eta_status: "estimated",
        expected_arrival_time: "loading",
      }));
    }
  });

  const targetSolutions = selectRouteSolutionsByRouteGroupId(
    targetRouteGroupId,
  )(useRouteSolutionStore.getState());
  targetSolutions.forEach((solution) => {
    if (!solution.id) return;
    orderIds.forEach((orderId) => {
      upsertRouteSolutionStop({
        client_id: `optimistic-${solution.id}-${orderId}`,
        route_solution_id: solution.id,
        order_id: orderId,
        stop_order: null,
        eta_status: "estimated",
        expected_arrival_time: null,
      });
    });
  });

  syncRouteGroupSummaries([sourceRouteGroupId, targetRouteGroupId]);
};

export const moveOrderToRouteGroupAction = async (params: {
  planId: number;
  orderIds: number[];
  sourceRouteGroupId: number;
  targetRouteGroupId: number;
  onDrift?: () => void;
}): Promise<{ success: boolean }> => {
  let success = false;

  await optimisticTransaction({
    snapshot: takeSnapshot,
    mutate: () =>
      applyOptimisticMutation(
        params.orderIds,
        params.sourceRouteGroupId,
        params.targetRouteGroupId,
      ),
    request: () =>
      routeGroupApi.moveOrderToRouteGroup(params.planId, {
        selection: {
          manual_order_ids: params.orderIds,
          select_all_snapshots: [],
          excluded_order_ids: [],
          source: "group",
        },
        route_group_id: params.targetRouteGroupId,
        prevent_event_bus: false,
      }),
    commit: (response) => {
      applyResponse(response.data, params.onDrift ?? (() => {}), [
        params.sourceRouteGroupId,
        params.targetRouteGroupId,
      ]);
      success = true;
    },
    rollback: (snapshot) => {
      restoreSnapshot(snapshot as ReturnType<typeof takeSnapshot>);
    },
    onError: (error) => {
      console.error("Failed to move order to route group", error);
    },
  });

  return { success };
};
