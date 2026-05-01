import type { Order } from "@/features/order/types/order";
import type { RouteSolutionStop } from "@/features/plan/routeGroup/types/routeSolutionStop";

import { RouteGroupOrderCard } from "./RouteGroupOrderCard";

type RouteGroupStopEntry = {
  stop: RouteSolutionStop;
  order: Order;
};

type RouteGroupOrderGroupChildrenProps = {
  entries: RouteGroupStopEntry[];
  planStartDate?: string | null;
  routeGroupId?: number | null;
  projectedStopOrderByClientId?: Map<string, number> | null;
};

export const RouteGroupOrderGroupChildren = ({
  entries,
  planStartDate,
  routeGroupId,
  projectedStopOrderByClientId,
}: RouteGroupOrderGroupChildrenProps) => (
  <div className="relative ml-6 pl-6 mt-4 mb-4 ">
    {entries.length > 1 ? (
      <div className="pointer-events-none absolute bottom-2 -left-[2px] -top-6 w-px bg-[var(--color-muted)]/40" />
    ) : null}

    <div className="flex flex-col gap-3">
      {entries.map((entry) => (
        <div key={entry.stop.client_id} className="relative">
          {entries.length > 1 ? (
            <div className="pointer-events-none absolute -left-[19px] top-8 h-px w-4 bg-[var(--color-primary)]/40" />
          ) : null}
          <RouteGroupOrderCard
            order={entry.order}
            stop={entry.stop}
            displayStopOrder={
              projectedStopOrderByClientId?.get(entry.stop.client_id) ??
              entry.stop.stop_order ??
              null
            }
            planStartDate={planStartDate}
            routeGroupId={routeGroupId}
          />
        </div>
      ))}
    </div>
  </div>
);
