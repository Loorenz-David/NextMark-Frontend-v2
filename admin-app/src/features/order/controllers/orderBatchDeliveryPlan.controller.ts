import { useCallback } from "react";

import { ApiError } from "@/lib/api/ApiClient";
import { useMessageHandler } from "@shared-message-handler";
import { optimisticTransaction } from "@shared-optimistic";

import {
  removeRouteSolutionStopsByOrderId,
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
import {
  createOrderOptimisticSnapshot,
  restoreOrderOptimisticSnapshot,
} from "../utils/orderOptimisticSnapshot";
import type { OrderBatchSelectionPayload } from "../types/orderBatchSelection";
import { useOrderPlanPatchController } from "./orderPlanPatch.controller";
import { syncRouteGroupSummaries } from "@/features/plan/routeGroup/flows/syncRouteGroupSummaries.flow";
import { selectOrderByServerId, useOrderStore } from "../store/order.store";
import { markRouteGroupOverviewFreshAfter } from "@/features/plan/routeGroup/store/routeGroupOverviewFreshness.store";
import { applyOrderBatchMoveStateSync } from "@/features/order/actions/applyOrderBatchMoveStateSync.action";

type UpdateOrdersDeliveryPlanBatchParams = {
  planId: number;
  planType: string;
  selection: OrderBatchSelectionPayload;
};

export const useOrderBatchDeliveryPlanController = () => {
  const updateOrdersDeliveryPlanBatchApi = useUpdateOrdersDeliveryPlanBatch();
  const { loadOrders } = useOrderFlow();
  const { patchOrdersPlanByServerIds } = useOrderPlanPatchController();
  const { showMessage } = useMessageHandler();

  const updateOrdersDeliveryPlanBatch = useCallback(
    async ({
      planId,
      planType,
      selection,
    }: UpdateOrdersDeliveryPlanBatchParams) => {
      const state = useOrderSelectionStore.getState();
      const optimisticTargetIds = resolveBatchTargetOrderIds(selection, state);
      return optimisticTransaction({
        snapshot: createOrderOptimisticSnapshot,
        mutate: () => {
          patchOrdersPlanByServerIds({
            orderServerIds: optimisticTargetIds,
            planId,
            planType,
          });
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
          });

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
        },
        rollback: restoreOrderOptimisticSnapshot,
        onError: (error) => {
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
      patchOrdersPlanByServerIds,
      showMessage,
      updateOrdersDeliveryPlanBatchApi,
    ],
  );

  return {
    updateOrdersDeliveryPlanBatch,
  };
};
