import { useState } from "react";

import { ChevronDownIcon, CloseIcon } from "@/assets/icons";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";

import type { CalendarDateFilter } from "../domain/planCalendar.domain";
import { PlanCalendarDateFilterPanel } from "./PlanCalendarDateFilterPanel";

type PlanCalendarDateControlProps = {
  title: string;
  dateFilter: CalendarDateFilter | null;
  onDateFilterChange: (filter: CalendarDateFilter | null) => void;
  onStepPrevious: () => void;
  onStepNext: () => void;
  onGoToToday: () => void;
};

const STEP_BUTTON_CLASS =
  "touch-hit-area flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface-hover active:bg-surface-hover";

/**
 * Month stepper with a date filter behind its title. Shared by the calendar
 * and the plan list in the plan column so both views pick dates the same way.
 */
export const PlanCalendarDateControl = ({
  title,
  dateFilter,
  onDateFilterChange,
  onStepPrevious,
  onStepNext,
  onGoToToday,
}: PlanCalendarDateControlProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isFiltered = dateFilter !== null;

  return (
    <div
      className={`flex items-center gap-2 rounded-full border p-1 ${
        isFiltered
          ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/8"
          : "border-border"
      }`}
    >
      {/* Month stepping does not apply while a date filter is on. */}
      {!isFiltered ? (
        <button
          type="button"
          onClick={onStepPrevious}
          aria-label="Previous month"
          className={STEP_BUTTON_CLASS}
        >
          <ChevronDownIcon className="h-5 w-5 rotate-90 text-[var(--color-muted)]" />
        </button>
      ) : null}
      <FloatingPopover
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        renderInPortal
        placement="bottom-end"
        offSetNum={10}
        floatingClassName="z-[220]"
        reference={
          <button
            type="button"
            onClick={() => setIsFilterOpen((current) => !current)}
            aria-label="Filter dates"
            aria-expanded={isFilterOpen}
            className="min-w-[150px] whitespace-nowrap rounded-full px-3 py-1.5 text-center text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-surface-hover"
          >
            {title}
          </button>
        }
      >
        <PlanCalendarDateFilterPanel
          dateFilter={dateFilter}
          onDateFilterChange={onDateFilterChange}
          onGoToToday={() => {
            onDateFilterChange(null);
            onGoToToday();
            setIsFilterOpen(false);
          }}
        />
      </FloatingPopover>
      {isFiltered ? (
        <button
          type="button"
          onClick={() => onDateFilterChange(null)}
          aria-label="Clear date filter"
          className={STEP_BUTTON_CLASS}
        >
          <CloseIcon className="h-3.5 w-3.5 text-[var(--color-muted)]" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onStepNext}
          aria-label="Next month"
          className={STEP_BUTTON_CLASS}
        >
          <ChevronDownIcon className="h-5 w-5 -rotate-90 text-[var(--color-muted)]" />
        </button>
      )}
    </div>
  );
};
