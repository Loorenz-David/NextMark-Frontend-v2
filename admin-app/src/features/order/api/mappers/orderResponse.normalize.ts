import type { Order } from "@/features/order/types/order";
import type { OrderMap } from "@/features/order/types/order";

type ApiOrder = Order & {
  route_plan_id?: number | null;
};

export const normalizeOrderResponseForStore = (
  order: ApiOrder | null | undefined,
): Order | null => {
  if (!order) return null;

  const deliveryPlanId =
    order.delivery_plan_id ??
    (typeof order.route_plan_id === "number" ? order.route_plan_id : null);

  return {
    ...order,
    delivery_plan_id: deliveryPlanId,
  };
};

export const normalizeOrderMapResponseForStore = (
  table: OrderMap | null | undefined,
): OrderMap | null => {
  if (!table) return null;

  const byClientId = Object.fromEntries(
    Object.entries(table.byClientId).map(([clientId, entry]) => {
      const normalized = normalizeOrderResponseForStore(entry as ApiOrder);
      return [clientId, normalized ?? entry];
    }),
  ) as OrderMap["byClientId"];

  return {
    ...table,
    byClientId,
  };
};
