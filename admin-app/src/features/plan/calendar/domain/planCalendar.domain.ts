import type { DeliveryPlan } from "@/features/plan/types/plan";

/** YYYY-MM-DD, the canonical key for one calendar day. */
export type CalendarDayKey = string;

export type CalendarMonthCursor = {
  year: number;
  /** 1-12 */
  month: number;
};

export type CalendarDayCellModel = {
  dateKey: CalendarDayKey;
  dayNumber: number;
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
  cursor: CalendarMonthCursor,
  todayKey: CalendarDayKey,
): CalendarDayCellModel => {
  const dateKey = toDayKeyFromUtc(utcDate);
  return {
    dateKey,
    dayNumber: utcDate.getUTCDate(),
    inMonth:
      utcDate.getUTCFullYear() === cursor.year &&
      utcDate.getUTCMonth() === cursor.month - 1,
    isToday: dateKey === todayKey,
    isPast: dateKey < todayKey,
  };
};

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

  return Array.from({ length: totalCells }, (_, index) => {
    const cellDate = new Date(
      Date.UTC(
        gridStart.getUTCFullYear(),
        gridStart.getUTCMonth(),
        gridStart.getUTCDate() + index,
      ),
    );
    return buildCellModel(cellDate, cursor, todayKey);
  });
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
