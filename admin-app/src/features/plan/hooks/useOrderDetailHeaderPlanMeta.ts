import { useMemo } from "react";

import { useRouteSolutionStopStore } from "../routeGroup/store/routeSolutionStop.store";
import { useRouteSolutionStore } from "../routeGroup/store/routeSolution.store";
import { useRoutePlanByServerId } from "../store/useRoutePlan.selector";
import {
  extractOrderDetailHeaderPlanMeta,
  type OrderDetailHeaderPlanMeta,
} from "../domain/extractOrderDetailHeaderPlanMeta";
import type { RouteSolutionStop } from "../routeGroup/types/routeSolutionStop";

type UseOrderDetailHeaderPlanMetaParams = {
  orderId?: number | null;
  routePlanId?: number | null;
  routeGroupId?: number | null;
};

const rankStop = (stop: RouteSolutionStop): number =>
  typeof stop.stop_order === "number"
    ? stop.stop_order
    : Number.POSITIVE_INFINITY;

export const useOrderDetailHeaderPlanMeta = ({
  orderId,
  routePlanId,
  routeGroupId,
}: UseOrderDetailHeaderPlanMetaParams): OrderDetailHeaderPlanMeta => {
  const routePlan = useRoutePlanByServerId(routePlanId ?? null) ?? null;
  const routeSolutionIds = useRouteSolutionStore((state) => state.allIds);
  const routeSolutionByClientId = useRouteSolutionStore(
    (state) => state.byClientId,
  );
  const routeStopIds = useRouteSolutionStopStore((state) => state.allIds);
  const routeStopByClientId = useRouteSolutionStopStore(
    (state) => state.byClientId,
  );

  const routeStop = useMemo(() => {
    if (typeof orderId !== "number") {
      return null;
    }

    const selectedSolutionId =
      typeof routeGroupId === "number"
        ? (routeSolutionIds
            .map((clientId) => routeSolutionByClientId[clientId])
            .find(
              (solution) =>
                solution?.route_group_id === routeGroupId &&
                solution.is_selected,
            )?.id ?? null)
        : null;

    const matchingStops = routeStopIds
      .map((clientId) => routeStopByClientId[clientId])
      .filter(
        (stop): stop is RouteSolutionStop =>
          Boolean(stop) && stop.order_id === orderId,
      );

    if (matchingStops.length === 0) {
      return null;
    }

    if (typeof selectedSolutionId === "number") {
      const selectedStop =
        matchingStops.find(
          (stop) => stop.route_solution_id === selectedSolutionId,
        ) ?? null;
      if (selectedStop) {
        return selectedStop;
      }
    }

    return (
      [...matchingStops].sort(
        (left, right) => rankStop(left) - rankStop(right),
      )[0] ?? null
    );
  }, [
    orderId,
    routeGroupId,
    routeSolutionByClientId,
    routeSolutionIds,
    routeStopByClientId,
    routeStopIds,
  ]);

  return useMemo(
    () =>
      extractOrderDetailHeaderPlanMeta({
        routePlan,
        routeStop,
        fallbackPlanLabel:
          typeof routePlanId === "number" ? `Plan #${routePlanId}` : null,
      }),
    [routePlan, routePlanId, routeStop],
  );
};
