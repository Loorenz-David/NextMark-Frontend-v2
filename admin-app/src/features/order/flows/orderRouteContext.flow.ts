import { useCallback } from "react";

import { ApiError } from "@/lib/api/ApiClient";
import { useMessageHandler } from "@shared-message-handler";

import { getOrderRouteContext } from "@/features/order/api/orderApi";
import type { RouteSolution } from "@/features/plan/routeGroup/types/routeSolution";
import type { RouteSolutionStop } from "@/features/plan/routeGroup/types/routeSolutionStop";
import { upsertRouteSolution } from "@/features/plan/routeGroup/store/routeSolution.store";
import { upsertRouteSolutionStop } from "@/features/plan/routeGroup/store/routeSolutionStop.store";

type OrderRouteContextResponse = {
  order_id: number;
  route_solution?: RouteSolution | null;
  route_solution_stop?: RouteSolutionStop | null;
  route_plan_id?: number | null;
  route_group_id?: number | null;
};

export const applyOrderRouteContextPayload = (
  payload?: OrderRouteContextResponse | null,
) => {
  if (payload?.route_solution?.client_id) {
    upsertRouteSolution(payload.route_solution);
  }

  if (payload?.route_solution_stop?.client_id) {
    upsertRouteSolutionStop(payload.route_solution_stop);
  }
};

export function useOrderRouteContextFlow() {
  const { showMessage } = useMessageHandler();

  const fetchOrderRouteContext = useCallback(
    async (orderId: number) => {
      try {
        const response = await getOrderRouteContext(orderId);
        applyOrderRouteContextPayload(response.data);
        return response.data;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }

        const message =
          error instanceof ApiError
            ? error.message
            : "Unable to load order route context.";
        const status = error instanceof ApiError ? error.status : 500;
        console.error("Failed to fetch order route context", error);
        showMessage({ status, message });
        return null;
      }
    },
    [showMessage],
  );

  return {
    fetchOrderRouteContext,
  };
}
