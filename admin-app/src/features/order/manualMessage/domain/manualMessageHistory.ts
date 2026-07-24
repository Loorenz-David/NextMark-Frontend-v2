import type { OrderEvent } from "../../types/orderEvent";
import type {
  TrackedManualMessageAction,
  TrackedManualMessageSend,
} from "../types/manualMessage";
import {
  isManualMessageEvent,
  readActionChannel,
  readManualTemplateEvent,
} from "./manualMessageOptions";

const toTrackedAction = (
  action: OrderEvent["actions"][number],
): TrackedManualMessageAction => ({
  actionId: action.id,
  channel: readActionChannel(action),
  status: action.status,
  lastError: action.last_error,
  processedAt: action.processed_at,
});

/**
 * Rebuilds tracked state from the authoritative event history.
 *
 * Used for the initial render, on reconnect, and as the socket-down fallback.
 * Events arrive newest-first, so the first manual event seen for a template is
 * the latest send and later ones are ignored — a card shows the most recent
 * attempt, not a merge of every historical one.
 */
export const buildTrackedSendsFromHistory = (
  events: OrderEvent[],
): Record<string, TrackedManualMessageSend> => {
  const tracked: Record<string, TrackedManualMessageSend> = {};

  events.forEach((event) => {
    if (!isManualMessageEvent(event)) return;

    const templateEvent = readManualTemplateEvent(event);
    if (!templateEvent || tracked[templateEvent]) return;

    // An event with no action rows produced no message. Tracking it would leave
    // a card stuck on "sending" with nothing left to settle it.
    if (!Array.isArray(event.actions) || event.actions.length === 0) return;

    const actionsById = event.actions.reduce<
      Record<number, TrackedManualMessageAction>
    >((accumulator, action) => {
      accumulator[action.id] = toTrackedAction(action);
      return accumulator;
    }, {});

    tracked[templateEvent] = {
      templateEvent,
      requestId: null,
      eventId: event.id,
      actionsById,
      skippedChannels: [],
      notFound: false,
    };
  });

  return tracked;
};

/**
 * Folds authoritative history over whatever the send response already seeded.
 *
 * History wins per action id, but a template the history has not caught up on
 * keeps its optimistic entry — otherwise a refresh that lands before the worker
 * has written the event row would silently drop a running spinner.
 * `skippedChannels` is never in the history, so it is carried over from local
 * state rather than reset.
 */
export const mergeTrackedSends = (
  existing: Record<string, TrackedManualMessageSend>,
  incoming: Record<string, TrackedManualMessageSend>,
): Record<string, TrackedManualMessageSend> => {
  const merged: Record<string, TrackedManualMessageSend> = { ...existing };

  Object.entries(incoming).forEach(([templateEvent, incomingSend]) => {
    const current = merged[templateEvent];

    if (!current) {
      merged[templateEvent] = incomingSend;
      return;
    }

    merged[templateEvent] = {
      ...current,
      eventId: incomingSend.eventId ?? current.eventId,
      actionsById: { ...current.actionsById, ...incomingSend.actionsById },
      notFound: false,
    };
  });

  return merged;
};
