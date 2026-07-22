import { useRouteMapRefreshStore } from "../store/routeMapRefresh.store";

export const runWithRouteMapRefresh = async <T>(
  planId: number | null,
  operation: () => Promise<T>,
): Promise<T> => {
  if (planId == null) {
    return operation();
  }

  useRouteMapRefreshStore.getState().beginRefresh(planId);
  try {
    return await operation();
  } finally {
    useRouteMapRefreshStore.getState().finishRefresh(planId);
  }
};

