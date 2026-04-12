import type { RouteSolutionStop } from "@/features/plan/routeGroup/types/routeSolutionStop";
import {
  removeRouteSolutionStop,
  upsertRouteSolutionStops,
  useRouteSolutionStopStore,
} from "@/features/plan/routeGroup/store/routeSolutionStop.store";

const dedupePositiveOrderIds = (orderIds: number[]) =>
  Array.from(new Set(orderIds.filter((id) => Number.isFinite(id) && id > 0)));

export const collectRouteSolutionStopsByOrderIds = (
  orderIds: number[],
): RouteSolutionStop[] => {
  const targetOrderIds = new Set(dedupePositiveOrderIds(orderIds));
  if (targetOrderIds.size === 0) {
    return [];
  }

  const state = useRouteSolutionStopStore.getState();
  return state.allIds.reduce<RouteSolutionStop[]>((acc, clientId) => {
    const stop = state.byClientId[clientId];
    if (!stop) return acc;
    if (
      typeof stop.order_id === "number" &&
      targetOrderIds.has(stop.order_id)
    ) {
      acc.push(stop);
    }
    return acc;
  }, []);
};

export const removeRouteSolutionStopsByOrderIds = (orderIds: number[]) => {
  const stops = collectRouteSolutionStopsByOrderIds(orderIds);
  stops.forEach((stop) => {
    removeRouteSolutionStop(stop.client_id);
  });
  return stops;
};

export const restoreCollectedRouteSolutionStops = (
  stops: RouteSolutionStop[],
) => {
  if (!stops.length) return;

  const table = {
    byClientId: Object.fromEntries(
      stops
        .filter((stop) => Boolean(stop?.client_id))
        .map((stop) => [stop.client_id, stop]),
    ),
    allIds: stops
      .map((stop) => stop.client_id)
      .filter((clientId): clientId is string => Boolean(clientId)),
  };

  if (!table.allIds.length) return;
  upsertRouteSolutionStops(table);
};
