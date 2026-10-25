import type { DeliveryPlan } from "@/features/plan/types/plan";

/** YYYY-MM-DD, the canonical key for one calendar day. */
export type CalendarDayKey = string;

export type CalendarMonthCursor = {
  year: number;
  /** 1-12 */
  month: number;
};

/** A date filter on the calendar: one day, or `fromKey`..`toKey` inclusive. */
export type CalendarDateFilter = {
  fromKey: CalendarDayKey;
  toKey: CalendarDayKey | null;
};

export type CalendarDayCellModel = {
  dateKey: CalendarDayKey;
  dayNumber: number;
  /** Inside the period in focus: the cursor month, or the date filter. */
  inMonth: boolean;
  isToday: boolean;
  isPast: boolean;
};

export const getCalendarVolumeLoadPercent = (
  totalVolumeCm3: number | null | undefined,
  assignedVehicleCapacityCm3: number | null | undefined,
): number => {
  const safeVolumeCm3 =
    typeof totalVolumeCm3 === "number" && Number.isFinite(totalVolumeCm3)
      ? Math.max(0, totalVolumeCm3)
      : 0;
  const safeCapacityCm3 =
    typeof assignedVehicleCapacityCm3 === "number" &&
    Number.isFinite(assignedVehicleCapacityCm3)
      ? Math.max(0, assignedVehicleCapacityCm3)
      : 0;

  if (safeCapacityCm3 === 0) return 0;

  return Math.min(
    100,
    Math.round((safeVolumeCm3 / safeCapacityCm3) * 100),
  );
};

/**
 * Adds capacity once per route assignment. Repeated vehicle ids are
 * intentional: one vehicle assigned to two routes provides two route loads.
 */
export const getAssignedVehicleVolumeCapacityCm3 = (
  assignedVehicleIds: Array<number | null>,
  capacityByVehicleId: ReadonlyMap<number, number | null>,
): number | null => {
  if (assignedVehicleIds.length === 0) return null;

  let totalCapacityCm3 = 0;
  for (const vehicleId of assignedVehicleIds) {
    if (typeof vehicleId !== "number") return null;
    const capacityCm3 = capacityByVehicleId.get(vehicleId);
    if (
      typeof capacityCm3 !== "number" ||
      !Number.isFinite(capacityCm3) ||
      capacityCm3 <= 0
    ) {
      return null;
    }
    totalCapacityCm3 += capacityCm3;
  }

  return totalCapacityCm3;
};

const DAY_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const parseDayKeyParts = (
  value: string | null | undefined,
): { year: number; month: number; day: number } | null => {
  if (!value) return null;
  const dateOnly = value.split(/[T\s]/)[0] ?? "";
  const match = DAY_KEY_PATTERN.exec(dateOnly);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
};

const toDayKeyFromUtc = (date: Date): CalendarDayKey => {
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Normalizes any ISO-ish date string to its YYYY-MM-DD day key, or null. */
export const toCalendarDayKey = (
  value: string | null | undefined,
): CalendarDayKey | null => {
  const parts = parseDayKeyParts(value);
  if (!parts) return null;
  return toDayKeyFromUtc(
    new Date(Date.UTC(parts.year, parts.month - 1, parts.day)),
  );
};

/** Local-midnight Date for a day key, for date inputs that work in local time. */
export const toLocalDateFromDayKey = (
  dayKey: CalendarDayKey | null | undefined,
): Date | null => {
  const parts = parseDayKeyParts(dayKey);
  return parts ? new Date(parts.year, parts.month - 1, parts.day) : null;
};

/** Today's day key in the user's local timezone. */
export const getTodayDayKey = (): CalendarDayKey => {
  const now = new Date();
  const year = String(now.getFullYear()).padStart(4, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const addDaysToDayKey = (
  dayKey: CalendarDayKey,
  days: number,
): CalendarDayKey => {
  const parts = parseDayKeyParts(dayKey);
  if (!parts) return dayKey;
  const utc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return toDayKeyFromUtc(utc);
};

export const isDayKeyBefore = (
  left: CalendarDayKey,
  right: CalendarDayKey,
): boolean => left < right;

export const getMonthCursorForDayKey = (
  dayKey: CalendarDayKey,
): CalendarMonthCursor => {
  const parts = parseDayKeyParts(dayKey);
  if (!parts) {
    const today = parseDayKeyParts(getTodayDayKey());
    return { year: today?.year ?? 1970, month: today?.month ?? 1 };
  }
  return { year: parts.year, month: parts.month };
};

export const stepMonthCursor = (
  cursor: CalendarMonthCursor,
  delta: number,
): CalendarMonthCursor => {
  const zeroBased = cursor.month - 1 + delta;
  const year = cursor.year + Math.floor(zeroBased / 12);
  const month = ((zeroBased % 12) + 12) % 12;
  return { year, month: month + 1 };
};

/** Monday-first weekday index (0 = Monday … 6 = Sunday). */
const getMondayIndex = (utcDate: Date): number => (utcDate.getUTCDay() + 6) % 7;

const buildCellModel = (
  utcDate: Date,
  isInFocus: (dateKey: CalendarDayKey) => boolean,
  todayKey: CalendarDayKey,
): CalendarDayCellModel => {
  const dateKey = toDayKeyFromUtc(utcDate);
  return {
    dateKey,
    dayNumber: utcDate.getUTCDate(),
    inMonth: isInFocus(dateKey),
    isToday: dateKey === todayKey,
    isPast: dateKey < todayKey,
  };
};

const buildWeekCells = (
  gridStart: Date,
  totalCells: number,
  isInFocus: (dateKey: CalendarDayKey) => boolean,
  todayKey: CalendarDayKey,
): CalendarDayCellModel[] =>
  Array.from({ length: totalCells }, (_, index) => {
    const cellDate = new Date(
      Date.UTC(
        gridStart.getUTCFullYear(),
        gridStart.getUTCMonth(),
        gridStart.getUTCDate() + index,
      ),
    );
    return buildCellModel(cellDate, isInFocus, todayKey);
  });

/**
 * Full weeks (Monday-first) covering the cursor month: 35 or 42 cells,
 * including the leading/trailing out-of-month days.
 */
export const buildMonthGrid = (
  cursor: CalendarMonthCursor,
  todayKey: CalendarDayKey,
): CalendarDayCellModel[] => {
  const firstOfMonth = new Date(Date.UTC(cursor.year, cursor.month - 1, 1));
  const gridStart = new Date(
    Date.UTC(cursor.year, cursor.month - 1, 1 - getMondayIndex(firstOfMonth)),
  );
  const daysInMonth = new Date(
    Date.UTC(cursor.year, cursor.month, 0),
  ).getUTCDate();
  const leading = getMondayIndex(firstOfMonth);
  const totalCells = Math.ceil((leading + daysInMonth) / 7) * 7;
  const monthPrefix = `${String(cursor.year).padStart(4, "0")}-${String(cursor.month).padStart(2, "0")}-`;

  return buildWeekCells(
    gridStart,
    totalCells,
    (dateKey) => dateKey.startsWith(monthPrefix),
    todayKey,
  );
};

/** The filter's inclusive bounds, ordered; an empty `toKey` means one day. */
export const resolveCalendarDateFilterBounds = (
  filter: CalendarDateFilter,
): { startKey: CalendarDayKey; endKey: CalendarDayKey } => {
  const toKey = filter.toKey ?? filter.fromKey;
  return filter.fromKey <= toKey
    ? { startKey: filter.fromKey, endKey: toKey }
    : { startKey: toKey, endKey: filter.fromKey };
};

/**
 * Full weeks (Monday-first) covering the filter. Days outside the filter
 * stay in the grid but out of focus, like out-of-month days.
 */
export const buildDateFilterGrid = (
  filter: CalendarDateFilter,
  todayKey: CalendarDayKey,
): CalendarDayCellModel[] => {
  const { startKey, endKey } = resolveCalendarDateFilterBounds(filter);
  const start = parseDayKeyParts(startKey);
  const end = parseDayKeyParts(endKey);
  if (!start || !end) return [];

  const startUtc = new Date(Date.UTC(start.year, start.month - 1, start.day));
  const endUtc = new Date(Date.UTC(end.year, end.month - 1, end.day));
  const gridStart = new Date(
    Date.UTC(start.year, start.month - 1, start.day - getMondayIndex(startUtc)),
  );
  const gridEnd = new Date(
    Date.UTC(end.year, end.month - 1, end.day + 6 - getMondayIndex(endUtc)),
  );
  const totalCells =
    Math.round((gridEnd.getTime() - gridStart.getTime()) / 86_400_000) + 1;

  return buildWeekCells(
    gridStart,
    totalCells,
    (dateKey) => dateKey >= startKey && dateKey <= endKey,
    todayKey,
  );
};

export const getGridRangeKeys = (
  cells: CalendarDayCellModel[],
): { startKey: CalendarDayKey; endKey: CalendarDayKey } | null => {
  if (cells.length === 0) return null;
  return { startKey: cells[0].dateKey, endKey: cells[cells.length - 1].dateKey };
};

const MONTH_TITLE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const formatMonthTitle = (cursor: CalendarMonthCursor): string =>
  MONTH_TITLE_FORMAT.format(new Date(Date.UTC(cursor.year, cursor.month - 1, 1)));

const FILTER_DAY_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const FILTER_DAY_YEAR_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const dayKeyToUtcDate = (dayKey: CalendarDayKey): Date | null => {
  const parts = parseDayKeyParts(dayKey);
  return parts ? new Date(Date.UTC(parts.year, parts.month - 1, parts.day)) : null;
};

/** "12 Oct 2026", or "12 Oct – 8 Nov 2026" (both years when they differ). */
export const formatDateFilterTitle = (filter: CalendarDateFilter): string => {
  const { startKey, endKey } = resolveCalendarDateFilterBounds(filter);
  const start = dayKeyToUtcDate(startKey);
  const end = dayKeyToUtcDate(endKey);
  if (!start || !end) return "";
  if (startKey === endKey) return FILTER_DAY_YEAR_FORMAT.format(start);

  const startLabel =
    start.getUTCFullYear() === end.getUTCFullYear()
      ? FILTER_DAY_FORMAT.format(start)
      : FILTER_DAY_YEAR_FORMAT.format(start);
  return `${startLabel} – ${FILTER_DAY_YEAR_FORMAT.format(end)}`;
};

export const CALENDAR_WEEKDAY_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

/**
 * Buckets plans onto every day they cover inside the visible range. Range
 * plans appear on each covered day; single-date plans on their start date.
 */
export const groupPlansByDay = (
  plans: DeliveryPlan[],
  rangeStartKey: CalendarDayKey,
  rangeEndKey: CalendarDayKey,
): Map<CalendarDayKey, DeliveryPlan[]> => {
  const byDay = new Map<CalendarDayKey, DeliveryPlan[]>();

  plans.forEach((plan) => {
    const startKey = toCalendarDayKey(plan.start_date);
    if (!startKey) return;
    const endKey =
      plan.date_strategy === "range"
        ? (toCalendarDayKey(plan.end_date) ?? startKey)
        : startKey;
    const coverageEndKey = endKey < startKey ? startKey : endKey;

    if (coverageEndKey < rangeStartKey || startKey > rangeEndKey) return;

    let cursor = startKey < rangeStartKey ? rangeStartKey : startKey;
    const last = coverageEndKey > rangeEndKey ? rangeEndKey : coverageEndKey;
    while (cursor <= last) {
      const bucket = byDay.get(cursor);
      if (bucket) {
        bucket.push(plan);
      } else {
        byDay.set(cursor, [plan]);
      }
      cursor = addDaysToDayKey(cursor, 1);
    }
  });

  byDay.forEach((bucket) => {
    bucket.sort((left, right) => {
      const leftDate = toCalendarDayKey(left.start_date) ?? "";
      const rightDate = toCalendarDayKey(right.start_date) ?? "";
      if (leftDate !== rightDate) return leftDate < rightDate ? -1 : 1;
      return (left.id ?? 0) - (right.id ?? 0);
    });
  });

  return byDay;
};

export type CalendarRangeStats = {
  planCount: number;
  orderCount: number;
  itemCount: number;
};

/** Aggregates for the header subtitle, computed over the visible plans. */
export const computeCalendarRangeStats = (
  plansByDay: Map<CalendarDayKey, DeliveryPlan[]>,
  inMonthKeys: Set<CalendarDayKey>,
): CalendarRangeStats => {
  const seen = new Set<string>();
  const stats: CalendarRangeStats = {
    planCount: 0,
    orderCount: 0,
    itemCount: 0,
  };

  plansByDay.forEach((bucket, dateKey) => {
    if (!inMonthKeys.has(dateKey)) return;
    bucket.forEach((plan) => {
      if (seen.has(plan.client_id)) return;
      seen.add(plan.client_id);
      stats.planCount += 1;
      stats.orderCount += plan.total_orders ?? 0;
      stats.itemCount += plan.total_items ?? 0;
    });
  });

  return stats;
};
