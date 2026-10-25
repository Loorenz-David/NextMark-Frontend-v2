import type { Order } from "@/features/order/types/order";
import type { RouteSolutionStop } from "@/features/plan/routeGroup/types/routeSolutionStop";
import { formatRouteTimelineTime } from "@/features/plan/routeGroup/utils/formatRouteTime";

import { RouteTimelineRow } from "../timeline";
import { RouteGroupOrderCard } from "./RouteGroupOrderCard";

type RouteGroupStopEntry = {
  stop: RouteSolutionStop;
  order: Order;
};

type RouteGroupOrderGroupChildrenProps = {
  entries: RouteGroupStopEntry[];
  planStartDate?: string | null;
  routeGroupId?: number | null;
  contentHidden?: boolean;
};

export const RouteGroupOrderGroupChildren = ({
  entries,
  planStartDate,
  routeGroupId,
  contentHidden = false,
}: RouteGroupOrderGroupChildrenProps) => (
  <div className="flex flex-col">
    {entries.map((entry, index) => {
      const isFirst = index === 0;
      const isLast = index === entries.length - 1;

      return (
        <RouteTimelineRow
          key={entry.stop.client_id}
          time={formatRouteTimelineTime(
            entry.stop.expected_arrival_time,
            planStartDate,
          )}
          contentHidden={contentHidden}
        >
          <div className="relative ml-3 pl-6">
            {/* Branch from the group header to each stop, ending level with
                the stop's time on the timeline. */}
            <div
              className={`pointer-events-none absolute left-0 w-px bg-[var(--color-muted)]/40 ${
                isFirst ? "-top-4" : "-top-2"
              } ${isLast ? "bottom-1/2" : "-bottom-2"}`}
            />
            <div className="pointer-events-none absolute left-0 top-1/2 h-px w-4 bg-[var(--color-primary)]/40" />
            <RouteGroupOrderCard
              order={entry.order}
              planStartDate={planStartDate}
              routeGroupId={routeGroupId}
            />
          </div>
        </RouteTimelineRow>
      );
    })}
  </div>
);
