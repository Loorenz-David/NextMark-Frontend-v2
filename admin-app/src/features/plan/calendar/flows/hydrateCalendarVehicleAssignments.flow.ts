import { loadPlanRouteGroupVehicleIds } from "@/features/plan/routeGroup";

import { usePlanCalendarStore } from "../store/planCalendar.store";

const MAX_CONCURRENT_ASSIGNMENT_REQUESTS = 4;

export const hydrateCalendarVehicleAssignments = async (
  planIds: number[],
  signal?: AbortSignal,
): Promise<void> => {
  if (planIds.length === 0) return;

  const store = usePlanCalendarStore.getState();
  planIds.forEach(store.setPlanVehicleAssignmentLoading);

  let nextIndex = 0;
  const loadNext = async (): Promise<void> => {
    while (nextIndex < planIds.length && !signal?.aborted) {
      const planId = planIds[nextIndex];
      nextIndex += 1;

      try {
        const vehicleIds = await loadPlanRouteGroupVehicleIds(planId, signal);
        if (signal?.aborted) return;
        usePlanCalendarStore
          .getState()
          .setPlanVehicleAssignmentReady(planId, vehicleIds);
      } catch (error) {
        if (signal?.aborted) return;
        console.error(
          `Failed to load vehicle assignments for calendar plan ${planId}`,
          error,
        );
        usePlanCalendarStore
          .getState()
          .setPlanVehicleAssignmentFailure(planId);
      }
    }
  };

  await Promise.all(
    Array.from(
      {
        length: Math.min(
          MAX_CONCURRENT_ASSIGNMENT_REQUESTS,
          planIds.length,
        ),
      },
      loadNext,
    ),
  );
};
