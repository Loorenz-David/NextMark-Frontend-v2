export const ORDER_MESSAGE_DISPATCHED_EVENT = "order_message.dispatched";
export const ORDER_MESSAGE_UPDATED_EVENT = "order_message.updated";

/** The part of a business event envelope this resolver reads. */
export type OrderMessageFrame = {
  event_name: string;
  entity_id?: number | null;
  payload: unknown;
};

const toOrderId = (value: unknown): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.trunc(value);
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const resolveDispatchedOrderIds = (payload: unknown): number[] => {
  const record = asRecord(payload);
  if (!record || !Array.isArray(record.orders)) {
    return [];
  }

  const orderIds: number[] = [];

  record.orders.forEach((entry) => {
    const orderId = toOrderId(asRecord(entry)?.order_id);
    if (orderId == null || orderIds.includes(orderId)) return;
    orderIds.push(orderId);
  });

  return orderIds;
};

/**
 * Order ids whose event history a manual-message frame makes stale.
 *
 * `order_message.updated` carries a nullable `order_id`; that frame's envelope
 * `entity_id` is the order id, so it stands in when the payload field is
 * missing. `order_message.dispatched` is request-scoped and has no entity id —
 * its orders come from the payload only. Any other event name yields no ids.
 */
export const resolveOrderIdsFromOrderMessageFrame = (
  frame: OrderMessageFrame,
): number[] => {
  if (frame.event_name === ORDER_MESSAGE_DISPATCHED_EVENT) {
    return resolveDispatchedOrderIds(frame.payload);
  }

  if (frame.event_name !== ORDER_MESSAGE_UPDATED_EVENT) {
    return [];
  }

  const orderId =
    toOrderId(asRecord(frame.payload)?.order_id) ?? toOrderId(frame.entity_id);

  return orderId == null ? [] : [orderId];
};
