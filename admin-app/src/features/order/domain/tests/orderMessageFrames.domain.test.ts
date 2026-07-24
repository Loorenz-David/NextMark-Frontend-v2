import { resolveOrderIdsFromOrderMessageFrame } from "../orderMessageFrames.domain";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runOrderMessageFramesDomainTests = () => {
  {
    // A bulk dispatch names every accepted order once, duplicates collapsed.
    const orderIds = resolveOrderIdsFromOrderMessageFrame({
      event_name: "order_message.dispatched",
      entity_id: null,
      payload: {
        orders: [
          { order_id: 12, event_id: 900, actions: [] },
          { order_id: 12, event_id: 901, actions: [] },
          { order_id: 15, event_id: 902, actions: [] },
        ],
        not_found_order_ids: [88],
      },
    });

    assert(
      orderIds.length === 2 && orderIds[0] === 12 && orderIds[1] === 15,
      "dispatched frame should yield each order id once",
    );
  }

  {
    // `order_id` is nullable on updated frames; entity_id carries it too.
    const fromPayload = resolveOrderIdsFromOrderMessageFrame({
      event_name: "order_message.updated",
      entity_id: 12,
      payload: { order_id: 12, action_id: 40113, status: "SUCCESS" },
    });
    const fromEntity = resolveOrderIdsFromOrderMessageFrame({
      event_name: "order_message.updated",
      entity_id: 12,
      payload: { order_id: null, action_id: 40113, status: "FAILED" },
    });

    assert(
      fromPayload.length === 1 && fromPayload[0] === 12,
      "updated frame should read order_id from the payload",
    );
    assert(
      fromEntity.length === 1 && fromEntity[0] === 12,
      "updated frame should fall back to entity_id",
    );
  }

  {
    // Unrelated frames and malformed payloads must not trigger a refresh.
    assert(
      resolveOrderIdsFromOrderMessageFrame({
        event_name: "order.updated",
        entity_id: 12,
        payload: { order_id: 12 },
      }).length === 0,
      "unrelated event names should yield no order ids",
    );
    assert(
      resolveOrderIdsFromOrderMessageFrame({
        event_name: "order_message.dispatched",
        entity_id: null,
        payload: { orders: "not-an-array" },
      }).length === 0,
      "a malformed dispatched payload should yield no order ids",
    );
    assert(
      resolveOrderIdsFromOrderMessageFrame({
        event_name: "order_message.updated",
        entity_id: null,
        payload: { order_id: 0 },
      }).length === 0,
      "a non-positive order id should be rejected",
    );
  }
};
