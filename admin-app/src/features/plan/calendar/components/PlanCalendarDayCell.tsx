import { useState, type MouseEvent, type RefObject } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Placement } from "@floating-ui/react";

import { PlusIcon } from "@/assets/icons";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";
import { buildCalendarDayDroppableId } from "@/features/plan/dnd/domain/droppableIds";
import type { DeliveryPlan } from "@/features/plan/types/plan";

import { useCalendarDayDragOverlayController } from "../controllers/useCalendarDayDragOverlay.controller";
import type {
  CalendarDayCellModel,
  CalendarDayKey,
} from "../domain/planCalendar.domain";
import { PlanCalendarPlanChip } from "./PlanCalendarPlanChip";
import { PlanCalendarDayPlansOverlay } from "./PlanCalendarDayPlansOverlay";

type PlanCalendarDayCellProps = {
  cell: CalendarDayCellModel;
  plans: DeliveryPlan[];
  volumeCapacityByPlanId: Record<number, number | null>;
  onOpenPlan: (plan: DeliveryPlan) => void;
  onCreateForDate: (dateKey: CalendarDayKey) => void;
  /** The calendar box the multi-plan overlay must stay within. */
  overlayBoundaryRef?: RefObject<Element | null>;
};

// Prefer opening below to the right; when that would leave the calendar,
// mirror to the left before resorting to opening above.
const OVERLAY_FALLBACK_PLACEMENTS: Placement[] = [
  "bottom-end",
  "top-start",
  "top-end",
];

export const PlanCalendarDayCell = ({
  cell,
  plans,
  volumeCapacityByPlanId,
  onOpenPlan,
  onCreateForDate,
  overlayBoundaryRef,
}: PlanCalendarDayCellProps) => {
  const [isTapOverlayOpen, setIsTapOverlayOpen] = useState(false);
  const planClientIds = plans.map((plan) => plan.client_id);

  const { setNodeRef, isOver } = useDroppable({
    id: buildCalendarDayDroppableId(cell.dateKey),
    disabled: cell.isPast,
    data: {
      type: "calendar-day",
      id: cell.dateKey,
      dateKey: cell.dateKey,
      isPast: cell.isPast,
      planClientIds,
    },
  });

  const hasPlans = plans.length > 0;
  const extraPlanCount = plans.length - 1;
  const hasMultiplePlans = extraPlanCount > 0;
  const canCreate = !cell.isPast;
  const isDropTarget = isOver && !cell.isPast;

  const { isDragOverlayOpen, remeasureOverlayDroppables } =
    useCalendarDayDragOverlayController({
      dateKey: cell.dateKey,
      planClientIds,
      hasMultiplePlans,
      isPast: cell.isPast,
      isOverCell: isOver,
    });

  const isPlansOverlayOpen =
    hasMultiplePlans && (isTapOverlayOpen || isDragOverlayOpen);

  const openPlansOverlay = () => setIsTapOverlayOpen(true);

  const handleCellClick = (event: MouseEvent<HTMLDivElement>) => {
    // Portal-rendered overlay content bubbles through the React tree;
    // only react to clicks physically inside the cell.
    if (!event.currentTarget.contains(event.target as Node)) return;
    if (!hasPlans) return;

    if (hasMultiplePlans) {
      openPlansOverlay();
      return;
    }
    onOpenPlan(plans[0]);
  };

  const handleChipOpen = (plan: DeliveryPlan) => {
    // Multi-plan days delegate every tap — including the pill chip — to
    // the overlay; only single-plan days open the plan directly.
    if (hasMultiplePlans) {
      openPlansOverlay();
      return;
    }
    onOpenPlan(plan);
  };

  const handleCreateClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onCreateForDate(cell.dateKey);
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleCellClick}
      className={`flex min-h-0 flex-col gap-1.5 overflow-hidden rounded-xl border p-2 transition-all duration-150 ${
        cell.inMonth
          ? "bg-[var(--surface-card-muted)] shadow-sm"
          : "bg-[var(--color-muted)]/5"
      } ${
        isDropTarget
          ? "border-[var(--color-light-blue)] shadow-[0_0_0_2px_rgba(var(--info-r),0.3)]"
          : cell.isToday
            ? "border-[var(--color-text)]/70"
            : "border-[var(--color-border)]"
      } ${cell.isPast ? "opacity-55" : ""} ${
        hasPlans ? "cursor-pointer hover:border-border-accent" : ""
      }`}
    >
      <div className="flex shrink-0 items-center">
        <span
          className={`flex h-[22px] w-[22px] items-center justify-center rounded-[7px] font-mono text-[12px] ${
            cell.isToday
              ? "bg-[var(--color-text)] font-semibold text-[var(--color-page)]"
              : cell.inMonth
                ? "text-[var(--color-text)]"
                : "text-[var(--color-muted)]/60"
          }`}
        >
          {cell.dayNumber}
        </span>
      </div>

      {hasPlans ? (
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
          <PlanCalendarPlanChip
            plan={plans[0]}
            assignedVehicleCapacityCm3={
              typeof plans[0]?.id === "number"
                ? (volumeCapacityByPlanId[plans[0].id] ?? null)
                : null
            }
            onOpen={handleChipOpen}
          />
          {hasMultiplePlans ? (
            <FloatingPopover
              open={isPlansOverlayOpen}
              onOpenChange={setIsTapOverlayOpen}
              renderInPortal
              strategy="fixed"
              placement="bottom-start"
              fallbackPlacements={OVERLAY_FALLBACK_PLACEMENTS}
              boundaryRef={overlayBoundaryRef}
              closeOnInsideClick
              offSetNum={6}
              floatingClassName="z-[230]"
              positionWithoutTransform
              onPositioned={remeasureOverlayDroppables}
              reference={
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsTapOverlayOpen((current) => !current);
                  }}
                  aria-label={`Show all ${plans.length} plans for ${cell.dateKey}`}
                  className="w-full shrink-0 rounded-md px-1 py-0.5 text-left text-[10.5px] font-medium text-[var(--color-muted)] transition-colors hover:bg-surface-hover hover:text-[var(--color-text)]"
                >
                  + {extraPlanCount} more {extraPlanCount === 1 ? "plan" : "plans"}
                </button>
              }
            >
              <PlanCalendarDayPlansOverlay
                dateKey={cell.dateKey}
                plans={plans}
                onEntered={remeasureOverlayDroppables}
              />
            </FloatingPopover>
          ) : null}
        </div>
      ) : canCreate ? (
        <button
          type="button"
          onClick={handleCreateClick}
          aria-label={`Create a route plan for ${cell.dateKey}`}
          className="group/create flex min-h-[26px] flex-1 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-[var(--color-muted)]/60 transition-colors hover:border-[var(--color-text)]/60 hover:text-[var(--color-text)]"
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </button>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
};
