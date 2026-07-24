import { useCallback } from "react";

import { ApiError } from "@/lib/api/ApiClient";
import { useMessageHandler } from "@shared-message-handler";

import { useOrderEventFlow } from "../../flows/orderEvent.flow";
import {
  listManualMessageTemplates,
  sendManualOrderMessage,
} from "../api/manualMessage.api";
import {
  buildManualMessageOptions,
  buildTrackedSendsFromHistory,
  mergeTrackedSends,
} from "../domain";
import {
  getTrackedManualMessages,
  replaceTrackedManualMessages,
  seedTrackedManualMessage,
  setManualMessageOptions,
  setManualMessageOptionsLoading,
  setManualMessageSendingEvent,
  upsertTrackedManualMessage,
  useManualMessageStore,
} from "../store/manualMessage.store";
import type {
  ManualMessageAcceptedResult,
  SendableChannel,
  SkippedManualMessageChannel,
  TrackedManualMessageAction,
} from "../types/manualMessage";

/**
 * Backend `code` for a rejected batch. Statuses are offset by +10 (410/413/414),
 * so the code is the only reliable discriminator.
 */
const BAD_REQUEST_CODE = "bad_request";

const isNoTemplateConfiguredError = (error: unknown) =>
  error instanceof ApiError &&
  error.payload?.code === BAD_REQUEST_CODE &&
  error.message.toLowerCase().includes("template");

export const useManualMessageFlow = () => {
  const { showMessage } = useMessageHandler();
  const { loadOrderEvents } = useOrderEventFlow();

  /**
   * Loads the picker's template options.
   *
   * Templates are authored on the Messages settings page, which owns its own
   * channel-scoped stores and never writes here, so this module-scoped cache
   * silently falls behind every edit. `revalidate` refetches over a populated
   * cache: the known options stay rendered until the response lands, and a
   * failed refresh keeps them instead of blanking the picker.
   */
  const loadTemplateOptions = useCallback(
    async ({ revalidate = false }: { revalidate?: boolean } = {}) => {
      const state = useManualMessageStore.getState();
      if (state.optionsLoading) return state.options;
      if (state.optionsLoaded && !revalidate) return state.options;

      const hadOptions = state.optionsLoaded;
      setManualMessageOptionsLoading(true);

      try {
        const response = await listManualMessageTemplates();
        const options = buildManualMessageOptions(
          response.data?.message_templates,
        );
        setManualMessageOptions(options);
        return options;
      } catch (error) {
        setManualMessageOptionsLoading(false);
        // A background refresh that fails over an already-populated picker is
        // not worth a toast — the operator keeps the last known options.
        if (!hadOptions) {
          const message =
            error instanceof ApiError
              ? error.message
              : "Unable to load message templates.";
          const status = error instanceof ApiError ? error.status : 500;
          showMessage({ status, message });
        }
        return null;
      }
    },
    [showMessage],
  );

  /**
   * Re-reads the authoritative event history and folds it over tracked state.
   * Drives the initial render, reconnects, and the socket-down fallback.
   */
  const refreshManualMessageStatus = useCallback(
    async (orderId: number) => {
      const events = await loadOrderEvents(orderId);
      if (!events) return;

      const fromHistory = buildTrackedSendsFromHistory(events);
      replaceTrackedManualMessages(
        orderId,
        mergeTrackedSends(getTrackedManualMessages(orderId), fromHistory),
      );
    },
    [loadOrderEvents],
  );

  /**
   * Queues one template event for one order. `channels` is omitted so the
   * backend attempts every channel the team has configured.
   */
  const sendManualMessage = useCallback(
    async (orderId: number, templateEvent: string) => {
      setManualMessageSendingEvent(orderId, templateEvent);

      try {
        const response = await sendManualOrderMessage({
          order_ids: [orderId],
          event: templateEvent,
        });

        const payload = response.data;
        // A 200 is not "everything worked" — the outcome is per order.
        const result = payload?.results?.find(
          (entry) => entry.order_id === orderId,
        );

        if (!result || result.status === "not_found") {
          upsertTrackedManualMessage(orderId, templateEvent, {
            requestId: payload?.request_id ?? null,
            eventId: null,
            actionsById: {},
            skippedChannels: [],
            notFound: true,
          });
          showMessage({
            status: "warning",
            message: "This order was not found on the server.",
          });
          return false;
        }

        const accepted = result as ManualMessageAcceptedResult;
        const actionsById: Record<number, TrackedManualMessageAction> = {};
        const skippedChannels: SkippedManualMessageChannel[] = [];

        Object.entries(accepted.channels ?? {}).forEach(
          ([rawChannel, channelResult]) => {
            if (!channelResult) return;
            const channel = rawChannel as SendableChannel;

            if (channelResult.status === "skipped") {
              skippedChannels.push({
                channel,
                detail: channelResult.detail,
              });
              return;
            }

            actionsById[channelResult.action_id] = {
              actionId: channelResult.action_id,
              channel,
              // "queued" only means it reached the queue; delivery is unknown
              // until the action row settles.
              status: channelResult.status === "queued" ? "PENDING" : "FAILED",
              lastError:
                channelResult.status === "failed" ? channelResult.detail : null,
              processedAt: null,
            };
          },
        );

        seedTrackedManualMessage(orderId, templateEvent, {
          requestId: payload.request_id,
          eventId: accepted.event_id,
          actionsById,
          skippedChannels,
        });

        const queuedCount = Object.values(actionsById).filter(
          (action) => action.status === "PENDING",
        ).length;

        if (queuedCount > 0) {
          showMessage({
            status: "success",
            message: `${queuedCount} message${queuedCount === 1 ? "" : "s"} queued.`,
          });
          return true;
        }

        showMessage({
          status: "warning",
          message: "Nothing was queued for this message.",
          details: skippedChannels.map((skipped) => skipped.detail).join(" "),
        });
        return false;
      } catch (error) {
        const message = isNoTemplateConfiguredError(error)
          ? "No enabled template is configured for this message. Set one up in Messages settings."
          : error instanceof ApiError
            ? error.message
            : "Unable to send this message.";
        const status = error instanceof ApiError ? error.status : 500;
        showMessage({ status, message });
        return false;
      } finally {
        setManualMessageSendingEvent(orderId, null);
      }
    },
    [showMessage],
  );

  return {
    loadTemplateOptions,
    refreshManualMessageStatus,
    sendManualMessage,
  };
};
