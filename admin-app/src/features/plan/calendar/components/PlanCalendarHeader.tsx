import type { ReactNode } from "react";

import { ChevronDownIcon, PlanIcon, PlusIcon } from "@/assets/icons";

import { UnscheduleDropSlot } from "../../components/UnscheduleDropTarget";
import type { CalendarRangeStats } from "../domain/planCalendar.domain";

type PlanCalendarHeaderProps = {
  title: string;
  stats: CalendarRangeStats;
  onStepPrevious: () => void;
  onStepNext: () => void;
  onGoToToday: () => void;
  onCreatePlan: () => void;
  /** Calendar/list container-view switch, rendered between stepper and create. */
  viewToggle?: ReactNode;
};

export const PlanCalendarHeader = ({
  title,
  stats,
  onStepPrevious,
  onStepNext,
  onGoToToday,
  onCreatePlan,
  viewToggle,
}: PlanCalendarHeaderProps) => {
  return (
    <div className="flex shrink-0 items-center gap-3.5 border-b border-border bg-[var(--surface-card-muted)] px-5 py-3">
      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-surface-raised">
        <PlanIcon className="h-5 w-5 app-icon" />
      </div>

      <div className="flex min-w-0 flex-col">
        <span className="text-[19px] font-bold tracking-[-0.02em] text-[var(--color-text)]">
          Plans
        </span>
        <span className="truncate text-[12.5px] text-[var(--color-muted)]">
          {stats.planCount} {stats.planCount === 1 ? "plan" : "plans"} ·{" "}
          {stats.orderCount} {stats.orderCount === 1 ? "order" : "orders"} ·{" "}
          {stats.itemCount} {stats.itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2.5">
        {/* Only mounts while an order is being dragged, so it does not compete
            with the month stepper for header space the rest of the time. */}
        <UnscheduleDropSlot />

        <div className="flex items-center gap-0.5 rounded-full border border-border px-1.5 py-[5px]">
          <button
            type="button"
            onClick={onStepPrevious}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-surface-hover"
          >
            <ChevronDownIcon className="h-4 w-4 rotate-90 text-[var(--color-muted)]" />
          </button>
          <button
            type="button"
            onClick={onGoToToday}
            title="Go to today"
            className="min-w-[96px] rounded-full px-1 text-center text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-surface-hover"
          >
            {title}
          </button>
          <button
            type="button"
            onClick={onStepNext}
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-surface-hover"
          >
            <ChevronDownIcon className="h-4 w-4 -rotate-90 text-[var(--color-muted)]" />
          </button>
        </div>

        {viewToggle}

        <button
          type="button"
          onClick={onCreatePlan}
          className="flex items-center gap-1.5 rounded-full px-4 py-[9px] text-[13px] font-medium transition-opacity hover:opacity-85"
          style={{
            backgroundColor: "var(--color-text)",
            color: "var(--color-page)",
          }}
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Plan
        </button>
      </div>
    </div>
  );
};
