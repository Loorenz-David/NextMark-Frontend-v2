import {
  selectRouteGroupByServerId,
  useRouteGroupStore,
} from "@/features/plan/routeGroup/store/routeGroup.slice";

export const resolvePlanIdByRouteGroupId = (
  routeGroupId: number | null | undefined,
): number | null => {
  if (!routeGroupId) return null;
  const group = selectRouteGroupByServerId(routeGroupId)(
    useRouteGroupStore.getState(),
  );
  return group?.route_plan_id ?? null;
};
