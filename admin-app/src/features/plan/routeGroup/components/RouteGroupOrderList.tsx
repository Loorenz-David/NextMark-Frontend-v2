import { useMemo, type UIEvent } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { RouteGroupOrderCard } from "./cards/RouteGroupOrderCard";
import { DraggableRouteGroupOrderCard } from "./cards/DraggableRouteGroupOrderCard";
import { RouteTimelineEdge, RouteTimelineRow } from "./timeline";
import { RouteSolutionWarnings } from "./warnings/RouteSolutionWarnings";
import { useRouteGroupPageContext } from "../context/useRouteGroupPageContext";
import { useRouteGroupStopOrdering } from "../hooks/useRouteGroupStopOrdering";
import { formatRouteTimelineTime } from "@/features/plan/routeGroup/utils/formatRouteTime";
import { buildRouteGroupStopAddressGroups } from "../domain/routeGroupAddressGroup.flow";
import { DraggableRouteGroupOrderGroupCard } from "./cards/DraggableRouteGroupOrderGroupCard";
import {
  useOrderGroupUIActions,
  useOrderGroupUIStore,
} from "@/features/order/store/orderGroupUI.store";
import { OrderLoadingCard } from "@/shared/loadingCards/order";

type RouteGroupOrderListProps = {
  onScrollContainer?: (event: UIEvent<HTMLDivElement>) => void;
  topReservedOffset?: number;
  bottomReservedOffset?: number;
  /**
   * Render as flowing content instead of owning a scroll container. The
   * phone layout puts the rail, action bar and this list in one scroll
   * column so the chrome scrolls away with the stops.
   */
  scrollsWithParent?: boolean;
};

export const RouteGroupOrderList = ({
  onScrollContainer,
  topReservedOffset = 0,
  bottomReservedOffset = 0,
  scrollsWithParent = false,
}: RouteGroupOrderListProps) => {
  const {
    orders,
    planStartDate,
    routeSolutionStops,
    stopByOrderId,
    ordersById,
    boundaryLocations,
    selectedRouteSolution,
    routeSolutionWarningRegistry,
    routeGroupPageActions,
    incomingPendingOrderPlaceholderKeys,
  } = useRouteGroupPageContext();


  const { sortedEntries, missingOrders, sortableIds } =
    useRouteGroupStopOrdering(
      orders,
      routeSolutionStops,
      stopByOrderId,
      ordersById,
    );
  const groupedStops = useMemo(
    () => buildRouteGroupStopAddressGroups(sortedEntries),
    [sortedEntries],
  );
  const expandedGroupsByKey = useOrderGroupUIStore(
    (state) => state.expandedGroupsByKey,
  );
  const { toggleGroup } = useOrderGroupUIActions();
  const allOrderedStopClientIds = useMemo(
    () => sortedEntries.map((entry) => entry.stop.client_id),
    [sortedEntries],
  );
  const visibleSortableIds = useMemo(() => {
    if (groupedStops.length === 0) return sortableIds;

    const visibleIds: string[] = [];
    groupedStops.forEach((group) => {
      if (group.entries.length <= 1) {
        const firstClientId = group.entries[0]?.stop.client_id;
        if (firstClientId) visibleIds.push(firstClientId);
        return;
      }

      visibleIds.push(`route_stop_group:${group.key}`);
    });
    return visibleIds;
  }, [groupedStops, sortableIds]);

  const strategyLabel = getRouteStrategyLabel(
    selectedRouteSolution?.route_end_strategy,
  );
  const activeRouteGroupId = selectedRouteSolution?.route_group_id ?? null
  const startLocationLabel = `Start · ${strategyLabel}`;
  const endLocationLabel = `End · ${strategyLabel}`;

  return (
    <div
      className={
        scrollsWithParent
          ? "flex flex-col overflow-x-hidden"
          : "flex min-h-0 flex-1 flex-col overflow-x-hidden"
      }
    >
      <div
        className={
          scrollsWithParent
            ? "pl-1 pr-4"
            : "flex-1 min-h-0 overflow-y-auto scroll-thin pl-1 pr-4"
        }
        onScroll={scrollsWithParent ? undefined : onScrollContainer}
      >
        <div
          // No gap: rows carry their own spacing so the timeline runs
          // unbroken from start to end, also while rows shift under a drag.
          className="flex min-h-full flex-col"
          style={{
            paddingTop: topReservedOffset
              ? `${topReservedOffset}px`
              : undefined,
            paddingBottom: bottomReservedOffset
              ? `${bottomReservedOffset}px`
              : undefined,
            transition: "padding-top 220ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {boundaryLocations.start.location && (
            <RouteTimelineEdge
              edge="start"
              title={startLocationLabel}
              address={boundaryLocations.start.location.street_address ?? "—"}
              time={formatRouteTimelineTime(
                boundaryLocations.start.time,
                planStartDate,
              )}
              continues={
                groupedStops.length > 0 ||
                missingOrders.length > 0 ||
                incomingPendingOrderPlaceholderKeys.length > 0
              }
            />
          )}
          <SortableContext
            items={visibleSortableIds}
            strategy={verticalListSortingStrategy}
          >
            {groupedStops.map((group) => {
              if (group.entries.length <= 1) {
                const entry = group.entries[0];
                if (!entry) return null;
                return (
                  <DraggableRouteGroupOrderCard
                    key={entry.stop.client_id}
                    order={entry.order}
                    stop={entry.stop}
                    planStartDate={planStartDate}
                    routeGroupId={activeRouteGroupId}
                    allOrderedStopClientIds={allOrderedStopClientIds}
                  />
                );
              }

              const uiKey = `local:${group.key}`;
              const expanded = expandedGroupsByKey[uiKey] ?? false;

              return (
                <DraggableRouteGroupOrderGroupCard
                  key={group.key}
                  group={group}
                  expanded={expanded}
                  onToggleExpanded={() => toggleGroup(uiKey)}
                  planStartDate={planStartDate}
                  routeGroupId={activeRouteGroupId}
                  allOrderedStopClientIds={allOrderedStopClientIds}
                />
              );
            })}
          </SortableContext>
          {missingOrders.map((order) => (
            <RouteTimelineRow key={order.client_id} time={{ status: "none" }}>
              <RouteGroupOrderCard
                order={order}
                planStartDate={planStartDate}
                routeGroupId={activeRouteGroupId}
              />
            </RouteTimelineRow>
          ))}
          {incomingPendingOrderPlaceholderKeys.map((placeholderKey) => (
            <RouteTimelineRow
              key={placeholderKey}
              time={{ status: "loading" }}
            >
              <OrderLoadingCard variant="routeGroup" />
            </RouteTimelineRow>
          ))}
          {boundaryLocations.end.location && groupedStops.length > 0 && (
            <div className="pb-10">
              <RouteTimelineEdge
                edge="end"
                title={endLocationLabel}
                address={boundaryLocations.end.location.street_address ?? "—"}
                time={formatRouteTimelineTime(
                  boundaryLocations.end.time,
                  planStartDate,
                )}
                addon={
                  <RouteSolutionWarnings
                    warnings={boundaryLocations.end.warnings}
                    planStartDate={planStartDate}
                    registry={routeSolutionWarningRegistry}
                    routeGroupActions={routeGroupPageActions}
                  />
                }
              />
            </div>
          )}
          {/* <div className="flex h-[800px] bg-black"></div> */}
        </div>
      </div>
    </div>
  );
};

const getRouteStrategyLabel = (strategy: string | null | undefined) => {
  if (strategy === "end_at_last_stop") return "End at last stop";
  if (strategy === "custom_end_address") return "Custom end";
  return "Round trip";
};
