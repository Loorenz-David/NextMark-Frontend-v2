import { useCallback } from "react";

import { ApiError } from "@/lib/api/ApiClient";
import { useMessageHandler } from "@shared-message-handler";

import { moveOrderToRouteGroupAction } from "@/features/plan/routeGroup/actions/moveOrderToRouteGroup.action";
import { useOrderFlow } from "@/features/order/flows/order.flow";
import {
  getQueryFilters,
  getQuerySearch,
} from "@/features/order/store/orderQuery.store";

export const useMoveOrderToRouteGroupMutation = () => {
  const { showMessage } = useMessageHandler();
  const { loadOrders } = useOrderFlow();

  const moveOrderToRouteGroup = useCallback(
    async (params: {
      planId: number;
      orderIds: number[];
      sourceRouteGroupId: number;
      targetRouteGroupId: number;
    }) => {
      const result = await moveOrderToRouteGroupAction({
        ...params,
        onDrift: () => {
          void loadOrders(
            { q: getQuerySearch(), filters: getQueryFilters() },
            false,
          );
        },
      }).catch((error) => {
        const message =
          error instanceof ApiError
            ? error.message
            : "Failed to move order to route group.";
        const status = error instanceof ApiError ? error.status : 500;
        showMessage({ status, message });
        return { success: false };
      });

      if (!result.success) {
        showMessage({
          status: 500,
          message: "Failed to move order to route group.",
        });
      }

      return result;
    },
    [loadOrders, showMessage],
  );

  return { moveOrderToRouteGroup };
};
