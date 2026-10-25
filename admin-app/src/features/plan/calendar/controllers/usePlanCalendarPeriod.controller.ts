import { useCallback, useMemo } from "react";

import {
  formatDateFilterTitle,
  formatMonthTitle,
} from "../domain/planCalendar.domain";
import { buildPlanListFiltersFromCalendarPeriod } from "../domain/planCalendarListPeriod";
import { usePlanCalendarStore } from "../store/planCalendar.store";

/**
 * The period the plan column is on — a month, or a date filter — shared by
 * the calendar and the plan list so switching views keeps the same dates.
 */
export const usePlanCalendarPeriodController = () => {
  const monthCursor = usePlanCalendarStore((state) => state.monthCursor);
  const dateFilter = usePlanCalendarStore((state) => state.dateFilter);
  const setDateFilter = usePlanCalendarStore((state) => state.setDateFilter);
  const stepMonth = usePlanCalendarStore((state) => state.stepMonth);
  const goToToday = usePlanCalendarStore((state) => state.goToToday);

  const title = dateFilter
    ? formatDateFilterTitle(dateFilter)
    : formatMonthTitle(monthCursor);

  const stepPrevious = useCallback(() => {
    stepMonth(-1);
  }, [stepMonth]);

  const stepNext = useCallback(() => {
    stepMonth(1);
  }, [stepMonth]);

  const listFilters = useMemo(
    () => buildPlanListFiltersFromCalendarPeriod(monthCursor, dateFilter),
    [monthCursor, dateFilter],
  );

  return {
    monthCursor,
    dateFilter,
    setDateFilter,
    title,
    stepPrevious,
    stepNext,
    goToToday,
    listFilters,
  };
};
