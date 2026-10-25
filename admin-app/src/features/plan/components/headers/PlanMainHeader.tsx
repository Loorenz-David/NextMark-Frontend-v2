import { ChevronDownIcon, PlanIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";
import type { PlanQueryFilters } from "../../types/planMeta";
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
  onRequestClose?: () => void;
  showCloseButton?: boolean;
  /** Add the calendar/list switch to the header menu. */
  showViewSwitch?: boolean;
};

export const PlanMainHeader = ({
  onCreate,
  applyFilters,
  applyFilterSelection,
  onRequestClose,
  showCloseButton = true,
  showViewSwitch = false,
}: PlanMainHeaderProps) => {
  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--surface-page-header)] px-4 py-3 relative shadow-sm">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center rounded-xl bg-[var(--color-muted)]/10 px-2 py-2">
            <PlanIcon className="h-8 w-8 fill-[var(--color-muted)]" />
          </div>
          <HeaderTitle />
        </div>

        {showCloseButton ? (
          <HeaderButtons onRequestClose={onRequestClose} />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1 gap-y-3 p-4">
        <PlanDateFilterBar
          onFiltersChange={applyFilters}
          onSelectionChange={applyFilterSelection}
        />

        <div className="ml-auto flex items-center gap-3">
          <CreatePlanDropSlot />
          <UnscheduleDropSlot />
          <PlanHeaderMenu
            onCreatePlan={onCreate}
            showViewSwitch={showViewSwitch}
          />
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
          <span className="font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]/90 text-nano">
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

// Plan, order and item counts are hidden from the header (user, D12).
const HeaderTitle = () => {
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-lg text-[var(--color-muted)]/80">
        Plans
      </span>
      <InfoHover content={PLAN_MAIN_HEADER_INFO} />
    </div>
  );
};
