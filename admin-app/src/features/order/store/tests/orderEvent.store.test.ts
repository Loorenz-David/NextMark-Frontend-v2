import {
  clearOrderEvents,
  invalidateOrderEvents,
  registerViewedOrderEventHistory,
  selectOrderEventsByOrderId,
  selectOrderEventsLoaded,
  upsertOrderEventsForOrder,
  useOrderEventStore,
} from "../orderEvent.store";
import type { OrderEvent } from "../../types/orderEvent";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const buildOrderEvent = (orderId: number, eventId: number): OrderEvent =>
  ({
    client_id: `order:${orderId}:event:${eventId}`,
    id: eventId,
    order_id: orderId,
    event_name: "order_manual_message",
    occurred_at: "2026-07-24T11:02:31+00:00",
    payload: {},
    actions: [],
  }) as unknown as OrderEvent;

export const runOrderEventStoreTests = () => {
  {
    // A manual send on an order the operator is not viewing marks the cached
    // history stale without discarding what is already rendered elsewhere.
    clearOrderEvents();
    upsertOrderEventsForOrder(12, [buildOrderEvent(12, 900)]);

    assert(
      selectOrderEventsLoaded(12)(useOrderEventStore.getState()),
      "events should be loaded after upsert",
    );

    invalidateOrderEvents(12);

    const state = useOrderEventStore.getState();
    assert(
      !selectOrderEventsLoaded(12)(state),
      "invalidate should clear the loaded flag",
    );
    assert(
      selectOrderEventsByOrderId(12)(state).length === 1,
      "invalidate should keep the already fetched rows",
    );
  }

  {
    // Invalidating an order that was never loaded is a no-op.
    clearOrderEvents();
    registerViewedOrderEventHistory(15);
    invalidateOrderEvents(15);

    assert(
      !selectOrderEventsLoaded(15)(useOrderEventStore.getState()),
      "an unloaded order should stay unloaded",
    );
  }

  clearOrderEvents();
};
