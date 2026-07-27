import { useEffect } from "react";

import { useOpenCreatePlanFormAction } from "@/features/plan/actions/usePlanActions";
import { useResourceManager } from "@/shared/resource-manager/useResourceManager";

import { usePlanCalendarController } from "../controllers/usePlanCalendarController";
import { usePlanCalendarStore } from "../store/planCalendar.store";
import { PlanCalendarHeader } from "../components/PlanCalendarHeader";
import { PlanCalendarBody } from "../components/PlanCalendarBody";
import { PlanContainerViewToggle } from "../components/PlanContainerViewToggle";

/** How long a drag-opened day overlay lingers after the drag ends, so the
 * drop feedback on the receiving plan card stays visible. */
const DRAG_OVERLAY_LINGER_MS = 900;

/**
 * The Plans month/week calendar — the center column of the desktop
 * route-operations workspace. Renders route plans as chips per day and
 * receives order drops on days and chips.
 */
export const PlanCalendarPage = () => {
  const {
    cells,
    plansByDay,
    volumeCapacityByPlanId,
    stats,
    title,
    isFetchingRange,
    stepPrevious,
    stepNext,
    goToToday,
    openPlan,
    openCreatePlanFormForDate,
  } = usePlanCalendarController();
  const openCreatePlanForm = useOpenCreatePlanFormAction();

  // Close any drag-opened day overlay shortly after the drag ends.
  const { routeOperationsActiveDrag } = useResourceManager();
  const dragOverlayDateKey = usePlanCalendarStore(
    (state) => state.dragOverlayDateKey,
  );
  const setDragOverlayDateKey = usePlanCalendarStore(
    (state) => state.setDragOverlayDateKey,
  );
  useEffect(() => {
    if (routeOperationsActiveDrag || !dragOverlayDateKey) return;
    const timeout = setTimeout(() => {
      setDragOverlayDateKey(null);
    }, DRAG_OVERLAY_LINGER_MS);
    return () => clearTimeout(timeout);
  }, [routeOperationsActiveDrag, dragOverlayDateKey, setDragOverlayDateKey]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-page)]">
      <PlanCalendarHeader
        title={title}
        stats={stats}
        onStepPrevious={stepPrevious}
        onStepNext={stepNext}
        onGoToToday={goToToday}
        onCreatePlan={() => openCreatePlanForm()}
        viewToggle={<PlanContainerViewToggle />}
      />

      <div
        className={`h-0.5 shrink-0 transition-opacity duration-200 ${
          isFetchingRange
            ? "animate-pulse bg-[var(--color-light-blue)]/60 opacity-100"
            : "opacity-0"
        }`}
        aria-hidden="true"
      />

      <PlanCalendarBody
        cells={cells}
        plansByDay={plansByDay}
        volumeCapacityByPlanId={volumeCapacityByPlanId}
        onOpenPlan={openPlan}
        onCreateForDate={openCreatePlanFormForDate}
      />
    </div>
  );
};
