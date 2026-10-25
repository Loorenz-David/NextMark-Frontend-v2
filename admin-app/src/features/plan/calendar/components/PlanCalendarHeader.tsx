import { ChevronDownIcon, PlanIcon } from "@/assets/icons";

import { UnscheduleDropSlot } from "../../components/UnscheduleDropTarget";
import { PlanHeaderMenu } from "../../components/headers/PlanHeaderMenu";

type PlanCalendarHeaderProps = {
  title: string;
  onStepPrevious: () => void;
  onStepNext: () => void;
  onGoToToday: () => void;
  onCreatePlan: () => void;
};

export const PlanCalendarHeader = ({
  title,
  onStepPrevious,
  onStepNext,
  onGoToToday,
  onCreatePlan,
}: PlanCalendarHeaderProps) => {
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

        <div className="flex items-center gap-0.5 rounded-full border border-border px-1.5 py-[5px]">
          <button
            type="button"
            onClick={onStepPrevious}
            aria-label="Previous month"
            className="touch-hit-area flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-surface-hover"
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
            className="touch-hit-area flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-surface-hover"
          >
            <ChevronDownIcon className="h-4 w-4 -rotate-90 text-[var(--color-muted)]" />
          </button>
        </div>

        <PlanHeaderMenu onCreatePlan={onCreatePlan} showViewSwitch />
      </div>
    </div>
  );
};
