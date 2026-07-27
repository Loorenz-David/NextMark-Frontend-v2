import { useDroppable } from "@dnd-kit/core";

import { formatIsoDateFriendly } from "@/shared/utils/formatIsoDate";

import { DroppablePlanCard } from "@/features/plan/components/cards/DroppablePlanCard";
import type { DeliveryPlan } from "@/features/plan/types/plan";

import type { CalendarDayKey } from "../domain/planCalendar.domain";

type PlanCalendarDayPlansOverlayProps = {
  dateKey: CalendarDayKey;
  plans: DeliveryPlan[];
};

/**
 * Floating panel listing a day's route plans as full, droppable plan cards —
 * opened by tapping a multi-plan day or by hovering it with a dragged order.
 * Drops on a multi-plan day land on these cards, never on the day pill.
 */
export const PlanCalendarDayPlansOverlay = ({
  dateKey,
  plans,
}: PlanCalendarDayPlansOverlayProps) => {
  // The panel registers itself as a droppable so pointer positions between
  // cards resolve to the overlay (a no-op target) instead of leaking through
  // to whichever day cell sits underneath the floating panel.
  const { setNodeRef } = useDroppable({
    id: `calendar-overlay-${dateKey}`,
    data: { type: "calendar-overlay", id: dateKey },
  });

  return (
    <div
      ref={setNodeRef}
      className="admin-glass-popover flex max-h-[440px] w-[min(92vw,400px)] flex-col overflow-hidden rounded-xl border border-border bg-[rgba(var(--theme-surface-popover-r),0.94)] shadow-[var(--shadow-panel-popover)] backdrop-blur-md"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
          {formatIsoDateFriendly(dateKey)}
        </span>
        <span className="text-[11px] text-[var(--color-muted)]">
          {plans.length} {plans.length === 1 ? "plan" : "plans"}
        </span>
      </div>

      <div className="scroll-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
        {plans.map((plan) => (
          // data-popover-close: tapping a card opens its plan panel and
          // closes this popover in the same gesture (closeOnInsideClick).
          <div key={plan.client_id} data-popover-close>
            <DroppablePlanCard plan={plan} />
          </div>
        ))}
      </div>
    </div>
  );
};
