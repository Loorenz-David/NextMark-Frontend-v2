import { ORDER_EVENTS } from "../../domain/orderEvents";
import type { OrderEvent, OrderEventAction } from "../../types/orderEvent";
import type {
  ManualMessageCardStatus,
  ManualMessageOption,
  MessageTemplateMap,
  MessageTemplateRow,
  SendableChannel,
  TrackedManualMessageSend,
} from "../types/manualMessage";

/** Channels with a sender implementation. `whatsapp` / `telegram` are rejected by the endpoint. */
export const SENDABLE_CHANNELS: readonly SendableChannel[] = ["email", "sms"];

/**
 * Synthetic event name the backend stamps on a manual send. It is not a business
 * event and can never be configured, so it must never reach the picker.
 */
export const MANUAL_MESSAGE_EVENT_NAME = "order_manual_message";

const EVENT_LABEL_BY_KEY = new Map(
  ORDER_EVENTS.map((definition) => [
    definition.key as string,
    definition.label,
  ]),
);

const isSendableChannel = (channel: string): channel is SendableChannel =>
  SENDABLE_CHANNELS.includes(channel as SendableChannel);

const humanizeEventName = (event: string) =>
  event
    .split("_")
    .filter(Boolean)
    .map((word, index) =>
      index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
    )
    .join(" ");

/**
 * Label priority: the operator-authored template name, then the shared event
 * label, then a humanized key. The fallback chain covers event names that exist
 * on the backend but have no entry in ORDER_EVENTS.
 */
export const resolveManualMessageLabel = (
  event: string,
  templateName?: string | null,
) => {
  const trimmedName = templateName?.trim();
  if (trimmedName) return trimmedName;

  return EVENT_LABEL_BY_KEY.get(event) ?? humanizeEventName(event);
};

const isOfferableTemplate = (template: MessageTemplateRow | undefined) => {
  if (!template) return false;
  if (!template.enable) return false;
  if (!isSendableChannel(template.channel)) return false;
  if (template.event === MANUAL_MESSAGE_EVENT_NAME) return false;

  return typeof template.event === "string" && template.event.length > 0;
};

/**
 * Collapses the template map into one selectable row per event.
 *
 * Iterates `allIds` rather than `Object.values` because the map key is derived
 * from `client_id ?? id` and only `allIds` preserves the server's sort order.
 */
export const buildManualMessageOptions = (
  map: MessageTemplateMap | null | undefined,
): ManualMessageOption[] => {
  if (!map || !Array.isArray(map.allIds)) return [];

  const byEvent = new Map<string, ManualMessageOption>();

  map.allIds.forEach((id) => {
    const template = map.byClientId?.[id];
    if (!isOfferableTemplate(template)) return;

    const channel = template!.channel as SendableChannel;
    const existing = byEvent.get(template!.event);

    if (existing) {
      if (!existing.channels.includes(channel)) {
        existing.channels.push(channel);
      }
      return;
    }

    byEvent.set(template!.event, {
      event: template!.event,
      label: resolveManualMessageLabel(template!.event, template!.name),
      channels: [channel],
    });
  });

  return [...byEvent.values()].filter((option) => option.channels.length > 0);
};

export const filterManualMessageOptions = (
  options: ManualMessageOption[],
  query: string,
): ManualMessageOption[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return options;

  return options.filter((option) => {
    const haystack = [option.label, option.event, ...option.channels]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
};

const readManualMetadataRecord = (
  payload: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null => {
  const manual = payload?.manual;
  if (!manual || typeof manual !== "object" || Array.isArray(manual)) {
    return null;
  }

  return manual as Record<string, unknown>;
};

/**
 * The template the operator actually sent. `event_name` is the generic
 * `order_manual_message`, so the real event lives in `payload.manual`.
 */
export const readManualTemplateEvent = (
  event: Pick<OrderEvent, "event_name" | "payload">,
): string | null => {
  const manual = readManualMetadataRecord(event.payload);
  const templateEvent = manual?.template_event;

  return typeof templateEvent === "string" && templateEvent.length > 0
    ? templateEvent
    : null;
};

export const isManualMessageAction = (action: OrderEventAction) =>
  action.action_name.startsWith("manual_");

export const isManualMessageEvent = (
  event: Pick<OrderEvent, "event_name" | "payload" | "actions">,
) =>
  event.event_name === MANUAL_MESSAGE_EVENT_NAME ||
  (Array.isArray(event.actions) && event.actions.some(isManualMessageAction));

/** `manual_order_ready_email` → `email`. */
export const readActionChannel = (
  action: OrderEventAction,
): SendableChannel | null => {
  const suffix = action.action_name.split("_").pop() ?? "";
  return isSendableChannel(suffix) ? suffix : null;
};

/**
 * Collapses every action of one send into the single state a card shows.
 * SUCCESS / FAILED / SKIPPED are all terminal — only PENDING keeps spinning.
 *
 * Channels the backend never queued (`skippedChannels`) are deliberately left
 * out of the verdict: an unconfigured SMS template must not downgrade a
 * successful email to "partial". They surface in the detail line instead.
 */
export const deriveManualMessageCardStatus = (
  tracked: TrackedManualMessageSend | null | undefined,
): ManualMessageCardStatus => {
  if (!tracked) return "idle";
  if (tracked.notFound) return "not_found";

  const actions = Object.values(tracked.actionsById);
  if (actions.length === 0) {
    return tracked.skippedChannels.length > 0 ? "skipped" : "sending";
  }

  if (actions.some((action) => action.status === "PENDING")) return "sending";

  const succeeded = actions.filter((action) => action.status === "SUCCESS");
  if (succeeded.length === actions.length) return "sent";
  if (succeeded.length > 0) return "partial";

  if (actions.some((action) => action.status === "FAILED")) return "failed";

  return "skipped";
};

export const hasPendingManualMessage = (
  tracked: TrackedManualMessageSend | null | undefined,
) =>
  Boolean(tracked) &&
  Object.values(tracked!.actionsById).some(
    (action) => action.status === "PENDING",
  );

/**
 * The detail line under a card. `last_error` is raw backend text, so it is only
 * surfaced here and in the card tooltip — never as primary copy.
 */
export const summarizeManualMessageChannels = (
  tracked: TrackedManualMessageSend | null | undefined,
): string | null => {
  if (!tracked) return null;
  if (tracked.notFound) return "Order not found";

  const parts = Object.values(tracked.actionsById).map((action) => {
    const channel = action.channel ?? "message";
    switch (action.status) {
      case "PENDING":
        return `${channel} queued`;
      case "SUCCESS":
        return `${channel} sent`;
      case "FAILED":
        return `${channel} failed`;
      default:
        return `${channel} skipped`;
    }
  });

  tracked.skippedChannels.forEach((skipped) => {
    parts.push(`${skipped.channel} not configured`);
  });

  return parts.length > 0 ? parts.join(" · ") : "Queued";
};

export const readManualMessageError = (
  tracked: TrackedManualMessageSend | null | undefined,
): string | null => {
  if (!tracked) return null;

  const failing = Object.values(tracked.actionsById).find(
    (action) => action.lastError !== null && action.status !== "SUCCESS",
  );

  return failing?.lastError ?? null;
};
