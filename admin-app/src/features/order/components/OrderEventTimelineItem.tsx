import { ChevronDownIcon } from "@/assets/icons";

import type {
  OrderEventActorKind,
  OrderEventActorViewModel,
} from "../domain/orderEventActor.domain";
import type {
  OrderEventChangeKind,
  OrderEventChangeViewModel,
} from "../domain/orderEventChange.domain";
import {
  formatOrderEventActionStatus,
  type OrderEventActionViewModel,
  type OrderEventTimelineItemViewModel,
  type OrderEventTone,
} from "../domain/orderEventTimeline.domain";
import type { OrderEventActionStatus } from "../types/orderEvent";

type OrderEventTimelineItemProps = {
  item: OrderEventTimelineItemViewModel;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: (clientId: string) => void;
};

const NODE_TONE_CLASS: Record<OrderEventTone, string> = {
  neutral: "bg-border-accent",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const NODE_HALO_CLASS: Record<OrderEventTone, string> = {
  neutral: "bg-surface-hover",
  info: "bg-info-bg",
  success: "bg-success-bg",
  warning: "bg-warning-bg",
  danger: "bg-danger-bg",
};

const STATUS_TEXT_CLASS: Record<OrderEventActionStatus, string> = {
  PENDING: "text-info",
  SUCCESS: "text-success",
  FAILED: "text-danger",
  SKIPPED: "text-muted",
};

const STATUS_DOT_CLASS: Record<OrderEventActionStatus, string> = {
  PENDING: "bg-info",
  SUCCESS: "bg-success",
  FAILED: "bg-danger",
  SKIPPED: "bg-border-accent",
};

const CHANGE_DOT_CLASS: Record<OrderEventChangeKind, string> = {
  changed: "bg-border-accent",
  added: "bg-success",
  removed: "bg-danger",
};

const DrawerSectionHeading = ({ children }: { children: string }) => (
  <p className="px-3 pt-2.5 pb-1 text-[0.6rem] font-medium uppercase tracking-[0.16em] text-faint">
    {children}
  </p>
);

const OrderEventChangeRow = ({
  change,
}: {
  change: OrderEventChangeViewModel;
}) => (
  <li className="flex flex-col gap-1 px-3 py-2">
    <div className="flex min-w-0 items-center gap-2">
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${CHANGE_DOT_CLASS[change.kind]}`}
      />
      <span className="shrink-0 text-xs font-medium text-text">
        {change.label}
      </span>
      {change.scope ? (
        <span className="min-w-0 truncate rounded-md bg-surface-hover px-1.5 py-px text-[0.6rem] font-medium text-muted">
          {change.scope}
        </span>
      ) : null}
    </div>

    {change.from || change.to ? (
      <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 pl-3.5 text-xs [overflow-wrap:anywhere]">
        {change.from ? (
          <span className="text-muted line-through decoration-[var(--color-faint)]">
            <span className="sr-only">from </span>
            {change.from}
          </span>
        ) : null}
        {change.from && change.to ? (
          <span aria-hidden="true" className="text-faint">
            →
          </span>
        ) : null}
        {change.to ? (
          <span className="text-text">
            <span className="sr-only">to </span>
            {change.to}
          </span>
        ) : null}
      </p>
    ) : null}
  </li>
);

const ACTOR_AVATAR_CLASS: Record<OrderEventActorKind, string> = {
  user: "bg-surface-hover text-text",
  client: "bg-info-bg text-info",
  system: "",
};

const OrderEventActorChip = ({
  actor,
}: {
  actor: OrderEventActorViewModel;
}) => (
  <span className="inline-flex min-w-0 items-center gap-1.5 text-xs">
    {actor.kind === "system" ? (
      <span
        aria-hidden="true"
        className="h-4 w-4 shrink-0 rounded-full border border-dashed border-border-accent"
      />
    ) : (
      <span
        aria-hidden="true"
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.55rem] font-semibold ${ACTOR_AVATAR_CLASS[actor.kind]}`}
      >
        {actor.initial}
      </span>
    )}
    <span
      className={`truncate ${actor.kind === "system" ? "text-muted" : "font-medium text-text"}`}
    >
      {actor.name}
    </span>
    {actor.roleLabel ? (
      <span className="shrink-0 rounded-full border border-border-subtle px-1.5 py-px text-[0.58rem] font-medium uppercase tracking-[0.14em] text-muted">
        {actor.roleLabel}
      </span>
    ) : null}
  </span>
);

const OrderEventActionRow = ({
  action,
}: {
  action: OrderEventActionViewModel;
}) => (
  <li className="flex flex-col gap-1 px-3 py-2.5">
    <div className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_CLASS[action.status]}`}
      />
      <span className="min-w-0 flex-1 truncate text-xs text-text">
        {action.label}
      </span>
      {action.channel ? (
        <span className="shrink-0 rounded-md bg-surface-hover px-1.5 py-px text-[0.6rem] font-medium uppercase tracking-[0.12em] text-muted">
          {action.channel}
        </span>
      ) : null}
      <span
        className={`shrink-0 text-[0.68rem] font-medium ${STATUS_TEXT_CLASS[action.status]}`}
      >
        {formatOrderEventActionStatus(action.status)}
      </span>
    </div>

    {action.attempts > 1 || action.scheduledFor || action.error ? (
      <div className="flex flex-col gap-0.5 pl-3.5 text-[0.68rem] text-muted">
        {action.attempts > 1 ? <span>{action.attempts} attempts</span> : null}
        {action.scheduledFor ? (
          <span>Scheduled for {action.scheduledFor}</span>
        ) : null}
        {action.error ? (
          <span className="break-words text-danger">{action.error}</span>
        ) : null}
      </div>
    ) : null}
  </li>
);

export const OrderEventTimelineItem = ({
  item,
  isLast,
  isExpanded,
  onToggle,
}: OrderEventTimelineItemProps) => {
  const drawerId = `order-event-actions-${item.clientId}`;

  return (
    <li className="relative flex gap-3">
      <div className="relative flex w-4 shrink-0 flex-col items-center">
        <span className="relative mt-[0.3rem] flex h-4 w-4 items-center justify-center">
          <span
            aria-hidden="true"
            className={`absolute inset-0 rounded-full ${NODE_HALO_CLASS[item.tone]} ${item.hasPendingAction ? "animate-ping opacity-60" : ""}`}
          />
          <span
            aria-hidden="true"
            className={`relative h-2 w-2 rounded-full ${NODE_TONE_CLASS[item.tone]}`}
          />
        </span>
        {!isLast ? (
          <span aria-hidden="true" className="mt-1 w-px flex-1 bg-border" />
        ) : null}
      </div>

      <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-5"}`}>
        <div className="flex items-baseline justify-between gap-3">
          <p className="min-w-0 truncate text-sm font-medium text-text">
            {item.label}
          </p>
          <time className="shrink-0 text-[0.7rem] tabular-nums text-faint">
            {item.time}
          </time>
        </div>

        {item.detail ? (
          <p className="mt-0.5 text-xs text-muted">{item.detail}</p>
        ) : null}

        <div className="mt-1.5">
          <OrderEventActorChip actor={item.actor} />
        </div>

        {item.changeCountLabel || item.actionSummary ? (
          <div className="mt-2.5 overflow-hidden rounded-xl border border-border-subtle bg-surface-subtle">
            <button
              type="button"
              onClick={() => onToggle(item.clientId)}
              aria-expanded={isExpanded}
              aria-controls={drawerId}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-surface-hover"
            >
              {item.changeCountLabel ? (
                <span className="text-muted">{item.changeCountLabel}</span>
              ) : null}
              {item.changeCountLabel && item.actionSummary ? (
                <span aria-hidden="true" className="text-faint">
                  ·
                </span>
              ) : null}
              {item.actionSummary ? (
                <>
                  <span className="text-muted">
                    {item.actionSummary.countLabel}
                  </span>
                  <span aria-hidden="true" className="text-faint">
                    ·
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 font-medium ${STATUS_TEXT_CLASS[item.actionSummary.status]}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASS[item.actionSummary.status]}`}
                    />
                    {item.actionSummary.statusLabel}
                  </span>
                </>
              ) : null}
              <ChevronDownIcon
                aria-hidden="true"
                className={`ml-auto h-3 w-3 shrink-0 text-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              />
            </button>

            <div
              id={drawerId}
              inert={!isExpanded}
              className={`grid transition-[grid-template-rows] duration-200 ease-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="min-h-0 overflow-hidden">
                {item.changes.length > 0 ? (
                  <section className="border-t border-border-subtle pb-1">
                    <DrawerSectionHeading>Changes</DrawerSectionHeading>
                    <ul>
                      {item.changes.map((change) => (
                        <OrderEventChangeRow key={change.id} change={change} />
                      ))}
                    </ul>
                  </section>
                ) : null}
                {item.actions.length > 0 ? (
                  <section className="border-t border-border-subtle">
                    {item.changes.length > 0 ? (
                      <DrawerSectionHeading>Actions</DrawerSectionHeading>
                    ) : null}
                    <ul className="divide-y divide-border-subtle">
                      {item.actions.map((action) => (
                        <OrderEventActionRow key={action.id} action={action} />
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
};
