import { AnimatePresence, motion } from "framer-motion";
import { useDndContext, useDroppable } from "@dnd-kit/core";

import { useResourceManager } from "@/shared/resource-manager/useResourceManager";
import type {
  KnownResourceRegistry,
  UnscheduleDropFeedback,
} from "@/shared/resource-manager/ResourceManagerContext";

const isOrderDragActive = (activeDrag: unknown) => {
  if (!activeDrag || typeof activeDrag !== "object") return false;
  const dragType = String((activeDrag as { type?: unknown }).type ?? "");
  return (
    dragType === "order" ||
    dragType === "order_batch" ||
    dragType === "order_group" ||
    dragType === "route_stop" ||
    dragType === "route_stop_group"
  );
};

/**
 * The drop target that detaches an order from its plan. Shared by the plan list
 * and calendar headers so unscheduling works in whichever container view is
 * open — dragging an order out of a plan should not depend on how the plans
 * happen to be laid out.
 */
export const UnscheduleDropTarget = ({
  dropFeedback,
}: {
  dropFeedback?: UnscheduleDropFeedback | null;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "unschedule-drop-target",
    data: {
      type: "unschedule",
      id: "unschedule",
    },
  });

  const isSuccessFeedback = dropFeedback?.status === "success";
  const isErrorFeedback = dropFeedback?.status === "error";
  const hasFeedback = Boolean(dropFeedback);

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[132px] rounded-xl border px-3 py-2 text-center transition-all duration-200 ${
        isOver || isSuccessFeedback
          ? "border-[rgb(var(--success-deep-r))]/50 bg-[rgb(var(--success-deep-r))]/12 shadow-[0_0_0_1px_rgba(var(--success-deep-r),0.2),0_0_16px_rgba(var(--success-deep-r),0.15)]"
          : isErrorFeedback
            ? "border-[rgb(var(--danger-state-r))]/35 bg-[rgb(var(--danger-state-r))]/10"
            : "border-[var(--color-border)] bg-[var(--color-muted)]/8"
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {hasFeedback ? (
          <motion.span
            key={dropFeedback?.token}
            initial={{ y: 7, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -7, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`inline-flex text-xs font-semibold uppercase tracking-[0.18em] ${
              isErrorFeedback
                ? "text-[rgb(var(--danger-state-r))]"
                : "text-[rgb(var(--success-deep-r))]"
            }`}
          >
            {isErrorFeedback
              ? "Move failed"
              : `${dropFeedback?.movedCount ?? 0} moved`}
          </motion.span>
        ) : (
          <motion.span
            key="unschedule-label"
            initial={{ y: 7, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -7, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]"
          >
            Unschedule
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Mounts the target only while an order-shaped drag is in flight (or its result
 * is still being shown), so the header keeps its normal layout the rest of the
 * time.
 */
export const UnscheduleDropSlot = () => {
  const { active } = useDndContext();
  const { unscheduleDropFeedback } =
    useResourceManager<KnownResourceRegistry>();
  const isVisible =
    isOrderDragActive(active?.data.current) || Boolean(unscheduleDropFeedback);

  if (!isVisible) return null;

  return <UnscheduleDropTarget dropFeedback={unscheduleDropFeedback} />;
};
