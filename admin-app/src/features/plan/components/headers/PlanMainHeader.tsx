import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";

import { ChevronDownIcon, PlanIcon, PlusIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";
import type { PlanQueryFilters, PlanStats } from "../../types/planMeta";
import { UnscheduleDropSlot } from "../UnscheduleDropTarget";
import { pluralLabel } from "@shared-utils";
import { InfoHover } from "@/shared/layout/InfoHover";
import { PLAN_MAIN_HEADER_INFO } from "../../info/planMainHeader.info";
import { PlanDateFilterBar } from "../planDateFilter";
import type { PlanDateFilterPayload } from "../planDateFilter";

const CREATE_PLAN_DROP_TARGET_ID = "create-plan-drop-target";

type PlanMainHeaderProps = {
  onCreate: () => void;
  applySearch: (input: string) => void;
  applyFilters: (filters: PlanQueryFilters) => void;
  applyFilterSelection?: (payload: PlanDateFilterPayload) => void;
  onRequestClose?: () => void;
  planStats?: PlanStats;
  showCloseButton?: boolean;
  /** Optional control rendered at the end of the actions row (e.g. the calendar/list view toggle). */
  headerAccessory?: ReactNode;
};

export const PlanMainHeader = ({
  onCreate,
  applyFilters,
  applyFilterSelection,
  onRequestClose,
  showCloseButton = true,
  planStats,
  headerAccessory,
}: PlanMainHeaderProps) => {
  const { setNodeRef: setCreatePlanNodeRef, isOver: isCreatePlanOver } =
    useDroppable({
      id: CREATE_PLAN_DROP_TARGET_ID,
      data: {
        type: "create-plan",
        id: CREATE_PLAN_DROP_TARGET_ID,
      },
    });

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--surface-page-header)] px-4 py-3 relative shadow-sm">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center rounded-xl bg-[var(--color-muted)]/10 px-2 py-2">
            <PlanIcon className="h-8 w-8 fill-[var(--color-muted)]" />
          </div>
          <HeaderTitle planStats={planStats} />
        </div>

        {showCloseButton ? (
          <HeaderButtons onRequestClose={onRequestClose} />
        ) : null}
      </div>

      <div className="flex items-center gap-1 p-4">
        <div className="flex items-center gap-4">
          <BasicButton
            ref={setCreatePlanNodeRef}
            key="order-main-create"
            params={{
              variant: "primary",
              onClick: onCreate,
              ariaLabel: isCreatePlanOver
                ? "Drop orders to create a plan"
                : "Create delivery plan",
              className: isCreatePlanOver
                ? "shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-primary)_24%,transparent),0_0_24px_color-mix(in_srgb,var(--color-primary)_32%,transparent)]"
                : undefined,
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4 stroke-[var(--color-secondary)]" />
            Plan
          </BasicButton>

          <PlanDateFilterBar
            onFiltersChange={applyFilters}
            onSelectionChange={applyFilterSelection}
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <UnscheduleDropSlot />
          {headerAccessory}
        </div>
      </div>
    </>
  );
};

type ButtonsProps = {
  onRequestClose?: () => void;
};
const HeaderButtons = ({ onRequestClose }: ButtonsProps) => {
  return (
    <div className="absolute top-0 right-0">
      <BasicButton
        params={{
          onClick: onRequestClose,
          variant: "ghost",
          ariaLabel: "Toggle delivery plan",
          style: { padding: "24px 6px", borderRadius: "10px 0 0 10px" },
        }}
      >
        <div className="flex gap-1 items-center justify-center">
          <span className="font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]/90 text-[9px]">
            fold{" "}
          </span>
          <ChevronDownIcon
            className={`w-5 h-5 transition-transform rotate-270 text-[var(--color-muted)]`}
          />
        </div>
      </BasicButton>
    </div>
  );
};

const HeaderTitle = ({ planStats }: { planStats?: PlanStats }) => {
  const plansCount = planStats?.plans.total ?? 0;
  const ordersCount = planStats?.orders.total ?? 0;
  const itemsCount = planStats?.items.total ?? 0;
  return (
    <div className="flex gap-2">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg text-[var(--color-muted)]/80">
            Plans
          </span>
          <InfoHover content={PLAN_MAIN_HEADER_INFO} />
        </div>
        <div className="text-xs flex text-[var(--color-muted)] font-normal flex gap-1">
          <span>
            {" "}
            {plansCount} {pluralLabel("plan", plansCount)} •{" "}
          </span>
          <span>
            {" "}
            {ordersCount} {pluralLabel("order", ordersCount)} •{" "}
          </span>
          <span>
            {" "}
            {itemsCount} {pluralLabel("item", itemsCount)}{" "}
          </span>
        </div>
      </div>
    </div>
  );
};
