import { createEntityStore } from "@shared-store";
import type { EntityTable } from "@shared-store";
import { selectAll } from "@shared-store";

import type { OrderEvent, OrderEventMap } from "../types/orderEvent";
import { useOrderStore } from "./order.store";
import type { Order } from "../types/order";

export const useOrderEventStore = createEntityStore<OrderEvent>();

type OrderEventsByOrderIdIndex = Map<number, string[]>;

type OrderEventStoreWithIndexes = EntityTable<OrderEvent> & {
  orderEventsByOrderId: OrderEventsByOrderIdIndex;
  loadedOrderEventOrderIds: Set<number>;
  viewedOrderEventOrderIds: Set<number>;
};

const isOrderDetailShapeLoaded = (order: Order | null | undefined) => {
  if (!order) return false;
  if (typeof order.id !== "number") return false;

  const hasAddressShape =
    typeof order.client_address === "object" &&
    order.client_address !== null &&
    "street_address" in order.client_address;

  return (
    hasAddressShape &&
    Array.isArray(order.delivery_windows) &&
    Array.isArray(order.order_notes)
  );
};

export const isOrderFullyLoadedForHistory = (
  orderId: number,
  orderState = useOrderStore.getState(),
) => {
  const clientId = orderState.idIndex?.[orderId];
  if (!clientId) return false;

  const order = orderState.byClientId?.[clientId] ?? null;
  return isOrderDetailShapeLoaded(order);
};

const toTimestamp = (value?: string | null) => {
  if (!value) return Number.NEGATIVE_INFINITY;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
};

const toPositiveInt = (value: unknown): number | null => {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }

    return Math.trunc(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }

    return Math.trunc(parsed);
  }

  return null;
};

const buildOrderEventsByOrderIdIndex = (
  state: EntityTable<OrderEvent>,
): OrderEventsByOrderIdIndex => {
  const grouped = new Map<number, OrderEvent[]>();

  state.allIds.forEach((clientId) => {
    const event = state.byClientId[clientId];
    if (!event) return;
    const orderId = toPositiveInt(event.order_id);
    if (orderId == null) return;

    const existing = grouped.get(orderId);
    if (existing) {
      existing.push(event);
      return;
    }

    grouped.set(orderId, [event]);
  });

  const byOrderId = new Map<number, string[]>();

  grouped.forEach((events, orderId) => {
    const sortedClientIds = [...events]
      .sort((a, b) => {
        const diff = toTimestamp(b.occurred_at) - toTimestamp(a.occurred_at);
        if (diff !== 0) return diff;
        return (b.id ?? 0) - (a.id ?? 0);
      })
      .map((event) => event.client_id);

    byOrderId.set(orderId, sortedClientIds);
  });

  return byOrderId;
};

const syncOrderEventsByOrderIdIndex = () => {
  const state = useOrderEventStore.getState();
  const nextIndex = buildOrderEventsByOrderIdIndex(state);
  const loadedOrderEventOrderIds =
    (state as OrderEventStoreWithIndexes).loadedOrderEventOrderIds ??
    new Set<number>();
  const viewedOrderEventOrderIds =
    (state as OrderEventStoreWithIndexes).viewedOrderEventOrderIds ??
    new Set<number>();

  useOrderEventStore.setState({
    orderEventsByOrderId: nextIndex,
    loadedOrderEventOrderIds,
    viewedOrderEventOrderIds,
  } as Partial<EntityTable<OrderEvent>> & {
    orderEventsByOrderId: OrderEventsByOrderIdIndex;
    loadedOrderEventOrderIds: Set<number>;
    viewedOrderEventOrderIds: Set<number>;
  });
};

useOrderEventStore.setState({
  orderEventsByOrderId: new Map<number, string[]>(),
  loadedOrderEventOrderIds: new Set<number>(),
  viewedOrderEventOrderIds: new Set<number>(),
} as Partial<EntityTable<OrderEvent>> & {
  orderEventsByOrderId: OrderEventsByOrderIdIndex;
  loadedOrderEventOrderIds: Set<number>;
  viewedOrderEventOrderIds: Set<number>;
});

export const selectAllOrderEvents = (state: EntityTable<OrderEvent>) =>
  selectAll<OrderEvent>()(state);

export const selectOrderEventsByOrderId =
  (orderId: number | null | undefined) => (state: EntityTable<OrderEvent>) => {
    if (typeof orderId !== "number") return [];

    const indexedState = state as OrderEventStoreWithIndexes;
    const eventClientIds = indexedState.orderEventsByOrderId?.get(orderId);
    if (!eventClientIds || eventClientIds.length === 0) return [];

    return eventClientIds
      .map((clientId) => state.byClientId[clientId] ?? null)
      .filter((event): event is OrderEvent => Boolean(event));
  };

export const selectOrderEventsLoaded =
  (orderId: number | null | undefined) => (state: EntityTable<OrderEvent>) => {
    if (typeof orderId !== "number") return false;

    const indexedState = state as OrderEventStoreWithIndexes;
    return indexedState.loadedOrderEventOrderIds?.has(orderId) ?? false;
  };

export const selectIsOrderEventHistoryViewed =
  (orderId: number | null | undefined) => (state: EntityTable<OrderEvent>) => {
    if (typeof orderId !== "number") return false;

    const indexedState = state as OrderEventStoreWithIndexes;
    return indexedState.viewedOrderEventOrderIds?.has(orderId) ?? false;
  };

export const selectViewedOrderEventOrderIds = (
  state: EntityTable<OrderEvent>,
) => {
  const indexedState = state as OrderEventStoreWithIndexes;
  return Array.from(indexedState.viewedOrderEventOrderIds ?? []);
};

export const setOrderEvent = (orderEvent: OrderEvent) => {
  useOrderEventStore.getState().insert(orderEvent);
  syncOrderEventsByOrderIdIndex();
};

export const setOrderEvents = (table: OrderEventMap) => {
  useOrderEventStore.getState().insertMany(table);
  syncOrderEventsByOrderIdIndex();
};

export const upsertOrderEvent = (orderEvent: OrderEvent) => {
  const state = useOrderEventStore.getState();
  if (state.byClientId[orderEvent.client_id]) {
    state.update(orderEvent.client_id, (existing) => ({
      ...existing,
      ...orderEvent,
    }));
    syncOrderEventsByOrderIdIndex();
    return;
  }

  state.insert(orderEvent);
  syncOrderEventsByOrderIdIndex();
};

export const upsertOrderEventsForOrder = (
  orderId: number,
  events: OrderEvent[],
) => {
  events.forEach((event) => {
    upsertOrderEvent(event);
  });

  const state = useOrderEventStore.getState() as OrderEventStoreWithIndexes;
  const nextLoaded = new Set(state.loadedOrderEventOrderIds ?? []);
  nextLoaded.add(orderId);

  useOrderEventStore.setState({
    loadedOrderEventOrderIds: nextLoaded,
  } as Partial<EntityTable<OrderEvent>> & {
    loadedOrderEventOrderIds: Set<number>;
  });
};

export const markOrderEventsLoaded = (orderId: number) => {
  const state = useOrderEventStore.getState() as OrderEventStoreWithIndexes;
  const nextLoaded = new Set(state.loadedOrderEventOrderIds ?? []);
  nextLoaded.add(orderId);

  useOrderEventStore.setState({
    loadedOrderEventOrderIds: nextLoaded,
  } as Partial<EntityTable<OrderEvent>> & {
    loadedOrderEventOrderIds: Set<number>;
  });
};

export const registerViewedOrderEventHistory = (orderId: number) => {
  const state = useOrderEventStore.getState() as OrderEventStoreWithIndexes;
  const nextViewed = new Set(state.viewedOrderEventOrderIds ?? []);
  nextViewed.add(orderId);

  useOrderEventStore.setState({
    viewedOrderEventOrderIds: nextViewed,
  } as Partial<EntityTable<OrderEvent>> & {
    viewedOrderEventOrderIds: Set<number>;
  });
};

export const unregisterViewedOrderEventHistory = (orderId: number) => {
  const state = useOrderEventStore.getState() as OrderEventStoreWithIndexes;
  const nextViewed = new Set(state.viewedOrderEventOrderIds ?? []);
  nextViewed.delete(orderId);

  useOrderEventStore.setState({
    viewedOrderEventOrderIds: nextViewed,
  } as Partial<EntityTable<OrderEvent>> & {
    viewedOrderEventOrderIds: Set<number>;
  });
};

export const clearOrderEvents = () => {
  useOrderEventStore.getState().clear();
  useOrderEventStore.setState({
    orderEventsByOrderId: new Map<number, string[]>(),
    loadedOrderEventOrderIds: new Set<number>(),
    viewedOrderEventOrderIds: new Set<number>(),
  } as Partial<EntityTable<OrderEvent>> & {
    orderEventsByOrderId: OrderEventsByOrderIdIndex;
    loadedOrderEventOrderIds: Set<number>;
    viewedOrderEventOrderIds: Set<number>;
  });
};
