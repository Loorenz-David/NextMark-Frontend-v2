import { RouteGroupOrderList } from "../components";
import { useRouteGroupPageContext } from "../context/useRouteGroupPageContext";
import { OrderLoadingList } from "@/shared/loadingCards/order";

type RouteGroupsPageContentProps = {
  hasActiveRouteGroup: boolean;
};

export const RouteGroupsPageContent = ({
  hasActiveRouteGroup,
}: RouteGroupsPageContentProps) => {
  const { orderCount, routeGroup, routeSolutionStops, selectedRouteSolution } =
    useRouteGroupPageContext();

  const isLoading = routeGroup?.is_loading;
  const shouldHaveStops = Math.max(0, routeGroup?.total_orders ?? 0) > 0;
  const optimizationLoadingCount = Math.max(
    3,
    Math.min(orderCount || routeGroup?.total_orders || 0, 8),
  );
  const hasFullSelectedSolution =
    selectedRouteSolution?._representation === "full";
  const hasHydratedStops = !shouldHaveStops || routeSolutionStops.length > 0;
  const isHydratingRouteGroupOrders =
    hasActiveRouteGroup &&
    !isLoading &&
    shouldHaveStops &&
    (selectedRouteSolution == null ||
      !hasFullSelectedSolution ||
      !hasHydratedStops);

  return (
    <div className="admin-route-groups-page-content relative flex h-full w-full min-w-0 flex-col overflow-hidden bg-[var(--color-primary)]/5">
      {!hasActiveRouteGroup ? (
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="max-w-md rounded-xl border border-border bg-surface-raised p-6 text-center">
            <h3 className="text-lg font-semibold text-text">
              Select a Route Group
            </h3>
            <p className="mt-2 text-sm text-muted">
              Choose a zone from the menu to open its route, review the stop
              order, and run its actions.
            </p>
          </div>
        </div>
      ) : !isLoading || isLoading === "isOptimizing" ? (
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {isLoading === "isOptimizing" ? (
            <div className="pt-3">
              <OrderLoadingList
                variant="routeGroup"
                count={optimizationLoadingCount}
              />
            </div>
          ) : isHydratingRouteGroupOrders ? (
            <OrderLoadingList variant="routeGroup" />
          ) : (
            <RouteGroupOrderList />
          )}
        </div>
      ) : null}
    </div>
  );
};
