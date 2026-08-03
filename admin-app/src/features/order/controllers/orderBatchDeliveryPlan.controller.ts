import { useCallback } from "react";
import { unstable_batchedUpdates } from "react-dom";

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
import {
  filterOrderStopsByOrder,
  normalizeOrderStopResponse,
} from "../domain/orderStopResponse";
import {
  claimOrderMutation,
  isOrderMutationSuperseded,
  releaseOrderMutation,
} from "../store/orderMutationSequence.store";
import { getQueryFilters, getQuerySearch } from "../store/orderQuery.store";
import { useOrderSelectionStore } from "../store/orderSelection.store";
import { setOrder } from "../store/order.store";
import type { OrderBatchSelectionPayload } from "../types/orderBatchSelection";
import { syncRouteGroupSummaries } from "@/features/plan/routeGroup/flows/syncRouteGroupSummaries.flow";
import { selectOrderByServerId, useOrderStore } from "../store/order.store";
import { markRouteGroupOverviewFreshAfter } from "@/features/plan/routeGroup/store/routeGroupOverviewFreshness.store";
import { applyOrderBatchMoveStateSync } from "@/features/order/actions/applyOrderBatchMoveStateSync.action";
import { syncOrdersIntoVisibleList } from "@/features/order/actions/syncOrdersIntoVisibleList.action";
import { runWithPlanOrderMutation } from "@/features/plan/flows/runWithPlanOrderMutation.flow";
import { resolvePlanType } from "@/features/plan/domain/planType";
import {
  selectRoutePlanByServerId,
  useRoutePlanStore,
} from "@/features/plan/store/routePlan.slice";
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
  planId: number | null;
  planType: string | null;
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

          return (
            selectRouteSolutionByServerId(routeSolutionId)(
              useRouteSolutionStore.getState(),
            )?.route_group_id ?? null
          );
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
      const normalizedPlanId =
        typeof planId === "number" && Number.isFinite(planId) ? planId : null;
      // Callers pass the destination plan's own type; the fallback only covers
      // a caller that has not been given one yet.
      const normalizedPlanType =
        normalizedPlanId == null
          ? null
          : (planType ??
            resolvePlanType(
              selectRoutePlanByServerId(normalizedPlanId)(
                useRoutePlanStore.getState(),
              ),
            ));
      const state = useOrderSelectionStore.getState();
      const optimisticTargetIds = resolveBatchTargetOrderIds(selection, state);
      if (DEV) {
        console.debug("[plan-order-move] request:start", {
          planId: normalizedPlanId,
          planType: normalizedPlanType,
          optimisticTargetIds,
          showIncomingRouteGroupPlaceholders,
          routeSolutionStopCountBefore:
            useRouteSolutionStopStore.getState().allIds.length,
        });
      }
      const placeholderToken =
        showIncomingRouteGroupPlaceholders && normalizedPlanId != null
          ? registerIncomingRouteGroupOrderPlaceholders(
              normalizedPlanId,
              optimisticTargetIds.length,
            )
          : null;
      const assignmentEntries =
        collectOptimisticOrderPlanAssignmentEntries(optimisticTargetIds);
      // Claimed before the request goes out so a move started while this one is
      // still in flight supersedes it, and this response cannot undo it.
      const mutationClaim = claimOrderMutation(optimisticTargetIds);
      // Every plan the batch touches shows progress on its card: the
      // destination, plus each plan the moved orders are leaving.
      return runWithPlanOrderMutation(
        [
          normalizedPlanId,
          ...assignmentEntries.map((entry) => entry.previousDeliveryPlanId),
        ],
        () =>
      optimisticTransaction({
        snapshot: () => ({
          assignmentEntries,
          removedStops:
            collectRouteSolutionStopsByOrderIds(optimisticTargetIds),
        }),
        mutate: () => {
          if (DEV) {
            console.debug("[plan-order-move] optimistic:start", {
              planId: normalizedPlanId,
              optimisticTargetIds,
              assignmentEntryCount: assignmentEntries.length,
              routeSolutionStopCountBefore:
                useRouteSolutionStopStore.getState().allIds.length,
            });
          }
          applyOptimisticOrderPlanAssignment(assignmentEntries, {
            targetPlanId: normalizedPlanId,
            planType: normalizedPlanType,
            clearRouteGroup: true,
          });
          // Leaving a plan can make these orders match the list's active query
          // (unscheduled being the default), and the list can only filter ids it
          // already holds — so they have to be added back explicitly.
          syncOrdersIntoVisibleList(
            assignmentEntries.map((entry) => entry.clientId),
          );
          useOrderSelectionStore.getState().disableSelectionMode();
          removeRouteSolutionStopsByOrderIds(optimisticTargetIds);
          syncRouteGroupSummaries(
            collectAffectedRouteGroupIdsFromAssignments(assignmentEntries),
          );
          if (DEV) {
            console.debug("[plan-order-move] optimistic:end", {
              planId: normalizedPlanId,
              optimisticTargetIds,
              routeSolutionStopCountAfter:
                useRouteSolutionStopStore.getState().allIds.length,
            });
          }
        },
        request: async () => {
          const response = await updateOrdersDeliveryPlanBatchApi(
            normalizedPlanId,
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
            // A newer move already owns this order; its own response settles it.
            if (isOrderMutationSuperseded(updatedOrder.id, mutationClaim)) {
              return;
            }

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

            // The response resequences whole routes, so it can carry stops for
            // orders a later move has already pulled off them.
            const normalizedStops = filterOrderStopsByOrder(
              normalizeOrderStopResponse(bundle.order_stops),
              (orderId) => !isOrderMutationSuperseded(orderId, mutationClaim),
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

            const destinationRouteGroupId =
              resolveBundleDestinationRouteGroupId({
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
              planId: normalizedPlanId,
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
          markRouteGroupOverviewFreshAfter(
            normalizedPlanId == null ? [] : [normalizedPlanId],
          );

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
          if (normalizedPlanId != null) {
            clearIncomingRouteGroupOrderPlaceholders(
              normalizedPlanId,
              placeholderToken,
            );
          }
          destinationRouteGroupIdsToPulse.forEach((routeGroupId) => {
            triggerIncomingRouteGroupPulse(routeGroupId);
          });
          if (DEV) {
            console.debug("[plan-order-move] commit:end", {
              planId: normalizedPlanId,
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
          unstable_batchedUpdates(() => {
            if (normalizedPlanId != null) {
              clearIncomingRouteGroupOrderPlaceholders(
                normalizedPlanId,
                placeholderToken,
              );
            }
            const typedSnapshot = snapshot as {
              assignmentEntries: ReturnType<
                typeof collectOptimisticOrderPlanAssignmentEntries
              >;
              removedStops: ReturnType<
                typeof collectRouteSolutionStopsByOrderIds
              >;
            };

            // Undoing this move must not undo a newer one layered on top of it.
            const restorableEntries = (
              typedSnapshot.assignmentEntries ?? []
            ).filter(
              (entry) =>
                !isOrderMutationSuperseded(entry.serverId, mutationClaim),
            );

            restoreOptimisticOrderPlanAssignment(restorableEntries);
            restoreCollectedRouteSolutionStops(
              (typedSnapshot.removedStops ?? []).filter(
                (stop) =>
                  !isOrderMutationSuperseded(stop.order_id, mutationClaim),
              ),
            );
            syncRouteGroupSummaries(
              collectAffectedRouteGroupIdsFromAssignments(restorableEntries),
            );
          });
          if (DEV) {
            console.warn("[plan-order-move] rollback", {
              planId: normalizedPlanId,
              placeholderToken,
              routeSolutionStopCount:
                useRouteSolutionStopStore.getState().allIds.length,
            });
          }
        },
        onError: (error) => {
          unstable_batchedUpdates(() => {
            if (normalizedPlanId != null) {
              clearIncomingRouteGroupOrderPlaceholders(
                normalizedPlanId,
                placeholderToken,
              );
            }
          });
          if (DEV) {
            console.error("[plan-order-move] error", {
              planId: normalizedPlanId,
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
      }),
      ).finally(() => releaseOrderMutation(optimisticTargetIds));
    },
    [loadOrders, showMessage, updateOrdersDeliveryPlanBatchApi],
  );

  return {
    updateOrdersDeliveryPlanBatch,
  };
};
