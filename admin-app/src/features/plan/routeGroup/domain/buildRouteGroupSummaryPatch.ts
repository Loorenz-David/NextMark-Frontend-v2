import type { Order } from "@/features/order/types/order";
import type { OrderState } from "@/features/order/types/orderState";
import type { RouteGroup } from "@/features/plan/routeGroup/types/routeGroup";

const toGrams = (kilograms: number | null | undefined) =>
  Math.round(Math.max(0, kilograms ?? 0) * 1000);

const toCubicCentimeters = (cubicMeters: number | null | undefined) =>
  Math.round(Math.max(0, cubicMeters ?? 0) * 1_000_000);

export const buildRouteGroupSummaryPatch = ({
  orders,
  orderStates,
}: {
  orders: Order[];
  orderStates: OrderState[];
}): Pick<
  RouteGroup,
  | "total_orders"
  | "total_item_count"
  | "item_type_counts"
  | "total_volume_cm3"
  | "total_weight_grams"
  | "order_state_counts"
> => {
  const orderStateCounts = orderStates.reduce<Record<string, number>>(
    (acc, state) => {
      acc[state.name] = 0;
      return acc;
    },
    {},
  );

  orders.forEach((order) => {
    const matchedState =
      orderStates.find(
        (state) => state.id === (order.order_state_id ?? null),
      ) ?? null;
    if (matchedState) {
      orderStateCounts[matchedState.name] =
        (orderStateCounts[matchedState.name] ?? 0) + 1;
    }
  });

  const itemTypeCounts = orders.reduce<Record<string, number>>((acc, order) => {
    Object.entries(order.item_type_counts ?? {}).forEach(
      ([itemType, count]) => {
        if (itemType.trim().length === 0) return;
        const safeCount = Number.isFinite(count) ? count : 0;
        if (safeCount <= 0) return;
        acc[itemType] = (acc[itemType] ?? 0) + safeCount;
      },
    );
    return acc;
  }, {});

  return {
    total_orders: orders.length,
    total_item_count: orders.reduce(
      (total, order) => total + Math.max(0, order.total_items ?? 0),
      0,
    ),
    item_type_counts:
      Object.keys(itemTypeCounts).length > 0 ? itemTypeCounts : null,
    total_weight_grams: orders.reduce(
      (total, order) => total + toGrams(order.total_weight),
      0,
    ),
    total_volume_cm3: orders.reduce(
      (total, order) => total + toCubicCentimeters(order.total_volume),
      0,
    ),
    order_state_counts: orderStateCounts,
  };
};
