import {
  PLAN_TYPE_LABELS,
  isPlanType,
} from "@/features/plan/domain/planType";
import type { RoutePlanObjective } from "@/features/plan/types/plan";

import type { OrderQueryFilters } from "../types/orderMeta";

/**
 * Pure mapping between the backend order query (`OrderQueryFilters`) and the
 * draft the filter panel edits. The schedule mode is a tri-state, so the
 * scheduled/unscheduled flags can never conflict by construction.
 */

export type OrderScheduleMode = "all" | "unscheduled" | "scheduled";

/** Sentinel the backend accepts inside `plan_type` for orders with no objective. */
export const NO_PLAN_TYPE = "none" as const;
export type OrderPlanTypeFilter = RoutePlanObjective | typeof NO_PLAN_TYPE;

export const isOrderPlanTypeFilter = (value: unknown): value is OrderPlanTypeFilter =>
  value === NO_PLAN_TYPE || isPlanType(value);

export const ORDER_PLAN_TYPE_FILTER_LABELS: Record<OrderPlanTypeFilter, string> = {
  ...PLAN_TYPE_LABELS,
  [NO_PLAN_TYPE]: "No plan type",
};

export type OrderFilterDraft = {
  schedule: OrderScheduleMode;
  /** YYYY-MM-DD, only meaningful when `schedule === "scheduled"`. */
  scheduleFrom: string | null;
  scheduleTo: string | null;
  /** Order state names; the backend resolves names to ids. */
  orderStates: string[];
  planTypes: OrderPlanTypeFilter[];
  /** Backend semantics are exclusive: archived only, not archived included. */
  archivedOnly: boolean;
};

export const DEFAULT_ORDER_FILTER_DRAFT: OrderFilterDraft = {
  schedule: "unscheduled",
  scheduleFrom: null,
  scheduleTo: null,
  orderStates: [],
  planTypes: [],
  archivedOnly: false,
};

export const ORDER_FILTER_PANEL_KEYS = [
  "schedule_order",
  "unschedule_order",
  "order_schedule_from",
  "order_schedule_to",
  "order_state",
  "plan_type",
  "show_archived",
] as const;

export type OrderFilterPanelKey = (typeof ORDER_FILTER_PANEL_KEYS)[number];

const PANEL_KEY_SET: ReadonlySet<string> = new Set(ORDER_FILTER_PANEL_KEYS);

export const isOrderFilterPanelKey = (key: string): key is OrderFilterPanelKey =>
  PANEL_KEY_SET.has(key);

const toBoolean = (value: unknown): boolean =>
  value === true || value === "true" || value === 1 || value === "1";

const toDateString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toStringList = (value: unknown): string[] => {
  const raw = Array.isArray(value) ? value : value == null ? [] : [value];
  return raw
    .map((entry) => String(entry).trim())
    .filter((entry) => entry.length > 0);
};

const unique = <T,>(values: T[]): T[] => Array.from(new Set(values));

export const draftFromOrderQueryFilters = (
  filters: Partial<OrderQueryFilters> | undefined,
): OrderFilterDraft => {
  const source = filters ?? {};
  const scheduleFrom = toDateString(source.order_schedule_from);
  const scheduleTo = toDateString(source.order_schedule_to);

  let schedule: OrderScheduleMode = "all";
  if (toBoolean(source.schedule_order) || scheduleFrom || scheduleTo) {
    schedule = "scheduled";
  } else if (toBoolean(source.unschedule_order)) {
    schedule = "unscheduled";
  }

  return {
    schedule,
    scheduleFrom: schedule === "scheduled" ? scheduleFrom : null,
    scheduleTo: schedule === "scheduled" ? scheduleTo : null,
    orderStates: unique(toStringList(source.order_state)),
    planTypes: unique(toStringList(source.plan_type).filter(isOrderPlanTypeFilter)),
    archivedOnly: toBoolean(source.show_archived),
  };
};

export const orderQueryFiltersFromDraft = (
  draft: OrderFilterDraft,
): OrderQueryFilters => {
  const next: OrderQueryFilters = {};

  if (draft.schedule === "unscheduled") {
    next.unschedule_order = true;
  } else if (draft.schedule === "scheduled") {
    next.schedule_order = true;
    if (draft.scheduleFrom) next.order_schedule_from = draft.scheduleFrom;
    if (draft.scheduleTo) next.order_schedule_to = draft.scheduleTo;
  }

  if (draft.orderStates.length > 0) {
    next.order_state = [...draft.orderStates];
  }
  if (draft.planTypes.length > 0) {
    next.plan_type = [...draft.planTypes];
  }
  if (draft.archivedOnly) {
    next.show_archived = true;
  }

  return next;
};

/** Keys the panel does not own (search columns, sort, cursors, AI-only ids). */
const pickPassthroughFilters = (
  filters: Partial<OrderQueryFilters> | undefined,
): Partial<OrderQueryFilters> =>
  Object.fromEntries(
    Object.entries(filters ?? {}).filter(
      ([key, value]) =>
        !isOrderFilterPanelKey(key) &&
        value !== undefined &&
        value !== null &&
        value !== "",
    ),
  ) as Partial<OrderQueryFilters>;

/**
 * Invariant enforcement for every writer of the order query store (panel,
 * pills, AI panel, tests): panel-owned keys are round-tripped through the
 * draft, everything else passes through untouched.
 */
export const normalizeOrderQueryFilters = (
  filters: Partial<OrderQueryFilters> | undefined,
): OrderQueryFilters => ({
  ...pickPassthroughFilters(filters),
  ...orderQueryFiltersFromDraft(draftFromOrderQueryFilters(filters)),
});

/** One unit per visible pill, so the badge and the pill row always agree. */
export const countActiveOrderFilters = (draft: OrderFilterDraft): number =>
  (draft.schedule === "all" ? 0 : 1) +
  (draft.scheduleFrom ? 1 : 0) +
  (draft.scheduleTo ? 1 : 0) +
  draft.orderStates.length +
  draft.planTypes.length +
  (draft.archivedOnly ? 1 : 0);

export const isSameOrderFilterDraft = (
  left: OrderFilterDraft,
  right: OrderFilterDraft,
): boolean =>
  left.schedule === right.schedule &&
  left.scheduleFrom === right.scheduleFrom &&
  left.scheduleTo === right.scheduleTo &&
  left.archivedOnly === right.archivedOnly &&
  left.orderStates.length === right.orderStates.length &&
  left.orderStates.every((state) => right.orderStates.includes(state)) &&
  left.planTypes.length === right.planTypes.length &&
  left.planTypes.every((type) => right.planTypes.includes(type));

/**
 * Pill removal. Removing "Scheduled" also clears the date range, because the
 * range only means something for scheduled orders. Removing one date keeps
 * the mode. Array items are removed one at a time; `value` undefined clears
 * the whole list.
 */
export const removeOrderFilterEntry = (
  filters: Partial<OrderQueryFilters> | undefined,
  key: string,
  value?: unknown,
): OrderQueryFilters => {
  if (!isOrderFilterPanelKey(key)) {
    const rest = { ...(filters ?? {}) } as Record<string, unknown>;
    delete rest[key];
    return normalizeOrderQueryFilters(rest as Partial<OrderQueryFilters>);
  }

  const draft = draftFromOrderQueryFilters(filters);
  let next: OrderFilterDraft = draft;

  switch (key) {
    case "schedule_order":
      next = { ...draft, schedule: "all", scheduleFrom: null, scheduleTo: null };
      break;
    case "unschedule_order":
      next = { ...draft, schedule: "all" };
      break;
    case "order_schedule_from":
      next = { ...draft, scheduleFrom: null };
      break;
    case "order_schedule_to":
      next = { ...draft, scheduleTo: null };
      break;
    case "order_state":
      next = {
        ...draft,
        orderStates:
          value === undefined
            ? []
            : draft.orderStates.filter((state) => state !== String(value)),
      };
      break;
    case "plan_type":
      next = {
        ...draft,
        planTypes:
          value === undefined
            ? []
            : draft.planTypes.filter((type) => type !== String(value)),
      };
      break;
    case "show_archived":
      next = { ...draft, archivedOnly: false };
      break;
  }

  return {
    ...pickPassthroughFilters(filters),
    ...orderQueryFiltersFromDraft(next),
  };
};

export type OrderFilterDraftSummary = {
  schedule: string;
  orderStates: string;
  planTypes: string;
  archive: string;
};

/** Short, human summaries shown on collapsed drawers. */
export const summarizeOrderFilterDraft = (
  draft: OrderFilterDraft,
): OrderFilterDraftSummary => {
  let schedule = "All orders";
  if (draft.schedule === "unscheduled") schedule = "Unscheduled";
  if (draft.schedule === "scheduled") {
    const range = [
      draft.scheduleFrom ? `from ${draft.scheduleFrom}` : null,
      draft.scheduleTo ? `to ${draft.scheduleTo}` : null,
    ]
      .filter(Boolean)
      .join(" ");
    schedule = range ? `Scheduled ${range}` : "Scheduled";
  }

  const orderStates =
    draft.orderStates.length === 0
      ? "Any state"
      : draft.orderStates.length <= 2
        ? draft.orderStates.join(", ")
        : `${draft.orderStates.length} states`;

  const planTypes =
    draft.planTypes.length === 0
      ? "Any type"
      : draft.planTypes.map((type) => ORDER_PLAN_TYPE_FILTER_LABELS[type]).join(", ");

  return {
    schedule,
    orderStates,
    planTypes,
    archive: draft.archivedOnly ? "Archived only" : "Active orders",
  };
};
