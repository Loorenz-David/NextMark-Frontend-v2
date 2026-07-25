import type { Order } from "@/features/order/types/order";
import type { OrderMap } from "@/features/order/types/order";
import { normalizeOrderNotesForStore } from "@/features/order/domain/orderNotes";

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

export const mergeOrderResponseForStore = (
  currentOrder: Order,
  responseOrder: Order,
): Order => ({
  ...currentOrder,
  ...responseOrder,
  order_notes:
    responseOrder.order_notes !== undefined
      ? normalizeOrderNotesForStore(responseOrder.order_notes)
      : currentOrder.order_notes,
  __optimistic: undefined,
});

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
