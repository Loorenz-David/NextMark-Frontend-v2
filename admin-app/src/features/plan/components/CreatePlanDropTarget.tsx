import { useDndContext, useDroppable } from "@dnd-kit/core";

import { isOrderDragActive } from "../domain/orderDragActivity";

const CREATE_PLAN_DROP_TARGET_ID = "create-plan-drop-target";

/**
 * The drop target that creates a plan from the dragged orders. It used to be
 * the header's "+ Plan" button; with "Create plan" moved into the header menu
 * it is only mounted while an order-shaped drag is in flight.
 */
export const CreatePlanDropSlot = () => {
  const { active } = useDndContext();

  if (!isOrderDragActive(active?.data.current)) return null;

  return <CreatePlanDropTarget />;
};

const CreatePlanDropTarget = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: CREATE_PLAN_DROP_TARGET_ID,
    data: {
      type: "create-plan",
      id: CREATE_PLAN_DROP_TARGET_ID,
    },
  });

  return (
    <div
      ref={setNodeRef}
      aria-label="Drop orders to create a plan"
      className={`flex min-h-11 min-w-[132px] items-center justify-center rounded-xl border px-3 py-2 text-center transition-all duration-200 ${
        isOver
          ? "border-[var(--color-primary)]/50 bg-[var(--color-primary)]/12 shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-primary)_24%,transparent),0_0_24px_color-mix(in_srgb,var(--color-primary)_32%,transparent)]"
          : "border-[var(--color-border)] bg-[var(--color-muted)]/8"
      }`}
    >
      <span className="inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
        New plan
      </span>
    </div>
  );
};
