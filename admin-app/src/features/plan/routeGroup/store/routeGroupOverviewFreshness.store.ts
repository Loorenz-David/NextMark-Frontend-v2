import { create } from "zustand";

type RouteGroupOverviewFreshnessState = {
  freshAfterByPlanId: Record<number, string>;
  markPlansFreshAfter: (
    planIds: Array<number | null | undefined>,
    freshAfter?: string | null,
  ) => void;
  clearPlanFreshAfter: (planId: number | null | undefined) => void;
};

const resolveNewestFreshAfter = (
  currentFreshAfter: string | null | undefined,
  nextFreshAfter: string,
) => {
  if (!currentFreshAfter) return nextFreshAfter;

  const currentTime = Date.parse(currentFreshAfter);
  const nextTime = Date.parse(nextFreshAfter);

  if (Number.isNaN(currentTime) || Number.isNaN(nextTime)) {
    return nextFreshAfter;
  }

  return nextTime >= currentTime ? nextFreshAfter : currentFreshAfter;
};

export const useRouteGroupOverviewFreshnessStore =
  create<RouteGroupOverviewFreshnessState>((set) => ({
    freshAfterByPlanId: {},
    markPlansFreshAfter: (planIds, freshAfter) => {
      const normalizedPlanIds = Array.from(
        new Set(
          planIds.filter(
            (planId): planId is number =>
              typeof planId === "number" && Number.isFinite(planId) && planId > 0,
          ),
        ),
      );

      if (normalizedPlanIds.length === 0) return;

      const marker = freshAfter ?? new Date().toISOString();
      set((state) => {
        const nextFreshAfterByPlanId = { ...state.freshAfterByPlanId };

        normalizedPlanIds.forEach((planId) => {
          nextFreshAfterByPlanId[planId] = resolveNewestFreshAfter(
            nextFreshAfterByPlanId[planId],
            marker,
          );
        });

        return { freshAfterByPlanId: nextFreshAfterByPlanId };
      });
    },
    clearPlanFreshAfter: (planId) => {
      if (typeof planId !== "number" || !Number.isFinite(planId) || planId <= 0) {
        return;
      }

      set((state) => {
        if (!state.freshAfterByPlanId[planId]) {
          return state;
        }

        const nextFreshAfterByPlanId = { ...state.freshAfterByPlanId };
        delete nextFreshAfterByPlanId[planId];
        return { freshAfterByPlanId: nextFreshAfterByPlanId };
      });
    },
  }));

export const useRouteGroupOverviewFreshAfter = (
  planId: number | null | undefined,
) =>
  useRouteGroupOverviewFreshnessStore((state) =>
    typeof planId === "number" ? state.freshAfterByPlanId[planId] ?? null : null,
  );

export const markRouteGroupOverviewFreshAfter = (
  planIds: Array<number | null | undefined>,
  freshAfter?: string | null,
) =>
  useRouteGroupOverviewFreshnessStore
    .getState()
    .markPlansFreshAfter(planIds, freshAfter);

export const clearRouteGroupOverviewFreshAfter = (
  planId: number | null | undefined,
) =>
  useRouteGroupOverviewFreshnessStore.getState().clearPlanFreshAfter(planId);
