import {
  formatDateOnlyInTimeZone,
  formatIsoTime,
} from "@/shared/utils/formatIsoDate";
import { getTeamTimeZone } from "@/shared/utils/teamTimeZone";

import type {
  OrderEvent,
  OrderEventAction,
  OrderEventActionStatus,
} from "../types/orderEvent";
import {
  mapOrderEventChangeToViewModel,
  summarizeOrderEventChanges,
  type OrderEventChangeViewModel,
} from "./orderEventChange.domain";
import {
  mapOrderEventActorToViewModel,
  type OrderEventActorViewModel,
} from "./orderEventActor.domain";
import { ORDER_EVENTS } from "./orderEvents";

export type OrderEventTone = "neutral" | "info" | "success" | "warning" | "danger";

export type OrderEventActionViewModel = {
  id: number;
  label: string;
  channel: string | null;
  status: OrderEventActionStatus;
  attempts: number;
  scheduledFor: string | null;
  error: string | null;
};

export type OrderEventActionSummaryViewModel = {
  countLabel: string;
  status: OrderEventActionStatus;
  statusLabel: string;
};

export type OrderEventTimelineItemViewModel = {
  clientId: string;
  label: string;
  detail: string | null;
  time: string;
  tone: OrderEventTone;
  actor: OrderEventActorViewModel;
  changes: OrderEventChangeViewModel[];
  changeCountLabel: string | null;
  actions: OrderEventActionViewModel[];
  actionSummary: OrderEventActionSummaryViewModel | null;
  hasPendingAction: boolean;
};

export type OrderEventTimelineGroupViewModel = {
  key: string;
  label: string;
  items: OrderEventTimelineItemViewModel[];
};

const CLIENT_FORM_SUBMITTED_EVENT = "client_form_submitted";

const NON_TEMPLATE_EVENT_LABELS: Record<string, string> = {
  order_edited: "Order edited",
  order_status_changed: "Status changed",
  order_delivery_window_changed_by_user: "Delivery window changed",
  order_manual_message: "Manual message sent",
};

const EVENT_LABEL_BY_KEY = new Map<string, string>([
  ...ORDER_EVENTS.map(
    (definition) => [definition.key, definition.label] as [string, string],
  ),
  ...Object.entries(NON_TEMPLATE_EVENT_LABELS),
]);

const EVENT_TONE_BY_KEY: Record<string, OrderEventTone> = {
  order_created: "info",
  order_confirmed: "info",
  order_processing: "info",
  client_form_link_sent: "info",
  order_manual_message: "info",
  order_completed: "success",
  client_form_submitted: "success",
  order_rescheduled: "warning",
  order_delivery_plan_changed: "warning",
  order_delivery_window_changed_by_user: "warning",
  order_failed: "danger",
  order_cancelled: "danger",
};

const ACTION_STATUS_LABEL: Record<OrderEventActionStatus, string> = {
  PENDING: "Pending",
  SUCCESS: "Done",
  FAILED: "Failed",
  SKIPPED: "Skipped",
};

const ACTION_CHANNEL_SUFFIXES: Array<[string, string]> = [
  ["_sms", "SMS"],
  ["_email", "Email"],
];

const capitalize = (value: string) =>
  value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const humanize = (value: string) => capitalize(value.replace(/_/g, " ").trim());

const toTimestamp = (value?: string | null) => {
  if (!value) return Number.NEGATIVE_INFINITY;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
};

const resolveEventLabel = (eventName: string) =>
  EVENT_LABEL_BY_KEY.get(eventName) ?? humanize(eventName);

const resolveEventDetail = (event: OrderEvent): string | null => {
  const payload = event.payload ?? {};

  if (event.event_name === "order_status_changed") {
    const stateName = payload.new_order_state_name;
    return typeof stateName === "string" && stateName.trim()
      ? `Moved to ${stateName.trim()}`
      : null;
  }

  if (event.event_name === "order_edited") {
    const sections = payload.changed_sections;
    if (!Array.isArray(sections)) return null;
    const names = sections.filter(
      (section): section is string =>
        typeof section === "string" && section.trim().length > 0,
    );
    return names.length > 0
      ? `Updated ${names.map((name) => humanize(name).toLowerCase()).join(", ")}`
      : null;
  }

  return null;
};

const formatScheduledFor = (value: string | null) => {
  if (!value) return null;
  const time = formatIsoTime(value);
  if (!time) return null;

  const day = formatDateOnlyInTimeZone(value);
  if (day && day === formatDateOnlyInTimeZone(new Date())) return time;

  const shortDate = new Intl.DateTimeFormat("en", {
    timeZone: getTeamTimeZone(),
    month: "short",
    day: "numeric",
  }).format(new Date(value));
  return `${shortDate}, ${time}`;
};

const mapActionToViewModel = (
  action: OrderEventAction,
): OrderEventActionViewModel => {
  const rawName =
    typeof action.action_name === "string" ? action.action_name.trim() : "";
  const channelMatch = ACTION_CHANNEL_SUFFIXES.find(([suffix]) =>
    rawName.endsWith(suffix),
  );
  const baseName = channelMatch
    ? rawName.slice(0, -channelMatch[0].length)
    : rawName;

  return {
    id: action.id,
    label: baseName ? humanize(baseName) : "Unnamed action",
    channel: channelMatch ? channelMatch[1] : null,
    status: action.status,
    attempts: action.attempts,
    scheduledFor:
      action.status === "PENDING" ? formatScheduledFor(action.scheduled_for) : null,
    error: action.last_error,
  };
};

const resolveActionOrderTimestamp = (action: OrderEventAction) =>
  Math.max(
    toTimestamp(action.updated_at),
    toTimestamp(action.processed_at),
    toTimestamp(action.enqueued_at),
    toTimestamp(action.scheduled_for),
    toTimestamp(action.created_at),
  );

const sortActionsNewestFirst = (actions: OrderEventAction[]) =>
  [...actions].sort((a, b) => {
    const diff =
      resolveActionOrderTimestamp(b) - resolveActionOrderTimestamp(a);
    if (diff !== 0) return diff;
    return (b.id ?? 0) - (a.id ?? 0);
  });

const resolveActionSummary = (
  actions: OrderEventActionViewModel[],
): OrderEventActionSummaryViewModel | null => {
  if (actions.length === 0) return null;

  const countLabel = `${actions.length} ${actions.length === 1 ? "action" : "actions"}`;
  const failed = actions.filter((action) => action.status === "FAILED").length;
  if (failed > 0) {
    return { countLabel, status: "FAILED", statusLabel: `${failed} failed` };
  }

  const pending = actions.filter((action) => action.status === "PENDING").length;
  if (pending > 0) {
    return { countLabel, status: "PENDING", statusLabel: `${pending} pending` };
  }

  const succeeded = actions.some((action) => action.status === "SUCCESS");
  return succeeded
    ? { countLabel, status: "SUCCESS", statusLabel: "Done" }
    : { countLabel, status: "SKIPPED", statusLabel: "Skipped" };
};

export const formatOrderEventActionStatus = (status: OrderEventActionStatus) =>
  ACTION_STATUS_LABEL[status] ?? humanize(status.toLowerCase());

const resolveDayLabel = (dayKey: string, sampleIso: string) => {
  const today = formatDateOnlyInTimeZone(new Date());
  if (dayKey === today) return "Today";

  const yesterday = formatDateOnlyInTimeZone(
    new Date(Date.now() - 24 * 60 * 60 * 1000),
  );
  if (dayKey === yesterday) return "Yesterday";

  const date = new Date(sampleIso);
  const sameYear = dayKey.slice(0, 4) === today?.slice(0, 4);
  return new Intl.DateTimeFormat("en", {
    timeZone: getTeamTimeZone(),
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(date);
};

const mapEventToTimelineItem = (
  event: OrderEvent,
): OrderEventTimelineItemViewModel => {
  const actions = sortActionsNewestFirst(event.actions ?? []).map(
    mapActionToViewModel,
  );
  const allChanges = (event.changes ?? []).map(mapOrderEventChangeToViewModel);
  // A customer's submission lists what they corrected; fields they filled for
  // the first time stay in the audit log but are not the story of the event.
  const changes =
    event.event_name === CLIENT_FORM_SUBMITTED_EVENT
      ? allChanges.filter((change) => change.replacesValue)
      : allChanges;

  return {
    clientId: event.client_id,
    label: resolveEventLabel(event.event_name),
    detail: summarizeOrderEventChanges(changes) ?? resolveEventDetail(event),
    time: formatIsoTime(event.occurred_at) ?? "--:--",
    tone: EVENT_TONE_BY_KEY[event.event_name] ?? "neutral",
    actor: mapOrderEventActorToViewModel(event),
    changes,
    changeCountLabel:
      changes.length > 0
        ? `${changes.length} ${changes.length === 1 ? "change" : "changes"}`
        : null,
    actions,
    actionSummary: resolveActionSummary(actions),
    hasPendingAction: actions.some((action) => action.status === "PENDING"),
  };
};

/**
 * A client-form submission also emits an `order_edited` event so open admin
 * and driver views refresh; its changes live on the submission. On its own it
 * would only repeat the submission as an empty "Order edited" row.
 */
const isClientSubmissionCompanionEdit = (event: OrderEvent) =>
  event.event_name === "order_edited" &&
  event.origin === "client" &&
  (event.changes ?? []).length === 0;

export const mapOrderEventsToTimelineViewModel = (
  events: OrderEvent[],
): OrderEventTimelineGroupViewModel[] => {
  const groups: OrderEventTimelineGroupViewModel[] = [];
  const groupByKey = new Map<string, OrderEventTimelineGroupViewModel>();

  events.forEach((event) => {
    if (isClientSubmissionCompanionEdit(event)) return;

    const dayKey = formatDateOnlyInTimeZone(event.occurred_at) ?? "unknown";
    let group = groupByKey.get(dayKey);
    if (!group) {
      group = {
        key: dayKey,
        label:
          dayKey === "unknown"
            ? "Unknown date"
            : resolveDayLabel(dayKey, event.occurred_at),
        items: [],
      };
      groupByKey.set(dayKey, group);
      groups.push(group);
    }
    group.items.push(mapEventToTimelineItem(event));
  });

  return groups;
};
