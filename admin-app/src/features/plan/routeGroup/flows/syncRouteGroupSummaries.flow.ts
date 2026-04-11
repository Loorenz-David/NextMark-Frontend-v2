import { selectAllOrderStates, useOrderStateStore } from "@/features/order/store/orderState.store";
import { selectRouteGroupByServerId, updateRouteGroup, useRouteGroupStore } from "@/features/plan/routeGroup/store/routeGroup.slice";
import { buildRouteGroupSummaryPatch } from "@/features/plan/routeGroup/domain/buildRouteGroupSummaryPatch";
import { selectAllOrders, useOrderStore } from "@/features/order/store/order.store";

export const syncRouteGroupSummaries = (
  routeGroupIds: Array<number | null | undefined>,
) => {
  const targetIds = Array.from(
    new Set(
      routeGroupIds.filter(
        (routeGroupId): routeGroupId is number =>
          typeof routeGroupId === "number" && routeGroupId > 0,
      ),
    ),
  );

  if (targetIds.length === 0) return;

  const allOrders = selectAllOrders(useOrderStore.getState());
  const orderStates = selectAllOrderStates(useOrderStateStore.getState());

  targetIds.forEach((routeGroupId) => {
    const routeGroup = selectRouteGroupByServerId(routeGroupId)(
      useRouteGroupStore.getState(),
    );
    if (!routeGroup?.client_id) return;

    const groupedOrders = allOrders.filter(
      (order) => order.route_group_id === routeGroupId,
    );
    const summaryPatch = buildRouteGroupSummaryPatch({
      orders: groupedOrders,
      orderStates,
    });

    updateRouteGroup(routeGroup.client_id, (existing) => ({
      ...existing,
      ...summaryPatch,
    }));
  });
};
