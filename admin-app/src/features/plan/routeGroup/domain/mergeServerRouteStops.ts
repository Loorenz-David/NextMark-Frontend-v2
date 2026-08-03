import type {
  RouteSolutionStop,
  RouteSolutionStopMap,
} from "@/features/plan/routeGroup/types/routeSolutionStop";

const toStopMap = (stops: RouteSolutionStop[]): RouteSolutionStopMap => {
  const byClientId: RouteSolutionStopMap["byClientId"] = {};
  const allIds: string[] = [];

  stops.forEach((stop) => {
    if (!stop?.client_id || byClientId[stop.client_id]) return;
    byClientId[stop.client_id] = stop;
    allIds.push(stop.client_id);
  });

  return { byClientId, allIds };
};

const toStopList = (
  stops: RouteSolutionStopMap | null | undefined,
): RouteSolutionStop[] =>
  (stops?.allIds ?? [])
    .map((clientId) => stops?.byClientId[clientId])
    .filter((stop): stop is RouteSolutionStop => Boolean(stop));

/**
 * Reconciles a server snapshot of a route's stops with orders that are still
 * being moved locally.
 *
 * Reading a route is authoritative — it replaces every stop on the solution. But
 * a move marks the plan stale, so finishing one move refetches the route while a
 * second move is still in flight, and the snapshot predates it. Applying it
 * verbatim puts the second order's stop back on the route the user just pulled
 * it off.
 *
 * Orders with a mutation in flight therefore keep whatever the local store holds
 * for them: the snapshot's version is dropped, and any stop they still have is
 * carried across the replace. Their own response settles them.
 */
export const mergeServerRouteStops = ({
  incoming,
  existing,
  isOrderPending,
}: {
  incoming: RouteSolutionStopMap | null | undefined;
  existing: RouteSolutionStop[];
  isOrderPending: (orderId: number | null | undefined) => boolean;
}): RouteSolutionStopMap => {
  const acceptedFromServer = toStopList(incoming).filter(
    (stop) => !isOrderPending(stop.order_id),
  );
  const preservedLocally = existing.filter((stop) =>
    isOrderPending(stop.order_id),
  );

  return toStopMap([...acceptedFromServer, ...preservedLocally]);
};
