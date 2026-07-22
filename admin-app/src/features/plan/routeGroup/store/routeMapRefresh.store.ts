import { create } from "zustand";

type RouteMapRefreshState = {
  pendingCountByPlanId: Record<number, number>;
  beginRefresh: (planId: number) => void;
  finishRefresh: (planId: number) => void;
};

export const useRouteMapRefreshStore = create<RouteMapRefreshState>((set) => ({
  pendingCountByPlanId: {},
  beginRefresh: (planId) =>
    set((state) => ({
      pendingCountByPlanId: {
        ...state.pendingCountByPlanId,
        [planId]: (state.pendingCountByPlanId[planId] ?? 0) + 1,
      },
    })),
  finishRefresh: (planId) =>
    set((state) => {
      const currentCount = state.pendingCountByPlanId[planId] ?? 0;
      if (currentCount <= 0) return state;

      const pendingCountByPlanId = { ...state.pendingCountByPlanId };
      if (currentCount === 1) {
        delete pendingCountByPlanId[planId];
      } else {
        pendingCountByPlanId[planId] = currentCount - 1;
      }

      return { pendingCountByPlanId };
    }),
}));

export const useIsRouteMapRefreshing = (planId: number | null) =>
  useRouteMapRefreshStore((state) =>
    planId == null ? false : (state.pendingCountByPlanId[planId] ?? 0) > 0,
  );

