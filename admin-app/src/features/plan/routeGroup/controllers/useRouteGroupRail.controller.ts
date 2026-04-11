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
  const { clearActiveRouteGroupSelection, setActiveRouteGroupId } =
    useActiveRouteGroupActions();
  const { rememberRouteGroupForPlan } = useActiveRouteGroupActions();

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

  const handleRouteGroupClick = useCallback(
    (item: RouteGroupRailItem) => {
      if (item.route_group_id === activeRouteGroupId) {
        clearActiveRouteGroupSelection();
        return;
      }
      setActiveRouteGroupId(item.route_group_id);
      if (typeof planId === "number") {
        rememberRouteGroupForPlan(planId, item.route_group_id);
      }
    },
    [
      activeRouteGroupId,
      clearActiveRouteGroupSelection,
      planId,
      rememberRouteGroupForPlan,
      setActiveRouteGroupId,
    ],
  );

  return {
    railItems,
    handleRouteGroupClick,
  };
};
