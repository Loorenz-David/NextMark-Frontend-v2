import { useMemo } from "react";

import { usePopupManager } from "@/shared/resource-manager/useResourceManager";
import { buildRouteGroupHeaderSummary } from "../domain/buildRouteGroupHeaderSummary";
import { useRouteGroupPageState } from "../context/useRouteGroupPageContext";
import { useRouteGroupRailController } from "./useRouteGroupRail.controller";
import { useRouteGroupsByPlanId } from "../store/useRouteGroup.selector";

export const useRouteGroupsPageShellController = (
  planId: number | null | undefined,
) => {
  const popupManager = usePopupManager();
  const {
    plan,
    routeGroup,
    orders,
    orderCount,
    selectedRouteSolution,
    routeGroups,
  } = useRouteGroupPageState();
  const { railItems, handleRouteGroupClick } =
    useRouteGroupRailController(planId);
  const allRouteGroups = useRouteGroupsByPlanId(planId);

  const headerSummary = useMemo(
    () =>
      buildRouteGroupHeaderSummary({
        plan,
        routeGroups: allRouteGroups,
        activeRouteGroup: routeGroup,
        activeRouteGroupOrders: orders,
      }),
    [allRouteGroups, orders, plan, routeGroup],
  );

  const hasActiveRouteGroup = routeGroup != null;
  const isLoading = routeGroup?.is_loading;
  const showOptimizeRow = hasActiveRouteGroup && !isLoading && orderCount > 0;

  const handleCreateRouteGroup = () => {
    if (typeof planId !== "number") {
      return;
    }

    popupManager.open({
      key: "CreateRouteGroupForm",
      payload: { planId },
    });
  };

  return {
    railItems,
    handleRouteGroupClick,
    handleCreateRouteGroup,
    headerSummary,
    hasRouteGroups: routeGroups.length > 0,
    hasActiveRouteGroup,
    showOptimizeRow,
  };
};
