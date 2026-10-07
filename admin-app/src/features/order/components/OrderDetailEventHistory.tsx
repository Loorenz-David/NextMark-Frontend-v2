import { useEffect, useMemo, useRef, useState } from "react";

import { RetryIcon } from "@/assets/icons";

import { mapOrderEventsToTimelineViewModel } from "../domain/orderEventTimeline.domain";
import { useOrderEventFlow } from "../flows/orderEvent.flow";
import {
  useOrderEventsByOrderId,
  useOrderEventsLoaded,
} from "../store/orderEventHooks.store";
import { OrderEventTimelineItem } from "./OrderEventTimelineItem";

type OrderDetailEventHistoryProps = {
  orderId: number | null;
  /** Server event id to open expanded, scrolled to and briefly highlighted. */
  focusEventId?: string | null;
};

const FOCUS_HIGHLIGHT_MS = 2500;
const FOCUS_SCROLL_OFFSET_PX = 12;

export const OrderDetailEventHistory = ({
  orderId,
  focusEventId = null,
}: OrderDetailEventHistoryProps) => {
  const { loadOrderEvents } = useOrderEventFlow();
  const orderEvents = useOrderEventsByOrderId(orderId);
  const loaded = useOrderEventsLoaded(orderId);
  const [expandedByClientId, setExpandedByClientId] = useState<
    Record<string, boolean>
  >({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [settledFocusEventId, setSettledFocusEventId] = useState<
    string | null
  >(null);
  const listRef = useRef<HTMLDivElement>(null);
  const scrolledFocusEventIdRef = useRef<string | null>(null);

  const timelineGroups = useMemo(
    () => mapOrderEventsToTimelineViewModel(orderEvents),
    [orderEvents],
  );
  const visibleEventCount = timelineGroups.reduce(
    (count, group) => count + group.items.length,
    0,
  );

  // The focused entry may arrive after the first load (a realtime refresh),
  // so it is looked up on every timeline change until it is found.
  const focusClientId = useMemo(() => {
    if (!focusEventId) return null;
    for (const group of timelineGroups) {
      const match = group.items.find((item) => item.eventId === focusEventId);
      if (match) return match.clientId;
    }
    return null;
  }, [focusEventId, timelineGroups]);

  useEffect(() => {
    if (
      !focusEventId ||
      !focusClientId ||
      scrolledFocusEventIdRef.current === focusEventId
    ) {
      return;
    }
    scrolledFocusEventIdRef.current = focusEventId;

    // Scroll only this panel's list: scrollIntoView would also move the
    // carousel track the panel sits in.
    const container = listRef.current;
    const entry = container?.querySelector<HTMLElement>(
      `[data-order-event-id="${CSS.escape(focusEventId)}"]`,
    );
    if (container && entry) {
      const top =
        entry.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop -
        FOCUS_SCROLL_OFFSET_PX;
      container.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }

    const timeoutId = window.setTimeout(
      () => setSettledFocusEventId(focusEventId),
      FOCUS_HIGHLIGHT_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [focusClientId, focusEventId]);

  const isExpanded = (clientId: string) =>
    expandedByClientId[clientId] ?? clientId === focusClientId;

  const toggleExpanded = (clientId: string) => {
    setExpandedByClientId((prev) => ({
      ...prev,
      [clientId]: !(prev[clientId] ?? clientId === focusClientId),
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
    <div className="admin-glass-panel flex h-[420px] flex-col overflow-hidden rounded-3xl border-border shadow-md!">
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
              className="inline-flex items-center rounded-full border border-border bg-surface-raised px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:bg-surface-hover hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RetryIcon
                aria-hidden="true"
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          ) : null}

          {typeof orderId === "number" && loaded ? (
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
              {visibleEventCount} events
            </span>
          ) : null}
        </div>
      </div>

      <div
        ref={listRef}
        className="flex h-full flex-col overflow-y-auto px-5 py-4.5 scroll-thin"
      >
        {typeof orderId !== "number" ? (
          <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-border bg-surface-subtle">
            <span className="text-sm text-[var(--color-muted)]">
              Event history is available after the order has a server id.
            </span>
          </div>
        ) : null}

        {typeof orderId === "number" && !loaded ? (
          <ol aria-busy="true" aria-label="Loading order events" className="flex flex-col gap-5">
            {[0, 1, 2].map((row) => (
              <li key={row} className="flex animate-pulse gap-3">
                <span className="mt-1 h-4 w-4 shrink-0 rounded-full bg-surface-hover" />
                <div className="flex flex-1 flex-col gap-2">
                  <span className="h-3 w-2/5 rounded-full bg-surface-hover" />
                  <span className="h-2.5 w-1/4 rounded-full bg-surface-hover" />
                </div>
              </li>
            ))}
          </ol>
        ) : null}

        {typeof orderId === "number" && loaded && orderEvents.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-border bg-surface-subtle">
            <span className="text-sm text-[var(--color-muted)]">
              No order events recorded yet.
            </span>
          </div>
        ) : null}

        {typeof orderId === "number" && loaded && orderEvents.length > 0 ? (
          <div className="flex flex-col gap-5 pb-1">
            {timelineGroups.map((group) => (
              <section key={group.key} aria-label={group.label}>
                <p className="mb-3 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-faint">
                  {group.label}
                </p>
                <ol className="flex flex-col">
                  {group.items.map((item, index) => (
                    <OrderEventTimelineItem
                      key={item.clientId}
                      item={item}
                      isLast={index === group.items.length - 1}
                      isExpanded={isExpanded(item.clientId)}
                      isHighlighted={
                        item.clientId === focusClientId &&
                        settledFocusEventId !== focusEventId
                      }
                      onToggle={toggleExpanded}
                    />
                  ))}
                </ol>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};
