import { useCallback } from "react";

import { ApiError } from "@/lib/api/ApiClient";
import { useMessageHandler } from "@shared-message-handler";
import { optimisticTransaction } from "@shared-optimistic";
import {
  selectRouteSolutionStopsByOrderId,
  upsertRouteSolutionStops,
  useRouteSolutionStopStore,
} from "@/features/plan/routeGroup/store/routeSolutionStop.store";
import { upsertRouteSolution } from "@/features/plan/routeGroup/store/routeSolution.store";

import {
  useUnassignOrderPlan as useUnassignOrderPlanApi,
  useUpdateOrderDeliveryPlan as useUpdateOrderDeliveryPlanApi,
} from "../api/orderApi";
import {
  filterOrderStopsByOrder,
  normalizeOrderStopResponse,
} from "../domain/orderStopResponse";
import {
  claimOrderMutation,
  isOrderMutationSuperseded,
  releaseOrderMutation,
} from "../store/orderMutationSequence.store";
import type { RouteSolutionStop } from "@/features/plan/routeGroup/types/routeSolutionStop";
import {
  setOrder,
  selectOrderByClientId,
  selectOrderByServerId,
  useOrderStore,
} from "../store/order.store";
import {
  patchRoutePlanTotals,
  selectRoutePlanByServerId,
  useRoutePlanStore,
} from "@/features/plan/store/routePlan.slice";
import { syncRouteGroupSummaries } from "@/features/plan/routeGroup/flows/syncRouteGroupSummaries.flow";
import { markRouteGroupOverviewFreshAfter } from "@/features/plan/routeGroup/store/routeGroupOverviewFreshness.store";
import { resolvePlanType } from "@/features/plan/domain/planType";
import {
  removeRouteSolutionStopsByOrderIds,
  restoreCollectedRouteSolutionStops,
} from "@/features/plan/routeGroup/actions/optimisticRouteSolutionStopRemoval.action";
import {
  applyOptimisticOrderPlanAssignment,
  collectOptimisticOrderPlanAssignmentEntries,
  restoreOptimisticOrderPlanAssignment,
} from "../utils/orderPlanAssignmentOptimistic";
import { syncOrdersIntoVisibleList } from "../actions/syncOrdersIntoVisibleList.action";
import { runWithPlanOrderMutation } from "@/features/plan/flows/runWithPlanOrderMutation.flow";

export const useOrderMutations = () => {
  const updateOrderDeliveryPlanApi = useUpdateOrderDeliveryPlanApi();
  const unassignOrderPlanApi = useUnassignOrderPlanApi();
  const { showMessage } = useMessageHandler();

  const updateOrderDeliveryPlan = useCallback(
    async (orderId: number | string, planId: number | string | null) => {
      const order =
        typeof orderId === "string"
          ? selectOrderByClientId(orderId)(useOrderStore.getState())
          : selectOrderByServerId(orderId)(useOrderStore.getState());

      if (!order) {
        showMessage({
          status: 404,
          message: "Order not found for plan update.",
        });
        return false;
      }

      if (!order.id) {
        showMessage({
          status: 400,
          message: "Order must be synced before plan update.",
        });
        return false;
      }
      const orderServerId = order.id;

      const targetPlanId =
        planId == null
          ? null
          : typeof planId === "number"
            ? planId
            : Number(planId);
      if (targetPlanId != null && Number.isNaN(targetPlanId)) {
        showMessage({ status: 400, message: "Invalid delivery plan id." });
        return false;
      }
      // An order adopts its plan's type on assignment — the backend sets
      // `order_plan_objective` from `plan.plan_type` — so the optimistic value
      // reads the destination plan rather than assuming route operations.
      const targetPlanObjective =
        targetPlanId == null
          ? null
          : resolvePlanType(
              selectRoutePlanByServerId(targetPlanId)(
                useRoutePlanStore.getState(),
              ),
            );

      // Capture plan total snapshots before the optimistic transaction so both
      // snapshot() and mutate() share the same pre-mutation baseline.
      type PlanTotalsSnapshot = {
        total_weight: number | null;
        total_volume: number | null;
        total_items: number | null;
        item_type_counts: Record<string, number> | null;
        total_orders: number | null;
      };

      const subtractItemTypeCounts = (
        source: Record<string, number> | null | undefined,
        subtractBy: Record<string, number> | null | undefined,
      ): Record<string, number> | null => {
        const next: Record<string, number> = { ...(source ?? {}) };
        Object.entries(subtractBy ?? {}).forEach(([itemType, count]) => {
          const safeCount = Number.isFinite(count) ? count : 0;
          if (safeCount <= 0) return;
          const updated = (next[itemType] ?? 0) - safeCount;
          if (updated > 0) {
            next[itemType] = updated;
            return;
          }
          delete next[itemType];
        });
        return Object.keys(next).length > 0 ? next : null;
      };

      const addItemTypeCounts = (
        source: Record<string, number> | null | undefined,
        addBy: Record<string, number> | null | undefined,
      ): Record<string, number> | null => {
        const next: Record<string, number> = { ...(source ?? {}) };
        Object.entries(addBy ?? {}).forEach(([itemType, count]) => {
          const safeCount = Number.isFinite(count) ? count : 0;
          if (safeCount <= 0) return;
          next[itemType] = (next[itemType] ?? 0) + safeCount;
        });
        return Object.keys(next).length > 0 ? next : null;
      };
      const planStoreState = useRoutePlanStore.getState();
      const oldPlanId = order.delivery_plan_id ?? null;
      const oldPlan =
        oldPlanId != null
          ? selectRoutePlanByServerId(oldPlanId)(planStoreState)
          : null;
      const newPlan =
        targetPlanId != null
          ? selectRoutePlanByServerId(targetPlanId)(planStoreState)
          : null;

      const oldPlanTotalSnapshot: PlanTotalsSnapshot | null =
        oldPlan?.id != null
          ? {
              total_weight: oldPlan.total_weight ?? null,
              total_volume: oldPlan.total_volume ?? null,
              total_items: oldPlan.total_items ?? null,
              item_type_counts: oldPlan.item_type_counts ?? null,
              total_orders: oldPlan.total_orders ?? null,
            }
          : null;

      const newPlanTotalSnapshot: PlanTotalsSnapshot | null =
        newPlan?.id != null
          ? {
              total_weight: newPlan.total_weight ?? null,
              total_volume: newPlan.total_volume ?? null,
              total_items: newPlan.total_items ?? null,
              item_type_counts: newPlan.item_type_counts ?? null,
              total_orders: newPlan.total_orders ?? null,
            }
          : null;

      const assignmentEntries = collectOptimisticOrderPlanAssignmentEntries([
        orderServerId,
      ]);
      // Claimed before the request goes out so a move started while this one is
      // still in flight supersedes it, and this response cannot undo it.
      const mutationClaim = claimOrderMutation([orderServerId]);

      // Both ends of the move show progress on their cards until the server
      // settles — local delivery re-optimizes its routes, so the gap between the
      // optimistic patch and the response is visible.
      return runWithPlanOrderMutation([oldPlanId, targetPlanId], () =>
      optimisticTransaction({
        snapshot: () => ({
          assignmentEntries,
          previousStops: selectRouteSolutionStopsByOrderId(orderServerId)(
            useRouteSolutionStopStore.getState(),
          ),
          oldPlanId: oldPlan?.id ?? null,
          oldPlanTotals: oldPlanTotalSnapshot,
          newPlanId: targetPlanId,
          newPlanTotals: newPlanTotalSnapshot,
        }),
        mutate: () => {
          applyOptimisticOrderPlanAssignment(assignmentEntries, {
            targetPlanId,
            planType: targetPlanObjective,
            clearRouteGroup: true,
          });
          // Leaving a plan can make the order match the list's active query
          // (unscheduled being the default), and the list can only filter ids it
          // already holds — so it has to be added back explicitly.
          syncOrdersIntoVisibleList(
            assignmentEntries.map((entry) => entry.clientId),
          );
          removeRouteSolutionStopsByOrderIds([orderServerId]);

          // Optimistic: subtract this order's weight/volume/items from the old plan
          if (oldPlan?.id != null && oldPlanTotalSnapshot != null) {
            patchRoutePlanTotals(oldPlan.id, {
              total_weight: Math.max(
                0,
                (oldPlanTotalSnapshot.total_weight ?? 0) -
                  (order.total_weight ?? 0),
              ),
              total_volume: Math.max(
                0,
                (oldPlanTotalSnapshot.total_volume ?? 0) -
                  (order.total_volume ?? 0),
              ),
              total_items: Math.max(
                0,
                (oldPlanTotalSnapshot.total_items ?? 0) -
                  (order.total_items ?? 0),
              ),
              item_type_counts: subtractItemTypeCounts(
                oldPlanTotalSnapshot.item_type_counts,
                order.item_type_counts,
              ),
              total_orders: Math.max(
                0,
                (oldPlanTotalSnapshot.total_orders ?? 1) - 1,
              ),
            });
          }

          // Optimistic: add this order's weight/volume/items to the new plan
          if (newPlan?.id != null) {
            patchRoutePlanTotals(newPlan.id, {
              total_weight:
                (newPlanTotalSnapshot?.total_weight ?? 0) +
                (order.total_weight ?? 0),
              total_volume:
                (newPlanTotalSnapshot?.total_volume ?? 0) +
                (order.total_volume ?? 0),
              total_items:
                (newPlanTotalSnapshot?.total_items ?? 0) +
                (order.total_items ?? 0),
              item_type_counts: addItemTypeCounts(
                newPlanTotalSnapshot?.item_type_counts,
                order.item_type_counts,
              ),
              total_orders: (newPlanTotalSnapshot?.total_orders ?? 0) + 1,
            });
          }
        },
        // Unscheduling has its own endpoint: the destination-based route expects
        // a plan to move to, so detaching goes through unassign-plan instead.
        request: () =>
          targetPlanId == null
            ? unassignOrderPlanApi(orderServerId)
            : updateOrderDeliveryPlanApi(orderServerId, targetPlanId),
        commit: (response) => {
          const updatedBundles = Array.isArray(response.data?.updated)
            ? response.data.updated
            : [];
          const affectedRouteGroupIds = new Set<number>();

          if (typeof order.route_group_id === "number") {
            affectedRouteGroupIds.add(order.route_group_id);
          }

          updatedBundles.forEach((bundle) => {
            const updatedOrder = bundle?.order;
            if (!updatedOrder?.id) return;
            // A newer move already owns this order; its own response settles it.
            if (isOrderMutationSuperseded(updatedOrder.id, mutationClaim)) {
              return;
            }

            if (typeof updatedOrder.route_group_id === "number") {
              affectedRouteGroupIds.add(updatedOrder.route_group_id);
            }
            setOrder(updatedOrder);
            removeRouteSolutionStopsByOrderIds([updatedOrder.id]);

            // The response resequences whole routes, so it can carry stops for
            // orders a later move has already pulled off them.
            const normalizedStops = filterOrderStopsByOrder(
              normalizeOrderStopResponse(bundle.order_stops),
              (orderId) => !isOrderMutationSuperseded(orderId, mutationClaim),
            );
            if (normalizedStops) {
              upsertRouteSolutionStops(normalizedStops);
            }
            const changedSolutions = Array.isArray(bundle.route_solution)
              ? bundle.route_solution
              : [];
            changedSolutions.forEach((solution) => {
              if (solution?.client_id) {
                upsertRouteSolution(solution);
              }
            });
          });

          syncRouteGroupSummaries(Array.from(affectedRouteGroupIds));
          markRouteGroupOverviewFreshAfter([oldPlanId, targetPlanId]);

          // Server-authoritative plan totals override the optimistic deltas
          const planTotals = Array.isArray(response.data?.plan_totals)
            ? response.data.plan_totals
            : [];
          planTotals.forEach((p) => {
            patchRoutePlanTotals(p.id, {
              total_weight: p.total_weight,
              total_volume: p.total_volume,
              total_items: p.total_items,
              item_type_counts: p.item_type_counts,
              total_orders: p.total_orders,
            });
          });
        },
        rollback: (snapshot) => {
          const {
            assignmentEntries: snapshotAssignmentEntries,
            previousStops,
            oldPlanId: snapOldPlanId,
            oldPlanTotals: snapOldTotals,
            newPlanId: snapNewPlanId,
            newPlanTotals: snapNewTotals,
          } = snapshot as {
            assignmentEntries: ReturnType<
              typeof collectOptimisticOrderPlanAssignmentEntries
            >;
            previousStops: RouteSolutionStop[];
            oldPlanId: number | null;
            oldPlanTotals: PlanTotalsSnapshot | null;
            newPlanId: number | null;
            newPlanTotals: PlanTotalsSnapshot | null;
          };
          // Undoing this move must not undo a newer one layered on top of it.
          restoreOptimisticOrderPlanAssignment(
            (snapshotAssignmentEntries ?? []).filter(
              (entry) =>
                !isOrderMutationSuperseded(entry.serverId, mutationClaim),
            ),
          );
          const restorableStops = previousStops.filter(
            (stop) => !isOrderMutationSuperseded(stop.order_id, mutationClaim),
          );
          if (restorableStops.length) {
            restoreCollectedRouteSolutionStops(restorableStops);
          }

          // Restore plan total snapshots
          if (snapOldPlanId != null && snapOldTotals != null) {
            patchRoutePlanTotals(snapOldPlanId, snapOldTotals);
          }
          if (snapNewPlanId != null && snapNewTotals != null) {
            patchRoutePlanTotals(snapNewPlanId, snapNewTotals);
          }
        },
        onError: (error) => {
          console.error("Failed to update order delivery plan", { error });
          const message =
            error instanceof ApiError
              ? error.message
              : "Unable to update order plan.";
          const status = error instanceof ApiError ? error.status : 500;
          showMessage({ status, message });
        },
      }),
      ).finally(() => releaseOrderMutation([orderServerId]));
    },
    [showMessage, unassignOrderPlanApi, updateOrderDeliveryPlanApi],
  );

  return {
    updateOrderDeliveryPlan,
  };
};
