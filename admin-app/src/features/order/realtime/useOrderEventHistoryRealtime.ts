import { useEffect, useMemo, useRef } from "react";
import {
  createAdminBusinessChannel,
  type BusinessEventEnvelope,
} from "@shared-realtime";

import { adminRealtimeClient } from "@/realtime/client";

import { resolveOrderIdsFromOrderMessageFrame } from "../domain/orderMessageFrames.domain";
import { useOrderEventFlow } from "../flows/orderEvent.flow";
import {
  invalidateOrderEvents,
  selectIsOrderEventHistoryViewed,
  selectOrderEventsLoaded,
  useOrderEventStore,
} from "../store/orderEvent.store";

/**
 * A send emits one `dispatched` frame followed by one `updated` frame per
 * channel. Waiting out the burst turns them into a single refetch.
 */
const REFRESH_DEBOUNCE_MS = 300;

/**
 * Keeps the order event history in step with manual-message frames.
 *
 * An order whose history is on screen is refetched — the endpoint is the system
 * of record and the frames carry neither the synthetic event row nor the action
 * names. An order that was loaded earlier but is not being viewed is only
 * marked stale, so a bulk send costs one request instead of one per order.
 *
 * Mounted app-wide rather than under the order detail so a send triggered from
 * the order form still invalidates a history the operator opened before.
 */
export const useOrderEventHistoryRealtime = () => {
  const { loadOrderEvents } = useOrderEventFlow();
  const loadOrderEventsRef = useRef(loadOrderEvents);
  loadOrderEventsRef.current = loadOrderEvents;

  const adminBusinessChannel = useMemo(
    () => createAdminBusinessChannel(adminRealtimeClient),
    [],
  );

  useEffect(() => {
    const timersByOrderId = new Map<number, number>();

    const scheduleRefresh = (orderId: number) => {
      const pending = timersByOrderId.get(orderId);
      if (pending) {
        window.clearTimeout(pending);
      }

      timersByOrderId.set(
        orderId,
        window.setTimeout(() => {
          timersByOrderId.delete(orderId);
          void loadOrderEventsRef.current(orderId);
        }, REFRESH_DEBOUNCE_MS),
      );
    };

    // Subscribes on its own rather than through AdminBusinessRealtimeProvider's
    // handler chain: that chain claims each event id once via
    // markAdminBusinessEventHandled, and a second claim would swallow the frame.
    const release = adminBusinessChannel.subscribeTeamAdmin(
      (envelope: BusinessEventEnvelope<unknown>) => {
        const orderIds = resolveOrderIdsFromOrderMessageFrame(envelope);
        if (orderIds.length === 0) return;

        const state = useOrderEventStore.getState();

        orderIds.forEach((orderId) => {
          if (selectIsOrderEventHistoryViewed(orderId)(state)) {
            scheduleRefresh(orderId);
            return;
          }

          if (selectOrderEventsLoaded(orderId)(state)) {
            invalidateOrderEvents(orderId);
          }
        });
      },
    );

    return () => {
      release();
      timersByOrderId.forEach((timer) => window.clearTimeout(timer));
      timersByOrderId.clear();
    };
  }, [adminBusinessChannel]);
};
