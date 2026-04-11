import type { DeliveryPlan } from "@/features/plan/types/plan";
import type { RouteGroup } from "@/features/plan/routeGroup/types/routeGroup";

import type { Order } from "../types/order";
import { upsertOrder } from "../store/order.store";
import { upsertRouteGroup } from "@/features/plan/routeGroup/store/routeGroup.slice";
import { upsertRoutePlan } from "@/features/plan/store/routePlan.slice";
import type { OrderStateUpdatePayload } from "../api/orderState.api";

export const applyOrderStateUpdatePayload = (
  payload: OrderStateUpdatePayload | null | undefined,
) => {
  if (!payload) return;

  const updatedOrders = Array.isArray(payload.orders) ? payload.orders : [];
  updatedOrders.forEach((order) => {
    if (order?.client_id) {
      upsertOrder(order as Order);
    }
  });

  const updatedRouteGroups = Array.isArray(payload.route_groups)
    ? payload.route_groups
    : [];
  updatedRouteGroups.forEach((routeGroup) => {
    if (routeGroup?.client_id) {
      upsertRouteGroup(routeGroup as RouteGroup);
    }
  });

  const updatedRoutePlans = Array.isArray(payload.route_plans)
    ? payload.route_plans
    : [];
  updatedRoutePlans.forEach((routePlan) => {
    if (routePlan?.client_id) {
      upsertRoutePlan(routePlan as DeliveryPlan);
    }
  });
};
