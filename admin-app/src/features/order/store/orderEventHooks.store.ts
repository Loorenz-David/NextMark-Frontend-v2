import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import type { OrderEvent, OrderEventMap } from "../types/orderEvent";
import {
  clearOrderEvents,
  registerViewedOrderEventHistory,
  selectAllOrderEvents,
  selectIsOrderEventHistoryViewed,
  selectOrderEventsByOrderId,
  selectOrderEventsLoaded,
  selectViewedOrderEventOrderIds,
  setOrderEvent,
  setOrderEvents,
  unregisterViewedOrderEventHistory,
  upsertOrderEvent,
  upsertOrderEventsForOrder,
  useOrderEventStore,
} from "./orderEvent.store";

export const useOrderEvents = () =>
  useOrderEventStore(useShallow(selectAllOrderEvents));

export const useOrderEventsByOrderId = (orderId: number | null | undefined) =>
  useOrderEventStore(useShallow(selectOrderEventsByOrderId(orderId)));

export const useOrderEventsLoaded = (orderId: number | null | undefined) =>
  useOrderEventStore(selectOrderEventsLoaded(orderId));

export const useIsOrderEventHistoryViewed = (
  orderId: number | null | undefined,
) => useOrderEventStore(selectIsOrderEventHistoryViewed(orderId));

export const useViewedOrderEventOrderIds = () =>
  useOrderEventStore(useShallow(selectViewedOrderEventOrderIds));

export const useSetOrderEventStore = () =>
  useCallback((event: OrderEvent) => {
    setOrderEvent(event);
  }, []);

export const useSetOrderEventsStore = () =>
  useCallback((table: OrderEventMap) => {
    setOrderEvents(table);
  }, []);

export const useUpsertOrderEventStore = () =>
  useCallback((event: OrderEvent) => {
    upsertOrderEvent(event);
  }, []);

export const useUpsertOrderEventsForOrderStore = () =>
  useCallback((orderId: number, events: OrderEvent[]) => {
    upsertOrderEventsForOrder(orderId, events);
  }, []);

export const useClearOrderEventsStore = () =>
  useCallback(() => {
    clearOrderEvents();
  }, []);

export const useRegisterViewedOrderEventHistory = () =>
  useCallback((orderId: number) => {
    registerViewedOrderEventHistory(orderId);
  }, []);

export const useUnregisterViewedOrderEventHistory = () =>
  useCallback((orderId: number) => {
    unregisterViewedOrderEventHistory(orderId);
  }, []);
