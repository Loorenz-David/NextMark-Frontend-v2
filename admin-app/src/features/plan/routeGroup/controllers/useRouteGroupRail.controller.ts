import { useCallback, useMemo } from "react";

import { buildRouteGroupRailItems } from "@/features/plan/routeGroup/domain/buildRouteGroupRailItems";
import type { RouteGroupRailItem } from "@/features/plan/routeGroup/domain/routeGroupRailItem";
import { useRouteGroupsByPlanId } from "@/features/plan/routeGroup/store/useRouteGroup.selector";
import {
  useActiveRouteGroupActions,
  useActiveRouteGroupId,
} from "@/features/plan/routeGroup/store/useActiveRouteGroup.selector";
import { useOrderStates } from "@/features/order/store/orderStateHooks.store";
import { useRoutePlanStates } from "@/features/plan/store/useRoutePlanState.selector";

export const useRouteGroupRailController = (
  planId: number | null | undefined,
) => {
  const routeGroups = useRouteGroupsByPlanId(planId);
  const orderStates = useOrderStates();
  const routeGroupStates = useRoutePlanStates();
  const activeRouteGroupId = useActiveRouteGroupId();
  const { setActiveRouteGroupId, rememberRouteGroupForPlan } =
    useActiveRouteGroupActions();

  const railItems = useMemo<RouteGroupRailItem[]>(
    () =>
      buildRouteGroupRailItems({
        routeGroups,
        orderStates,
        routeGroupStates,
        activeRouteGroupId,
      }),
    [activeRouteGroupId, orderStates, routeGroupStates, routeGroups],
  );

  // The zone tabs always keep one route group open, so re-picking the
  // active one is a no-op rather than a deselect.
  const handleSelectRouteGroup = useCallback(
    (routeGroupId: number) => {
      if (routeGroupId === activeRouteGroupId) return;
      setActiveRouteGroupId(routeGroupId);
      if (typeof planId === "number") {
        rememberRouteGroupForPlan(planId, routeGroupId);
      }
    },
    [activeRouteGroupId, planId, rememberRouteGroupForPlan, setActiveRouteGroupId],
  );

  return {
    railItems,
    handleSelectRouteGroup,
  };
};
