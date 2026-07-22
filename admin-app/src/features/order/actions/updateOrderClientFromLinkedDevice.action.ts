import { updateOrder } from "../api/orderApi";
import { normalizeOrderResponseForStore } from "../api/mappers/orderResponse.normalize";
import type { Order, OrderUpdateFields } from "../types/order";

export const updateOrderClientFromLinkedDevice = async ({
  orderId,
  fields,
}: {
  orderId: number;
  fields: OrderUpdateFields;
}): Promise<Order[]> => {
  const response = await updateOrder({
    target_id: orderId,
    fields,
  });

  return (response.data?.updated ?? [])
    .map((bundle) => normalizeOrderResponseForStore(bundle.order))
    .filter((order): order is Order => order != null);
};
