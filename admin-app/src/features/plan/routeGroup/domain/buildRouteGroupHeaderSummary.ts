import type { Order } from "@/features/order/types/order";
import type { DeliveryPlan } from "@/features/plan/types/plan";
import type { RouteGroup } from "../types/routeGroup";

export type RouteGroupHeaderSummary = {
  title: string;
  subtitle: string | null;
  orderCount: number;
  itemCount: number;
  totalVolume: number;
  totalWeight: number;
};

const sumOrderMetric = (
  orders: Order[],
  key: "total_items" | "total_volume" | "total_weight",
) =>
  orders.reduce((total, order) => total + Math.max(0, order[key] ?? 0), 0);

const resolveAggregateOrderCount = (
  plan: DeliveryPlan | null,
  routeGroups: RouteGroup[],
) => {
  const groupedOrderCount = routeGroups.reduce(
    (total, routeGroup) => total + Math.max(0, routeGroup.total_orders ?? 0),
    0,
  );

  if (groupedOrderCount > 0) {
    return groupedOrderCount;
  }

  return Math.max(0, plan?.total_orders ?? 0);
};

const resolveRouteGroupTitle = (routeGroup: RouteGroup) =>
  routeGroup.zone_snapshot?.name?.trim() ||
  (typeof routeGroup.zone_id === "number"
    ? `Zone ${routeGroup.zone_id}`
    : "Route group");

export const buildRouteGroupHeaderSummary = ({
  plan,
  routeGroups,
  activeRouteGroup,
  activeRouteGroupOrders,
}: {
  plan: DeliveryPlan | null;
  routeGroups: RouteGroup[];
  activeRouteGroup: RouteGroup | null;
  activeRouteGroupOrders: Order[];
}): RouteGroupHeaderSummary => {
  if (activeRouteGroup) {
    return {
      title: resolveRouteGroupTitle(activeRouteGroup),
      subtitle: plan?.label ?? null,
      orderCount: Math.max(
        0,
        activeRouteGroup.total_orders ?? activeRouteGroupOrders.length,
      ),
      itemCount: sumOrderMetric(activeRouteGroupOrders, "total_items"),
      totalVolume: sumOrderMetric(activeRouteGroupOrders, "total_volume"),
      totalWeight: sumOrderMetric(activeRouteGroupOrders, "total_weight"),
    };
  }

  return {
    title: plan?.label ?? "Route groups",
    subtitle:
      routeGroups.length > 0
        ? `${routeGroups.length} route groups`
        : "No route groups materialized",
    orderCount: resolveAggregateOrderCount(plan, routeGroups),
    itemCount: Math.max(0, plan?.total_items ?? 0),
    totalVolume: Math.max(0, plan?.total_volume ?? 0),
    totalWeight: Math.max(0, plan?.total_weight ?? 0),
  };
};
