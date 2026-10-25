import { useState } from "react";

import { ChevronDownIcon, CloseIcon, PlanIcon } from "@/assets/icons";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";

import { UnscheduleDropSlot } from "../../components/UnscheduleDropTarget";
import { PlanHeaderMenu } from "../../components/headers/PlanHeaderMenu";
import type { CalendarDateFilter } from "../domain/planCalendar.domain";
import { PlanCalendarDateFilterPanel } from "./PlanCalendarDateFilterPanel";

type PlanCalendarHeaderProps = {
  title: string;
  dateFilter: CalendarDateFilter | null;
  onDateFilterChange: (filter: CalendarDateFilter | null) => void;
  onStepPrevious: () => void;
  onStepNext: () => void;
  onGoToToday: () => void;
  onCreatePlan: () => void;
};

const STEP_BUTTON_CLASS =
  "touch-hit-area flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface-hover active:bg-surface-hover";

export const PlanCalendarHeader = ({
  title,
  dateFilter,
  onDateFilterChange,
  onStepPrevious,
  onStepNext,
  onGoToToday,
  onCreatePlan,
}: PlanCalendarHeaderProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isFiltered = dateFilter !== null;

  return (
    <div className="flex shrink-0 items-center gap-3.5 border-b border-border bg-[var(--surface-card-muted)] px-5 py-3">
      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-surface-raised">
        <PlanIcon className="h-5 w-5 app-icon" />
      </div>

      {/* Plan, order and item counts are hidden from the header (user, D12). */}
      <span className="min-w-0 truncate text-px-19 font-bold tracking-[-0.02em] text-[var(--color-text)]">
        Plans
      </span>

      <div className="ml-auto flex shrink-0 items-center gap-2.5">
        {/* Only mounts while an order is being dragged, so it does not compete
            with the month stepper for header space the rest of the time. */}
        <UnscheduleDropSlot />

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

        <PlanHeaderMenu onCreatePlan={onCreatePlan} showViewSwitch />
      </div>
    </div>
  );
};
