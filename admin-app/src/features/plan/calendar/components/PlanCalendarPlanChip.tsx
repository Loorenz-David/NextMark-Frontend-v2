import type { MouseEvent } from "react";
import { useDroppable } from "@dnd-kit/core";
import { formatMetric } from "@shared-utils";

import { useResourceManager } from "@/shared/resource-manager/useResourceManager";
import type { DeliveryPlan } from "@/features/plan/types/plan";
import { useRoutePlanStateByServerId } from "@/features/plan/store/useRoutePlanState.selector";

import { getCalendarVolumeLoadPercent } from "../domain/planCalendar.domain";

const FALLBACK_STATE_COLOR = "#9aa0a0";

type PlanCalendarPlanChipProps = {
  plan: DeliveryPlan;
  assignedVehicleCapacityCm3: number | null;
  onOpen: (plan: DeliveryPlan) => void;
  /** On multi-plan days drops go to the overlay cards, not the pill chip. */
  isDropDisabled?: boolean;
};

export const PlanCalendarPlanChip = ({
  plan,
  assignedVehicleCapacityCm3,
  onOpen,
  isDropDisabled = false,
}: PlanCalendarPlanChipProps) => {
  const planState = useRoutePlanStateByServerId(plan.state_id ?? 1);
  const { planDropFeedback } = useResourceManager();
  const dropFeedback =
    planDropFeedback && planDropFeedback.planClientId === plan.client_id
      ? planDropFeedback
      : null;

  // Container id differs from DroppablePlanCard's `plan-*` so both can be
  // mounted at once (chip in the cell, card in the day overlay); intents key
  // off data.id, which stays the plan client id.
  const { setNodeRef, isOver } = useDroppable({
    id: `calendar-chip-${plan.client_id}`,
    disabled: isDropDisabled,
    data: { type: "plan", id: plan.client_id, label: plan.label },
  });

  const stateColor = planState?.color || FALLBACK_STATE_COLOR;
  const orderCount = plan.total_orders ?? 0;
  const itemCount = plan.total_items ?? 0;
  const zoneCount = plan.route_groups_count ?? 0;
  const loadPercent = getCalendarVolumeLoadPercent(
    plan.total_volume,
    assignedVehicleCapacityCm3,
  );
  const volumeLoadTitle =
    assignedVehicleCapacityCm3 != null
      ? `${formatMetric(plan.total_volume ?? 0, "㎥")} of ${formatMetric(
          assignedVehicleCapacityCm3,
          "㎥",
        )} assigned vehicle capacity`
      : "Assigned vehicle volume capacity unavailable";

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onOpen(plan);
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      className={`flex shrink-0 cursor-pointer flex-col gap-1 rounded-[10px] border px-2 py-1.5 transition-all duration-150 ${
        isOver
          ? "scale-[1.02] shadow-[0_0_0_2px_rgba(var(--info-r),0.35)]"
          : ""
      }`}
      style={{
        backgroundColor: `color-mix(in srgb, ${stateColor} 11%, transparent)`,
        borderColor: isOver
          ? "var(--color-light-blue)"
          : `color-mix(in srgb, ${stateColor} 32%, transparent)`,
      }}
      title={plan.label}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: stateColor }}
        />
        <span className="min-w-0 truncate text-[12px] font-semibold text-[var(--color-text)]">
          {orderCount} {orderCount === 1 ? "order" : "orders"}
        </span>
        {dropFeedback ? (
          <span
            key={dropFeedback.token}
            className={`text-[10px] font-semibold ${
              dropFeedback.status === "error"
                ? "text-[rgb(var(--danger-state-r))]"
                : "text-[rgb(var(--success-deep-r))]"
            }`}
          >
            {dropFeedback.status === "error"
              ? "failed"
              : `+${dropFeedback.movedCount}`}
          </span>
        ) : null}
        <span className="ml-auto shrink-0 font-mono text-[10px] text-[var(--color-muted)]">
          {zoneCount}z
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span
          className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--color-muted)]/15"
          title={volumeLoadTitle}
        >
          <span
            className="block h-full rounded-full"
            style={{ width: `${loadPercent}%`, backgroundColor: stateColor }}
          />
        </span>
        <span className="shrink-0 font-mono text-[10px] text-[var(--color-muted)]">
          {formatMetric(plan.total_volume ?? 0, "㎥")}
        </span>
      </div>

      <span className="text-[10.5px] leading-[1.35] text-[var(--color-muted)]">
        {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
        {formatMetric(plan.total_weight ?? 0, "kg")}
      </span>
    </div>
  );
};
