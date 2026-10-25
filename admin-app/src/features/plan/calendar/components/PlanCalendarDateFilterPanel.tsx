import { useState } from "react";

import { CustomDatePicker } from "@/shared/inputs/CustomDatePicker";

import {
  toCalendarDayKey,
  toLocalDateFromDayKey,
  type CalendarDateFilter,
  type CalendarDayKey,
} from "../domain/planCalendar.domain";

type PlanCalendarDateFilterPanelProps = {
  dateFilter: CalendarDateFilter | null;
  onDateFilterChange: (filter: CalendarDateFilter | null) => void;
  onGoToToday: () => void;
};

/**
 * From / To inputs for the calendar date filter. From alone shows one day;
 * adding To shows the range. Emptying From, or "Clear filter", returns the
 * calendar to its month view.
 */
export const PlanCalendarDateFilterPanel = ({
  dateFilter,
  onDateFilterChange,
  onGoToToday,
}: PlanCalendarDateFilterPanelProps) => {
  const [fromKey, setFromKey] = useState<CalendarDayKey | null>(
    dateFilter?.fromKey ?? null,
  );
  const [toKey, setToKey] = useState<CalendarDayKey | null>(
    dateFilter?.toKey ?? null,
  );

  const apply = (nextFrom: CalendarDayKey | null, nextTo: CalendarDayKey | null) => {
    setFromKey(nextFrom);
    setToKey(nextTo);
    onDateFilterChange(nextFrom ? { fromKey: nextFrom, toKey: nextTo } : null);
  };

  return (
    <div className="admin-glass-popover flex w-[300px] flex-col gap-3 rounded-2xl border border-[var(--color-border-accent)] p-4 shadow-[var(--shadow-panel-filter)]">
      <p className="text-micro font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]/80">
        Filter dates
      </p>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-[var(--color-muted)]">From</span>
        <CustomDatePicker
          selectionMode="single"
          renderPopoverInPortal
          date={toLocalDateFromDayKey(fromKey)}
          onChange={(value) => apply(toCalendarDayKey(value), toKey)}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-[var(--color-muted)]">
          To <span className="font-normal text-[var(--color-muted)]/70">(optional)</span>
        </span>
        <CustomDatePicker
          selectionMode="single"
          renderPopoverInPortal
          disabled={!fromKey}
          date={toLocalDateFromDayKey(toKey)}
          onChange={(value) => apply(fromKey, toCalendarDayKey(value))}
        />
      </label>

      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={onGoToToday}
          className="touch-hit-area rounded-full px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-surface-hover"
        >
          Today
        </button>
        {dateFilter ? (
          <button
            type="button"
            onClick={() => apply(null, null)}
            className="touch-hit-area rounded-full px-3 py-1.5 text-sm font-medium text-[var(--color-muted)] transition-colors hover:bg-surface-hover hover:text-[var(--color-text)]"
          >
            Clear filter
          </button>
        ) : null}
      </div>
    </div>
  );
};
