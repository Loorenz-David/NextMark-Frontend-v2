import { create } from "zustand";

type PlanOrderMutationState = {
  /**
   * Ref-counted so overlapping moves touching the same plan settle only when
   * the last one finishes, rather than the first one clearing the flag.
   */
  pendingCountByPlanId: Record<number, number>;
  beginMutation: (planIds: number[]) => void;
  finishMutation: (planIds: number[]) => void;
};

const normalizePlanIds = (planIds: number[]) =>
  Array.from(
    new Set(planIds.filter((id) => typeof id === "number" && Number.isFinite(id))),
  );

/**
 * Which plans have an order mutation in flight.
 *
 * Distinct from `routeMapRefresh`, which tracks the plan whose route map is on
 * screen: this one tracks every plan whose contents are changing, including the
 * plan an order is leaving and a destination whose card is nowhere near the map.
 */
export const usePlanOrderMutationStore = create<PlanOrderMutationState>(
  (set) => ({
    pendingCountByPlanId: {},
    beginMutation: (planIds) =>
      set((state) => {
        const ids = normalizePlanIds(planIds);
        if (ids.length === 0) return state;

        const pendingCountByPlanId = { ...state.pendingCountByPlanId };
        ids.forEach((planId) => {
          pendingCountByPlanId[planId] =
            (pendingCountByPlanId[planId] ?? 0) + 1;
        });
        return { pendingCountByPlanId };
      }),
    finishMutation: (planIds) =>
      set((state) => {
        const ids = normalizePlanIds(planIds);
        if (ids.length === 0) return state;

        const pendingCountByPlanId = { ...state.pendingCountByPlanId };
        ids.forEach((planId) => {
          const currentCount = pendingCountByPlanId[planId] ?? 0;
          if (currentCount <= 1) {
            delete pendingCountByPlanId[planId];
            return;
          }
          pendingCountByPlanId[planId] = currentCount - 1;
        });
        return { pendingCountByPlanId };
      }),
  }),
);

export const useIsPlanOrderMutating = (planId: number | null | undefined) =>
  usePlanOrderMutationStore((state) =>
    planId == null ? false : (state.pendingCountByPlanId[planId] ?? 0) > 0,
  );
