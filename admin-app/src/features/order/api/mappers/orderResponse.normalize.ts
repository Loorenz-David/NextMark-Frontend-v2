import type { Order } from "@/features/order/types/order";

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
