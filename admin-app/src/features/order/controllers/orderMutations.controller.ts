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

import { useUpdateOrderDeliveryPlan as useUpdateOrderDeliveryPlanApi } from "../api/orderApi";
import { normalizeOrderStopResponse } from "../domain/orderStopResponse";
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
import {
  removeRouteSolutionStopsByOrderIds,
  restoreCollectedRouteSolutionStops,
} from "@/features/plan/routeGroup/actions/optimisticRouteSolutionStopRemoval.action";
import {
  applyOptimisticOrderPlanAssignment,
  collectOptimisticOrderPlanAssignmentEntries,
  restoreOptimisticOrderPlanAssignment,
} from "../utils/orderPlanAssignmentOptimistic";

export const useOrderMutations = () => {
  const updateOrderDeliveryPlanApi = useUpdateOrderDeliveryPlanApi();
  const { showMessage } = useMessageHandler();

  const updateOrderDeliveryPlan = useCallback(
    async (orderId: number | string, planId: number | string | null) => {
      if (planId == null) {
        showMessage({ status: 400, message: "Missing delivery plan id." });
        return null;
      }

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

      const parsedPlanId = typeof planId === "number" ? planId : Number(planId);
      if (Number.isNaN(parsedPlanId)) {
        showMessage({ status: 400, message: "Invalid delivery plan id." });
        return false;
      }

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
      const newPlan = selectRoutePlanByServerId(parsedPlanId)(planStoreState);

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

      return optimisticTransaction({
        snapshot: () => ({
          assignmentEntries,
          previousStops: selectRouteSolutionStopsByOrderId(orderServerId)(
            useRouteSolutionStopStore.getState(),
          ),
          oldPlanId: oldPlan?.id ?? null,
          oldPlanTotals: oldPlanTotalSnapshot,
          newPlanId: parsedPlanId,
          newPlanTotals: newPlanTotalSnapshot,
        }),
        mutate: () => {
          applyOptimisticOrderPlanAssignment(assignmentEntries, {
            targetPlanId: parsedPlanId,
            planType: "local_delivery",
            clearRouteGroup: true,
          });
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
        request: () => updateOrderDeliveryPlanApi(orderServerId, parsedPlanId),
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

            if (typeof updatedOrder.route_group_id === "number") {
              affectedRouteGroupIds.add(updatedOrder.route_group_id);
            }
            setOrder(updatedOrder);
            removeRouteSolutionStopsByOrderIds([updatedOrder.id]);

            const normalizedStops = normalizeOrderStopResponse(
              bundle.order_stops,
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
          markRouteGroupOverviewFreshAfter([oldPlanId, parsedPlanId]);

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
            newPlanId: number;
            newPlanTotals: PlanTotalsSnapshot | null;
          };
          restoreOptimisticOrderPlanAssignment(snapshotAssignmentEntries ?? []);
          if (previousStops.length) {
            restoreCollectedRouteSolutionStops(previousStops);
          }

          // Restore plan total snapshots
          if (snapOldPlanId != null && snapOldTotals != null) {
            patchRoutePlanTotals(snapOldPlanId, snapOldTotals);
          }
          if (snapNewTotals != null) {
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
      });
    },
    [showMessage, updateOrderDeliveryPlanApi],
  );

  return {
    updateOrderDeliveryPlan,
  };
};
