import { useDroppable } from "@dnd-kit/core";
import { motion, type Variants } from "framer-motion";

import { formatIsoDateFriendly } from "@/shared/utils/formatIsoDate";

import { DroppablePlanCard } from "@/features/plan/components/cards/DroppablePlanCard";
import { buildCalendarOverlayDroppableId } from "@/features/plan/dnd/domain/droppableIds";
import type { DeliveryPlan } from "@/features/plan/types/plan";

import type { CalendarDayKey } from "../domain/planCalendar.domain";

// Grows out of the day cell (origin supplied by the popover's placement) and
// shrinks back into it; the exit is a touch quicker so closing feels snappy.
const overlayVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    transition: { duration: 0.14, ease: "easeIn" },
  },
};

type PlanCalendarDayPlansOverlayProps = {
  dateKey: CalendarDayKey;
  plans: DeliveryPlan[];
  /** Fires once the enter animation has settled at full scale. */
  onEntered?: () => void;
};

/**
 * Floating panel listing a day's route plans as full, droppable plan cards —
 * opened by tapping a multi-plan day or by hovering it with a dragged order.
 * Drops on a multi-plan day land on these cards, never on the day pill.
 */
export const PlanCalendarDayPlansOverlay = ({
  dateKey,
  plans,
  onEntered,
}: PlanCalendarDayPlansOverlayProps) => {
  // The panel registers itself as a droppable so pointer positions between
  // cards resolve to the overlay (a no-op target) instead of leaking through
  // to whichever day cell sits underneath the floating panel.
  const { setNodeRef } = useDroppable({
    id: buildCalendarOverlayDroppableId(dateKey),
    data: { type: "calendar-overlay", id: dateKey },
  });

  return (
    <motion.div
      ref={setNodeRef}
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onAnimationComplete={(definition) => {
        if (definition === "visible") onEntered?.();
      }}
      style={{ transformOrigin: "var(--floating-transform-origin, top left)" }}
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
    </motion.div>
  );
};
