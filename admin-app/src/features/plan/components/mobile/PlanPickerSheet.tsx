import { BottomSheet } from "@/shared/overlays/bottomSheet";
import { StateCard } from "@/shared/layout/StateCard";

import { formatPlanDateRangeLabel } from "../../domain/planDateLabel";
import { PLAN_TYPE_SHORT_LABELS, resolvePlanType } from "../../domain/planType";
import { useVisibleRoutePlans } from "../../store/useRoutePlan.selector";
import { useRoutePlanStateByServerId } from "../../store/useRoutePlanState.selector";
import type { DeliveryPlan } from "../../types/plan";
import { planIconTypeMap } from "../../utils/planIconTypeMap";

type PlanPickerSheetProps = {
  open: boolean;
  onClose: () => void;
  onPick: (planClientId: string) => void;
  title?: string;
};

const PlanPickerRow = ({
  plan,
  onPick,
}: {
  plan: DeliveryPlan;
  onPick: (planClientId: string) => void;
}) => {
  const planType = resolvePlanType(plan);
  const PlanTypeIcon = planIconTypeMap[planType];
  const planState = useRoutePlanStateByServerId(plan.state_id ?? null);
  const dateLabel = formatPlanDateRangeLabel(plan.start_date, plan.end_date);
  const orderCount = plan.total_orders ?? 0;

  return (
    <button
      type="button"
      onClick={() => onPick(plan.client_id)}
      className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors active:bg-surface-hover"
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-muted)]/10">
        <PlanTypeIcon className="h-5 w-5 text-[var(--color-muted)]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[0.95rem] font-semibold text-[var(--color-text)]">
          {plan.label}
        </span>
        <span className="truncate text-xs text-[var(--color-muted)]">
          {PLAN_TYPE_SHORT_LABELS[planType]} • {dateLabel || "No date"} • {orderCount}{" "}
          {orderCount === 1 ? "order" : "orders"}
        </span>
      </span>
      {planState ? (
        <StateCard label={planState.name} color={planState.color ?? undefined} />
      ) : null}
    </button>
  );
};

/**
 * Lists the plans currently loaded in the plan list so the user can pick a
 * destination without dragging. Visible plans follow the Plans tab's
 * filters, which is what the user last looked at.
 */
export const PlanPickerSheet = ({
  open,
  onClose,
  onPick,
  title = "Assign to plan",
}: PlanPickerSheetProps) => {
  const plans = useVisibleRoutePlans();

  return (
    <BottomSheet open={open} onClose={onClose} title={title} bodyClassName="px-2 pb-2 pt-1">
      {plans.length === 0 ? (
        <p className="px-3 py-6 text-center text-sm text-[var(--color-muted)]">
          No plans loaded. Open the Plans tab to load some first.
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {plans.map((plan) => (
            <PlanPickerRow key={plan.client_id} plan={plan} onPick={onPick} />
          ))}
        </div>
      )}
    </BottomSheet>
  );
};
