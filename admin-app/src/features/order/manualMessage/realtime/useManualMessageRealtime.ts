import { useEffect, useMemo } from "react";
import {
  createAdminBusinessChannel,
  type BusinessEventEnvelope,
} from "@shared-realtime";

import { adminRealtimeClient } from "@/realtime/client";

import {
  upsertTrackedManualMessage,
  upsertTrackedManualMessageAction,
} from "../store/manualMessage.store";
import type {
  OrderMessageDispatchedPayload,
  OrderMessageUpdatedPayload,
} from "../types/manualMessage";

const DISPATCHED_EVENT = "order_message.dispatched";
const UPDATED_EVENT = "order_message.updated";

type UseManualMessageRealtimeOptions = {
  orderId: number | null | undefined;
};

const asDispatchedPayload = (
  payload: unknown,
): OrderMessageDispatchedPayload | null => {
  if (!payload || typeof payload !== "object") return null;

  const candidate = payload as OrderMessageDispatchedPayload;
  return Array.isArray(candidate.orders) &&
    typeof candidate.template_event === "string"
    ? candidate
    : null;
};

const asUpdatedPayload = (
  payload: unknown,
): OrderMessageUpdatedPayload | null => {
  if (!payload || typeof payload !== "object") return null;

  const candidate = payload as OrderMessageUpdatedPayload;
  return typeof candidate.action_id === "number" &&
    typeof candidate.template_event === "string"
    ? candidate
    : null;
};

/**
 * Applies manual-message frames for one order.
 *
 * Subscribes to `team_admin` directly rather than going through
 * AdminBusinessRealtimeProvider: the client ref-counts subscriptions per
 * channel key, so this coexists with the app-level listener and unsubscribes
 * with the component. Frames are best-effort and never replayed, so the flow's
 * history refresh remains the system of record.
 */
export const useManualMessageRealtime = ({
  orderId,
}: UseManualMessageRealtimeOptions) => {
  const adminBusinessChannel = useMemo(
    () => createAdminBusinessChannel(adminRealtimeClient),
    [],
  );

  useEffect(() => {
    if (typeof orderId !== "number") return;

    return adminBusinessChannel.subscribeTeamAdmin(
      (envelope: BusinessEventEnvelope<unknown>) => {
        if (envelope.event_name === DISPATCHED_EVENT) {
          const payload = asDispatchedPayload(envelope.payload);
          if (!payload) return;

          const forOrder = payload.orders.find(
            (entry) => entry.order_id === orderId,
          );
          if (!forOrder) return;

          upsertTrackedManualMessage(orderId, payload.template_event, {
            requestId: payload.request_id,
            eventId: forOrder.event_id,
            notFound: false,
          });

          forOrder.actions.forEach((action) => {
            upsertTrackedManualMessageAction(orderId, payload.template_event, {
              actionId: action.action_id,
              channel: action.channel,
              status: "PENDING",
            });
          });
          return;
        }

        if (envelope.event_name !== UPDATED_EVENT) return;

        const payload = asUpdatedPayload(envelope.payload);
        if (!payload || payload.order_id !== orderId) return;

        // Keyed by action_id: ordering between actions is not guaranteed.
        upsertTrackedManualMessageAction(orderId, payload.template_event, {
          actionId: payload.action_id,
          channel: payload.channel,
          status: payload.status,
          lastError: payload.last_error,
          processedAt: payload.processed_at,
        });
      },
    );
  }, [adminBusinessChannel, orderId]);
};
