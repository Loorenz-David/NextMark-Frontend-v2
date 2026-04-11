import {
  selectRouteSolutionByServerId,
  useRouteSolutionStore,
} from "@/features/plan/routeGroup/store/routeSolution.store";

export const resolveRouteGroupIdByRouteSolutionId = (
  routeSolutionId: number | null | undefined,
): number | null => {
  if (!routeSolutionId) return null;
  const solution = selectRouteSolutionByServerId(routeSolutionId)(
    useRouteSolutionStore.getState(),
  );
  return solution?.route_group_id ?? null;
};
