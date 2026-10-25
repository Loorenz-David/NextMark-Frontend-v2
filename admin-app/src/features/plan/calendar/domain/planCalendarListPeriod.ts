import type { PlanQueryFilters } from "@/features/plan/types/planMeta";

import {
  resolveCalendarDateFilterBounds,
  type CalendarDateFilter,
  type CalendarMonthCursor,
} from "./planCalendar.domain";

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * The plan list query for the period the calendar is on, so the list and the
 * calendar show the same dates: the month in focus, or the date filter (one
 * day or a range) when one is set.
 */
export const buildPlanListFiltersFromCalendarPeriod = (
  monthCursor: CalendarMonthCursor,
  dateFilter: CalendarDateFilter | null,
): PlanQueryFilters => {
  if (dateFilter) {
    const { startKey, endKey } = resolveCalendarDateFilterBounds(dateFilter);
    return {
      mode: startKey === endKey ? "date" : "range",
      start_date: startKey,
      end_date: endKey,
    };
  }

  const { year, month } = monthCursor;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    mode: "month",
    start_date: `${year}-${pad(month)}-01`,
    end_date: `${year}-${pad(month)}-${pad(lastDay)}`,
  };
};
