import { useCallback } from "react";

import { ApiError } from "@/lib/api/ApiClient";
import { useMessageHandler } from "@shared-message-handler";
import { optimisticTransaction } from "@shared-optimistic";

import {
  removeRouteSolutionStopsByOrderId,
  useRouteSolutionStopStore,
  upsertRouteSolutionStops,
} from "@/features/plan/routeGroup/store/routeSolutionStop.store";
import { upsertRouteSolution } from "@/features/plan/routeGroup/store/routeSolution.store";

import { useUpdateOrdersDeliveryPlanBatch } from "../api/orderApi";
import { useOrderFlow } from "../flows/order.flow";
import { resolveBatchTargetOrderIds } from "../domain/orderBatchTargetIds";
import { normalizeOrderStopResponse } from "../domain/orderStopResponse";
import { getQueryFilters, getQuerySearch } from "../store/orderQuery.store";
import { useOrderSelectionStore } from "../store/orderSelection.store";
import { setOrder } from "../store/order.store";
import type { OrderBatchSelectionPayload } from "../types/orderBatchSelection";
import { syncRouteGroupSummaries } from "@/features/plan/routeGroup/flows/syncRouteGroupSummaries.flow";
import { selectOrderByServerId, useOrderStore } from "../store/order.store";
import { markRouteGroupOverviewFreshAfter } from "@/features/plan/routeGroup/store/routeGroupOverviewFreshness.store";
import { applyOrderBatchMoveStateSync } from "@/features/order/actions/applyOrderBatchMoveStateSync.action";
import {
  clearIncomingRouteGroupOrderPlaceholders,
  registerIncomingRouteGroupOrderPlaceholders,
} from "@/features/plan/routeGroup/store/routeGroupIncomingOrderPlaceholder.store";
import {
  selectRouteGroupByServerId,
  useRouteGroupStore,
} from "@/features/plan/routeGroup/store/routeGroup.slice";
import {
  selectRouteSolutionByServerId,
  useRouteSolutionStore,
} from "@/features/plan/routeGroup/store/routeSolution.store";
import { triggerIncomingRouteGroupPulse } from "@/features/plan/routeGroup/store/routeGroupIncomingPulse.store";
import {
  collectRouteSolutionStopsByOrderIds,
  removeRouteSolutionStopsByOrderIds,
  restoreCollectedRouteSolutionStops,
} from "@/features/plan/routeGroup/actions/optimisticRouteSolutionStopRemoval.action";
import {
  applyOptimisticOrderPlanAssignment,
  collectAffectedRouteGroupIdsFromAssignments,
  collectOptimisticOrderPlanAssignmentEntries,
  restoreOptimisticOrderPlanAssignment,
} from "../utils/orderPlanAssignmentOptimistic";

const DEV = import.meta.env.DEV;

type UpdateOrdersDeliveryPlanBatchParams = {
  planId: number;
  planType: string;
  selection: OrderBatchSelectionPayload;
  showIncomingRouteGroupPlaceholders?: boolean;
};

const resolveBundleDestinationRouteGroupId = (bundle: {
  order?: { route_group_id?: number | null } | null;
  route_solution?: Array<{
    id?: number | null;
    route_group_id?: number | null;
  }> | null;
  order_stops?:
    | Record<string, { route_solution_id?: number | null }>
    | Array<{ route_solution_id?: number | null }>
    | null;
}) => {
  const orderRouteGroupId = bundle.order?.route_group_id;
  if (typeof orderRouteGroupId === "number") {
    return orderRouteGroupId;
  }

  const changedSolutions = Array.isArray(bundle.route_solution)
    ? bundle.route_solution
    : [];
  const changedSolutionRouteGroupIds = Array.from(
    new Set(
      changedSolutions
        .map((solution) => solution?.route_group_id)
        .filter(
          (routeGroupId): routeGroupId is number =>
            typeof routeGroupId === "number" && Number.isFinite(routeGroupId),
        ),
    ),
  );
  if (changedSolutionRouteGroupIds.length === 1) {
    return changedSolutionRouteGroupIds[0];
  }

  const stopValues = Array.isArray(bundle.order_stops)
    ? bundle.order_stops
    : Object.values(bundle.order_stops ?? {});
  const changedSolutionById = new Map(
    changedSolutions
      .filter(
        (
          solution,
        ): solution is { id: number; route_group_id?: number | null } =>
          typeof solution?.id === "number",
      )
      .map((solution) => [solution.id, solution]),
  );
  const routeGroupIdsFromStops = Array.from(
    new Set(
      stopValues
        .map((stop) => {
          const routeSolutionId = stop?.route_solution_id;
          if (typeof routeSolutionId !== "number") {
            return null;
          }

          const changedSolution = changedSolutionById.get(routeSolutionId);
          if (typeof changedSolution?.route_group_id === "number") {
            return changedSolution.route_group_id;
          }

          return selectRouteSolutionByServerId(routeSolutionId)(
            useRouteSolutionStore.getState(),
          )?.route_group_id ?? null;
        })
        .filter(
          (routeGroupId): routeGroupId is number =>
            typeof routeGroupId === "number" && Number.isFinite(routeGroupId),
        ),
    ),
  );

  if (routeGroupIdsFromStops.length === 1) {
    return routeGroupIdsFromStops[0];
  }

  return null;
};

export const useOrderBatchDeliveryPlanController = () => {
  const updateOrdersDeliveryPlanBatchApi = useUpdateOrdersDeliveryPlanBatch();
  const { loadOrders } = useOrderFlow();
  const { showMessage } = useMessageHandler();

  const updateOrdersDeliveryPlanBatch = useCallback(
    async ({
      planId,
      planType,
      selection,
      showIncomingRouteGroupPlaceholders = false,
    }: UpdateOrdersDeliveryPlanBatchParams) => {
      const state = useOrderSelectionStore.getState();
      const optimisticTargetIds = resolveBatchTargetOrderIds(selection, state);
      if (DEV) {
        console.debug("[plan-order-move] request:start", {
          planId,
          planType,
          optimisticTargetIds,
          showIncomingRouteGroupPlaceholders,
          routeSolutionStopCountBefore:
            useRouteSolutionStopStore.getState().allIds.length,
        });
      }
      const placeholderToken = showIncomingRouteGroupPlaceholders
        ? registerIncomingRouteGroupOrderPlaceholders(
            planId,
            optimisticTargetIds.length,
          )
        : null;
      const assignmentEntries = collectOptimisticOrderPlanAssignmentEntries(
        optimisticTargetIds,
      );
      return optimisticTransaction({
        snapshot: () => ({
          assignmentEntries,
          removedStops: collectRouteSolutionStopsByOrderIds(optimisticTargetIds),
        }),
        mutate: () => {
          if (DEV) {
            console.debug("[plan-order-move] optimistic:start", {
              planId,
              optimisticTargetIds,
              assignmentEntryCount: assignmentEntries.length,
              routeSolutionStopCountBefore:
                useRouteSolutionStopStore.getState().allIds.length,
            });
          }
          applyOptimisticOrderPlanAssignment(assignmentEntries, {
            targetPlanId: planId,
            planType,
            clearRouteGroup: true,
          });
          useOrderSelectionStore.getState().disableSelectionMode();
          removeRouteSolutionStopsByOrderIds(optimisticTargetIds);
          syncRouteGroupSummaries(
            collectAffectedRouteGroupIdsFromAssignments(assignmentEntries),
          );
          if (DEV) {
            console.debug("[plan-order-move] optimistic:end", {
              planId,
              optimisticTargetIds,
              routeSolutionStopCountAfter:
                useRouteSolutionStopStore.getState().allIds.length,
            });
          }
        },
        request: async () => {
          const response = await updateOrdersDeliveryPlanBatchApi(
            planId,
            selection,
          );
          return response.data;
        },
        commit: (payload) => {
          const bundles = payload?.updated_bundles ?? [];
          const resolvedCount = payload?.resolved_count ?? 0;
          const updatedCount = payload?.updated_count ?? 0;
          const affectedRouteGroupIds = new Set<number>();
          const destinationRouteGroupIdsToPulse = new Set<number>();

          bundles.forEach((bundle) => {
            const updatedOrder = bundle?.order;
            if (!updatedOrder?.id) return;

            const previousOrder = selectOrderByServerId(updatedOrder.id)(
              useOrderStore.getState(),
            );
            if (typeof previousOrder?.route_group_id === "number") {
              affectedRouteGroupIds.add(previousOrder.route_group_id);
            }
            if (typeof updatedOrder.route_group_id === "number") {
              affectedRouteGroupIds.add(updatedOrder.route_group_id);
            }

            setOrder(updatedOrder);
            removeRouteSolutionStopsByOrderId(updatedOrder.id);

            const normalizedStops = normalizeOrderStopResponse(
              bundle.order_stops,
            );
            if (normalizedStops) {
              upsertRouteSolutionStops(normalizedStops);
            }

            const changedSolutions = bundle.route_solution ?? [];
            changedSolutions.forEach((solution) => {
              if (solution?.client_id) {
                upsertRouteSolution(solution);
              }
            });

            const destinationRouteGroupId = resolveBundleDestinationRouteGroupId({
              order: updatedOrder,
              route_solution: bundle.route_solution,
              order_stops: bundle.order_stops,
            });

            if (typeof destinationRouteGroupId === "number") {
              destinationRouteGroupIdsToPulse.add(destinationRouteGroupId);
            }
          });

          if (DEV) {
            console.debug("[plan-order-move] commit:before-sync", {
              planId,
              placeholderToken,
              bundleCount: bundles.length,
              resolvedCount,
              updatedCount,
              routeSolutionStopCount:
                useRouteSolutionStopStore.getState().allIds.length,
            });
          }

          const syncResult = applyOrderBatchMoveStateSync(payload);

          if (!syncResult.hasRouteGroupStateChanges) {
            syncRouteGroupSummaries(Array.from(affectedRouteGroupIds));
          }
          markRouteGroupOverviewFreshAfter([planId]);

          if (resolvedCount > 0 && updatedCount < resolvedCount) {
            showMessage({
              status: "warning",
              message:
                "Some orders were skipped because they changed during the operation.",
            });
          }

          const hasPotentialDrift =
            bundles.length === 0 || bundles.length < updatedCount;
          if (hasPotentialDrift) {
            void loadOrders(
              {
                q: getQuerySearch(),
                filters: getQueryFilters(),
              },
              false,
            );
          }

          useOrderSelectionStore.getState().disableSelectionMode();
          clearIncomingRouteGroupOrderPlaceholders(planId, placeholderToken);
          destinationRouteGroupIdsToPulse.forEach((routeGroupId) => {
            triggerIncomingRouteGroupPulse(routeGroupId);
          });
          if (DEV) {
            console.debug("[plan-order-move] commit:end", {
              planId,
              placeholderToken,
              hasPotentialDrift,
              hasRouteGroupStateChanges: syncResult.hasRouteGroupStateChanges,
              pulsedRouteGroupIds: Array.from(destinationRouteGroupIdsToPulse),
              routeSolutionStopCount:
                useRouteSolutionStopStore.getState().allIds.length,
            });
          }
        },
        rollback: (snapshot) => {
          clearIncomingRouteGroupOrderPlaceholders(planId, placeholderToken);
          const typedSnapshot = snapshot as {
            assignmentEntries: ReturnType<
              typeof collectOptimisticOrderPlanAssignmentEntries
            >;
            removedStops: ReturnType<typeof collectRouteSolutionStopsByOrderIds>;
          };

          restoreOptimisticOrderPlanAssignment(
            typedSnapshot.assignmentEntries ?? [],
          );
          restoreCollectedRouteSolutionStops(typedSnapshot.removedStops ?? []);
          syncRouteGroupSummaries(
            collectAffectedRouteGroupIdsFromAssignments(
              typedSnapshot.assignmentEntries ?? [],
            ),
          );
          if (DEV) {
            console.warn("[plan-order-move] rollback", {
              planId,
              placeholderToken,
              routeSolutionStopCount:
                useRouteSolutionStopStore.getState().allIds.length,
            });
          }
        },
        onError: (error) => {
          clearIncomingRouteGroupOrderPlaceholders(planId, placeholderToken);
          if (DEV) {
            console.error("[plan-order-move] error", {
              planId,
              placeholderToken,
              error,
            });
          }
          const message =
            error instanceof ApiError
              ? error.message
              : "Unable to move selected orders.";
          const status = error instanceof ApiError ? error.status : 500;
          showMessage({ status, message });
        },
      });
    },
    [
      loadOrders,
      showMessage,
      updateOrdersDeliveryPlanBatchApi,
    ],
  );

  return {
    updateOrdersDeliveryPlanBatch,
  };
};
