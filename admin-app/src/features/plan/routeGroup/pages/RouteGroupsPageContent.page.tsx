import { RouteGroupOrderList, RouteGroupsActionBar } from "../components";
import { OptimizationLoading } from "../components/spinners/Optimization.spinner";
import { MIN_LOADER_VISIBLE_MS } from "../constants/optimization.constants";
import { useRouteGroupPageContext } from "../context/useRouteGroupPageContext";
import { useRouteGroupActionBarVisibility } from "../hooks/useRouteGroupActionBarVisibility";
import { OrderLoadingList } from "@/shared/loadingCards/order";

type RouteGroupsPageContentProps = {
  showOptimizeRow: boolean;
  hasActiveRouteGroup: boolean;
};

const ACTION_BAR_HEIGHT_WITH_OPTIMIZE = 138;
const ACTION_BAR_HEIGHT_WITHOUT_OPTIMIZE = 82;

export const RouteGroupsPageContent = ({
  showOptimizeRow,
  hasActiveRouteGroup,
}: RouteGroupsPageContentProps) => {
  const { orderCount, routeGroup, routeSolutionStops, selectedRouteSolution } =
    useRouteGroupPageContext();

  const isLoading = routeGroup?.is_loading;
  const optimizationStartedAt = routeGroup?.optimization_started_at ?? null;
  const shouldHaveStops = Math.max(0, routeGroup?.total_orders ?? 0) > 0;
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
  const {
    isActionBarVisible,
    actionBarReservedHeight,
    isDesktopActionBarBehaviorEnabled,
    handleScroll,
  } = useRouteGroupActionBarVisibility({
    enabled: !isLoading,
    expandedHeight: showOptimizeRow
      ? ACTION_BAR_HEIGHT_WITH_OPTIMIZE
      : ACTION_BAR_HEIGHT_WITHOUT_OPTIMIZE,
  });

  return (
    <div className="relative flex h-full w-full min-w-0 flex-col overflow-hidden bg-[var(--color-primary)]/5">
      {hasActiveRouteGroup ? (
        <RouteGroupsActionBar
          useFloatingActionBar={isDesktopActionBarBehaviorEnabled}
          isActionBarVisible={isActionBarVisible}
          showOptimizeRow={showOptimizeRow}
        />
      ) : null}
      {!hasActiveRouteGroup ? (
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="max-w-md rounded-xl border border-white/10 bg-white/5 p-6 text-center">
            <h3 className="text-lg font-semibold text-white">
              Select a Route Group
            </h3>
            <p className="mt-2 text-sm text-white/70">
              Choose a zone from the rail to open its route, review the stop
              order, and edit it from the action panel.
            </p>
          </div>
        </div>
      ) : !isLoading ? (
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {isHydratingRouteGroupOrders ? (
            <OrderLoadingList
              variant="routeGroup"
              topReservedOffset={
                isDesktopActionBarBehaviorEnabled ? actionBarReservedHeight : 0
              }
            />
          ) : (
            <RouteGroupOrderList
              onScrollContainer={handleScroll}
              topReservedOffset={
                isDesktopActionBarBehaviorEnabled ? actionBarReservedHeight : 0
              }
            />
          )}
        </div>
      ) : isLoading == "isOptimizing" ? (
        <OptimizationLoading
          message={
            <>
              <p className="font-semibold text-[var(--color-muted)]">
                Optimization in progress
              </p>
              <p className="text-sm opacity-70">
                You can come back when it is ready.
              </p>
            </>
          }
          startedAt={optimizationStartedAt}
          orderCount={orderCount}
          minDurationMs={MIN_LOADER_VISIBLE_MS}
        />
      ) : null}
    </div>
  );
};
