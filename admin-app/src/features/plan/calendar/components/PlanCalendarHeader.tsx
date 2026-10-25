import { PlanIcon } from "@/assets/icons";

import { UnscheduleDropSlot } from "../../components/UnscheduleDropTarget";
import { PlanHeaderMenu } from "../../components/headers/PlanHeaderMenu";
import type { CalendarDateFilter } from "../domain/planCalendar.domain";
import { PlanCalendarDateControl } from "./PlanCalendarDateControl";

type PlanCalendarHeaderProps = {
  title: string;
  dateFilter: CalendarDateFilter | null;
  onDateFilterChange: (filter: CalendarDateFilter | null) => void;
  onStepPrevious: () => void;
  onStepNext: () => void;
  onGoToToday: () => void;
  onCreatePlan: () => void;
};

export const PlanCalendarHeader = ({
  title,
  dateFilter,
  onDateFilterChange,
  onStepPrevious,
  onStepNext,
  onGoToToday,
  onCreatePlan,
}: PlanCalendarHeaderProps) => {
  return (
    <div className="flex shrink-0 items-center gap-3.5 border-b border-border bg-[var(--surface-card-muted)] py-3 pr-5 pl-[calc(1.25rem+var(--plan-header-leading-inset,0px))] transition-[padding] duration-200">
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

        <PlanCalendarDateControl
          title={title}
          dateFilter={dateFilter}
          onDateFilterChange={onDateFilterChange}
          onStepPrevious={onStepPrevious}
          onStepNext={onStepNext}
          onGoToToday={onGoToToday}
        />

        <PlanHeaderMenu onCreatePlan={onCreatePlan} showViewSwitch />
      </div>
    </div>
  );
};
