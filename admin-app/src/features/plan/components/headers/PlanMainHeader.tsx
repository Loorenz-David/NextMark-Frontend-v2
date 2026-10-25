import { useDndContext } from "@dnd-kit/core";

import { PlanIcon } from "@/assets/icons";
import type { PlanQueryFilters } from "../../types/planMeta";
import { isOrderDragActive } from "../../domain/orderDragActivity";
import { UnscheduleDropSlot } from "../UnscheduleDropTarget";
import { CreatePlanDropSlot } from "../CreatePlanDropTarget";
import { InfoHover } from "@/shared/layout/InfoHover";
import { PLAN_MAIN_HEADER_INFO } from "../../info/planMainHeader.info";
import { PlanDateFilterBar } from "../planDateFilter";
import type { PlanDateFilterPayload } from "../planDateFilter";
import { PlanHeaderMenu } from "./PlanHeaderMenu";

type PlanMainHeaderProps = {
  onCreate: () => void;
  applySearch: (input: string) => void;
  applyFilters: (filters: PlanQueryFilters) => void;
  applyFilterSelection?: (payload: PlanDateFilterPayload) => void;
  /**
   * Add the calendar/list switch to the header menu. The plan column that
   * switches views gets the calendar header's single row, so both views share
   * one header; the phone keeps the date filter on its own row.
   */
  showViewSwitch?: boolean;
};

export const PlanMainHeader = ({
  onCreate,
  applyFilters,
  applyFilterSelection,
  showViewSwitch = false,
}: PlanMainHeaderProps) => {
  const { active } = useDndContext();
  // While an order is dragged the drop targets take the date filter's place.
  // Hidden, not unmounted: the filter keeps the chosen dates.
  const isDraggingOrder = isOrderDragActive(active?.data.current);

  const dateFilter = (
    <PlanDateFilterBar
      onFiltersChange={applyFilters}
      onSelectionChange={applyFilterSelection}
    />
  );
  const actions = (
    <>
      <CreatePlanDropSlot />
      <UnscheduleDropSlot />
      <PlanHeaderMenu onCreatePlan={onCreate} showViewSwitch={showViewSwitch} />
    </>
  );

  if (showViewSwitch) {
    return (
      <div className="flex shrink-0 items-center gap-3.5 border-b border-border bg-[var(--surface-card-muted)] py-3 pr-5 pl-[calc(1.25rem+var(--plan-header-leading-inset,0px))] transition-[padding] duration-200">
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-surface-raised">
          <PlanIcon className="h-5 w-5 app-icon" />
        </div>
        <HeaderTitle className="text-px-19 font-bold tracking-[-0.02em] text-[var(--color-text)]" />
        <div className="ml-auto flex shrink-0 items-center gap-2.5">
          <div className={isDraggingOrder ? "hidden" : "flex"}>{dateFilter}</div>
          {actions}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--surface-page-header)] py-3 pr-4 pl-[calc(1rem+var(--plan-header-leading-inset,0px))] transition-[padding] duration-200 relative shadow-sm">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center rounded-xl bg-[var(--color-muted)]/10 px-2 py-2">
            <PlanIcon className="h-8 w-8 fill-[var(--color-muted)]" />
          </div>
          <HeaderTitle className="font-semibold text-lg text-[var(--color-muted)]/80" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 gap-y-3 p-4">
        {dateFilter}
        <div className="ml-auto flex items-center gap-3">{actions}</div>
      </div>
    </>
  );
};

// Plan, order and item counts are hidden from the header (user, D12).
const HeaderTitle = ({ className }: { className: string }) => {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className={`min-w-0 truncate ${className}`}>Plans</span>
      <InfoHover content={PLAN_MAIN_HEADER_INFO} />
    </div>
  );
};
