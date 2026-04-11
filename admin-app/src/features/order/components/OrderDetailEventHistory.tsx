import { useMemo, useState } from "react";

import { BoldArrowIcon, RetryIcon } from "@/assets/icons";
import {
  formatDateOnlyInTimeZone,
  formatIsoTime,
} from "@/shared/utils/formatIsoDate";
import { getTeamTimeZone } from "@/shared/utils/teamTimeZone";

import { ORDER_EVENTS } from "../domain/orderEvents";
import { useOrderEventFlow } from "../flows/orderEvent.flow";
import {
  useOrderEventsByOrderId,
  useOrderEventsLoaded,
} from "../store/orderEventHooks.store";
import type {
  OrderEvent,
  OrderEventAction,
  OrderEventActionStatus,
} from "../types/orderEvent";

type OrderDetailEventHistoryProps = {
  orderId: number | null;
};

const EVENT_LABEL_BY_KEY = new Map(
  ORDER_EVENTS.map((definition) => [definition.key, definition.label]),
);

const STATUS_TONE_CLASS: Record<OrderEventActionStatus, string> = {
  PENDING: "border-sky-300/25 bg-sky-300/[0.10] text-sky-100",
  SUCCESS: "border-emerald-300/25 bg-emerald-300/[0.12] text-emerald-100",
  FAILED: "border-rose-300/28 bg-rose-300/[0.12] text-rose-100",
  SKIPPED: "border-slate-300/25 bg-slate-300/[0.10] text-slate-100",
};

const toTimestamp = (value?: string | null) => {
  if (!value) return Number.NEGATIVE_INFINITY;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
};

const resolveActionOrderTimestamp = (action: OrderEventAction) => {
  return Math.max(
    toTimestamp(action.updated_at),
    toTimestamp(action.processed_at),
    toTimestamp(action.enqueued_at),
    toTimestamp(action.scheduled_for),
    toTimestamp(action.created_at),
  );
};

const resolveLatestAction = (event: OrderEvent): OrderEventAction | null => {
  if (!event.actions.length) return null;

  return (
    [...event.actions].sort((a, b) => {
      const diff =
        resolveActionOrderTimestamp(b) - resolveActionOrderTimestamp(a);
      if (diff !== 0) return diff;
      return (b.id ?? 0) - (a.id ?? 0);
    })[0] ?? null
  );
};

const resolveEventLabel = (eventName: string) => {
  return (
    EVENT_LABEL_BY_KEY.get(eventName as (typeof ORDER_EVENTS)[number]["key"]) ??
    eventName
  );
};

const formatOccurredAt = (value: string | null | undefined) => {
  if (!value) return "Unknown time";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  const time = formatIsoTime(value) ?? "--:--";
  const eventDay = formatDateOnlyInTimeZone(value);
  const today = formatDateOnlyInTimeZone(new Date());
  if (eventDay && today && eventDay === today) {
    return time;
  }

  const shortDate = new Intl.DateTimeFormat("en", {
    timeZone: getTeamTimeZone(),
    month: "short",
    day: "numeric",
  }).format(date);

  return `${shortDate} ${time}`;
};

const getStatusToneClass = (status: OrderEventActionStatus) =>
  STATUS_TONE_CLASS[status] ?? STATUS_TONE_CLASS.PENDING;

export const OrderDetailEventHistory = ({
  orderId,
}: OrderDetailEventHistoryProps) => {
  const { loadOrderEvents } = useOrderEventFlow();
  const orderEvents = useOrderEventsByOrderId(orderId);
  const loaded = useOrderEventsLoaded(orderId);
  const [expandedByClientId, setExpandedByClientId] = useState<
    Record<string, boolean>
  >({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const events = useMemo(() => orderEvents, [orderEvents]);

  const toggleExpanded = (clientId: string) => {
    setExpandedByClientId((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  const handleRefresh = async () => {
    if (typeof orderId !== "number" || isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    try {
      await loadOrderEvents(orderId);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div
      className="admin-glass-panel flex h-[420px] flex-col overflow-hidden rounded-[26px] border-white/10"
      style={{ boxShadow: "none" }}
    >
      <div className="admin-glass-divider flex items-center justify-between gap-3 border-b px-5 py-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
          Event History
        </p>
        <div className="flex items-center gap-2.5">
          {typeof orderId === "number" ? (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label={
                isRefreshing
                  ? "Refreshing order events"
                  : "Refresh order events"
              }
              title={
                isRefreshing
                  ? "Refreshing order events"
                  : "Refresh order events"
              }
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:bg-white/[0.08] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RetryIcon
                aria-hidden="true"
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          ) : null}

          {typeof orderId === "number" && loaded ? (
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
              {events.length} events
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex h-full flex-col overflow-y-auto px-5 py-4.5 scroll-thin">
        {typeof orderId !== "number" ? (
          <div className="flex h-full items-center justify-center rounded-[20px] border border-dashed border-white/10 bg-white/[0.025]">
            <span className="text-sm text-[var(--color-muted)]">
              Event history is available after the order has a server id.
            </span>
          </div>
        ) : null}

        {typeof orderId === "number" && !loaded ? (
          <div className="admin-glass-panel rounded-[22px] p-4 text-sm text-[var(--color-muted)]">
            Loading order events...
          </div>
        ) : null}

        {typeof orderId === "number" && loaded && events.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-[20px] border border-dashed border-white/10 bg-white/[0.025]">
            <span className="text-sm text-[var(--color-muted)]">
              No order events recorded yet.
            </span>
          </div>
        ) : null}

        {typeof orderId === "number" && loaded && events.length > 0 ? (
          <div className="relative flex flex-col gap-3 pb-1">
            <div className="pointer-events-none absolute bottom-0 left-[0.72rem] top-1 w-px bg-white/10" />
            {events.map((event) => {
              const latestAction = resolveLatestAction(event);
              const latestStatus = latestAction?.status ?? null;
              const isExpanded = expandedByClientId[event.client_id] ?? false;

              return (
                <div key={event.client_id} className="relative pl-7">
                  <div className="absolute left-[0.42rem] top-5 flex h-2.5 w-2.5 items-center justify-center rounded-full border border-white/25 bg-[var(--color-page)]">
                    {latestStatus === "PENDING" ? (
                      <span className="pointer-events-none absolute -inset-2 animate-spin rounded-full border border-sky-300/15 border-t-sky-200 border-r-sky-200/80"></span>
                    ) : null}
                  </div>

                  <div className="rounded-[20px] border border-white/10 bg-white/[0.035]">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(event.client_id)}
                      className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex max-w-full items-center truncate rounded-md">
                            <span className="truncate text-sm font-medium text-[var(--color-text)]">
                              {resolveEventLabel(event.event_name)}
                            </span>
                          </span>
                          {latestStatus ? (
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-[0.64rem] font-medium uppercase tracking-[0.16em] ${getStatusToneClass(latestStatus)}`}
                            >
                              {latestStatus}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-[var(--color-muted)]">
                          {formatOccurredAt(event.occurred_at)}
                        </p>
                      </div>

                      <BoldArrowIcon
                        className={`mt-1 h-3 w-3 shrink-0 text-[var(--color-muted)] transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </button>

                    {isExpanded ? (
                      <div className="border-t border-white/8 px-4 py-3">
                        {event.actions.length ? (
                          <div className="flex flex-col gap-2.5">
                            {event.actions.map((action) => (
                              <div
                                key={action.id}
                                className="rounded-[16px] border border-white/10 bg-[var(--color-surface-secondary)]/35 px-3 py-2.5"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-xs font-medium text-[var(--color-text)]">
                                    {action.action_name}
                                  </p>
                                  <span
                                    className={`inline-flex rounded-full border px-2 py-0.5 text-[0.62rem] font-medium uppercase tracking-[0.14em] ${getStatusToneClass(action.status)}`}
                                  >
                                    {action.status}
                                  </span>
                                </div>

                                <div className="mt-1.5 flex flex-col gap-1 text-xs text-[var(--color-muted)]">
                                  <span>Attempts: {action.attempts}</span>
                                  {action.scheduled_for ? (
                                    <span>
                                      Scheduled:{" "}
                                      {formatOccurredAt(action.scheduled_for)}
                                    </span>
                                  ) : null}
                                  {action.last_error ? (
                                    <span className="text-rose-200">
                                      Error: {action.last_error}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-[16px] border border-dashed border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-[var(--color-muted)]">
                            No actions registered for this event.
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};
