import { useCallback, useState } from "react";

import type { OrderImportControls } from "@/features/order/components/OrderImportButton";

import {
  useRouteGroupPageCommands,
  useRouteGroupPageState,
} from "../context/useRouteGroupPageContext";
import {
  canMarkRouteGroupReadyForDelivery,
  shouldHighlightRouteOptimization,
} from "../domain/routeGroupMenu.domain";

/** What the route group menu shows and runs for the active route group. */
export const useRouteGroupMenuController = () => {
  const { routeGroupPageActions } = useRouteGroupPageCommands();
  const {
    plan,
    routeGroup,
    routeGroupState,
    orderCount,
    selectedRouteSolution,
    isSelectedSolutionOptimized,
    routeSolutionsOrdered,
  } = useRouteGroupPageState();
  const [importControls, setImportControls] = useState<OrderImportControls>({
    triggerFileInput: () => undefined,
    loading: false,
    disabled: true,
  });
  const handleImportReady = useCallback((controls: OrderImportControls) => {
    setImportControls(controls);
  }, []);

  const isBusy = Boolean(routeGroup?.is_loading);

  return {
    planId: plan?.id,
    hasActiveRouteGroup: routeGroup != null,
    isBusy,
    orderCount,
    stateLabel: routeGroupState?.name ?? null,
    stateColor: routeGroupState?.color ?? null,
    optimizeLabel: isSelectedSolutionOptimized
      ? "Update optimization"
      : "Optimize route",
    needsOptimization: shouldHighlightRouteOptimization({
      orderCount,
      isOptimized: selectedRouteSolution?.is_optimized,
      hasRouteWarnings: selectedRouteSolution?.has_route_warnings,
    }),
    canOptimize: orderCount > 0 && !isBusy,
    // One variant is just the route; the picker only helps with a choice.
    hasRouteVariants: routeSolutionsOrdered.length > 1,
    canMarkReady: canMarkRouteGroupReadyForDelivery({
      stateName: routeGroupState?.name,
      orderCount,
    }),
    importControls,
    handleImportReady,
    actions: {
      createOrder: routeGroupPageActions.handleCreateOrder,
      editRouteGroup: routeGroupPageActions.handleEditLocalPlan,
      optimizeRoute: routeGroupPageActions.optimizeRoute,
      markReadyForDelivery: routeGroupPageActions.routeReadyForDelivery,
      downloadRoute: routeGroupPageActions.handlePrintRouteSolution,
    },
  };
};
