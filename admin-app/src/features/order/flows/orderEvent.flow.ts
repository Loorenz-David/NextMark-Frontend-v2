import { useCallback } from "react";

import { ApiError } from "@/lib/api/ApiClient";
import { useMessageHandler } from "@shared-message-handler";

import { useGetOrderEvents } from "../api/orderApi";
import type { OrderEvent, OrderEventItem } from "../types/orderEvent";
import {
  markOrderEventsLoaded,
  selectOrderEventsByOrderId,
  selectOrderEventsLoaded,
  upsertOrderEventsForOrder,
  useOrderEventStore,
} from "../store/orderEvent.store";

const toTimestamp = (value?: string | null) => {
  if (!value) return Number.NEGATIVE_INFINITY;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
};

const toOrderEventClientId = (orderId: number, eventId: number) =>
  `order:${orderId}:event:${eventId}`;

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

const normalizeOrderEvents = (
  orderId: number,
  rawEvents: OrderEventItem[],
): OrderEvent[] => {
  return [...rawEvents]
    .map((event) => {
      const eventId = toPositiveInt(event.id);
      const normalizedOrderId = toPositiveInt(event.order_id) ?? orderId;

      if (eventId == null) {
        return null;
      }

      return {
        ...event,
        id: eventId,
        order_id: normalizedOrderId,
      } as OrderEventItem;
    })
    .filter((event): event is OrderEventItem => Boolean(event))
    .sort((a, b) => {
      const diff = toTimestamp(b.occurred_at) - toTimestamp(a.occurred_at);
      if (diff !== 0) return diff;
      return (b.id ?? 0) - (a.id ?? 0);
    })
    .map((event) => ({
      ...event,
      client_id: toOrderEventClientId(orderId, event.id),
    }));
};

export const useOrderEventFlow = () => {
  const getOrderEvents = useGetOrderEvents();
  const { showMessage } = useMessageHandler();

  const loadOrderEvents = useCallback(
    async (orderId: number) => {
      try {
        const response = await getOrderEvents(orderId);
        const payload = response.data;

        if (!payload || !Array.isArray(payload.order_events)) {
          showMessage({
            status: 500,
            message: "Missing order events response.",
          });
          markOrderEventsLoaded(orderId);
          return [];
        }

        const normalized = normalizeOrderEvents(orderId, payload.order_events);
        upsertOrderEventsForOrder(orderId, normalized);

        return normalized;
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Unable to load order events.";
        const status = error instanceof ApiError ? error.status : 500;
        showMessage({ status, message });
        return null;
      }
    },
    [getOrderEvents, showMessage],
  );

  const loadOrderEventsIfNeeded = useCallback(
    async (orderId: number) => {
      const state = useOrderEventStore.getState();
      const loaded = selectOrderEventsLoaded(orderId)(state);
      if (loaded) {
        return selectOrderEventsByOrderId(orderId)(state);
      }

      return loadOrderEvents(orderId);
    },
    [loadOrderEvents],
  );

  return {
    loadOrderEvents,
    loadOrderEventsIfNeeded,
  };
};
