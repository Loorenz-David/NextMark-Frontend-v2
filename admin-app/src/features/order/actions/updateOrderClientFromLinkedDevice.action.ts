import { updateOrder } from "../api/orderApi";
import { normalizeOrderResponseForStore } from "../api/mappers/orderResponse.normalize";
import type { OrderClientFormSubmissionSource } from "@shared-domain";

import type { Order, OrderUpdateFields } from "../types/order";

const LINKED_DEVICE_SOURCE: OrderClientFormSubmissionSource = "linked_device";

export const updateOrderClientFromLinkedDevice = async ({
  orderId,
  fields,
}: {
  orderId: number;
  fields: OrderUpdateFields;
}): Promise<Order[]> => {
  // The customer filled this on the linked device; this session only relays
  // it, so the backend records the update as the customer's own submission.
  const response = await updateOrder({
    target_id: orderId,
    // Request-only flag, like `update_costumer`: the backend lifts it out of
    // `fields` before validating them as order columns.
    fields: { ...fields, submission_source: LINKED_DEVICE_SOURCE } as OrderUpdateFields,
  });

  return (response.data?.updated ?? [])
    .map((bundle) => normalizeOrderResponseForStore(bundle.order))
    .filter((order): order is Order => order != null);
};
