import type { RouteSolutionStopMap } from "@/features/plan/routeGroup/types/routeSolutionStop";

import {
  filterOrderStopsByOrder,
  normalizeOrderStopResponse,
} from "../../domain/orderStopResponse";
import { mergeServerRouteStops } from "@/features/plan/routeGroup/domain/mergeServerRouteStops";

import {
  claimOrderMutation,
  hasPendingOrderMutation,
  isOrderMutationSuperseded,
  releaseOrderMutation,
  resetOrderMutationSequence,
} from "../orderMutationSequence.store";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const stopFor = (orderId: number, stopOrder: number) => ({
  client_id: `stop-${orderId}`,
  id: 900 + orderId,
  order_id: orderId,
  route_solution_id: 77,
  stop_order: stopOrder,
});

export const runOrderMutationSequenceTests = () => {
  // --- claim ordering ------------------------------------------------------

  resetOrderMutationSequence();
  const claimA = claimOrderMutation([5835]);
  assert(
    !isOrderMutationSuperseded(5835, claimA),
    "a claim is not superseded by itself",
  );

  const claimB = claimOrderMutation([5836]);
  assert(claimB > claimA, "each claim gets a newer sequence number");
  assert(
    isOrderMutationSuperseded(5836, claimA),
    "an order claimed later is superseded for the earlier move",
  );
  assert(
    !isOrderMutationSuperseded(5836, claimB),
    "the newer move still owns its own order",
  );
  assert(
    !isOrderMutationSuperseded(5835, claimB),
    "an order the newer move never touched is not superseded for it",
  );
  assert(
    !isOrderMutationSuperseded(9999, claimA),
    "an order no mutation has claimed is never superseded",
  );

  // The same order moved twice: the first response must not undo the second.
  resetOrderMutationSequence();
  const firstMove = claimOrderMutation([5835]);
  claimOrderMutation([5835]);
  assert(
    isOrderMutationSuperseded(5835, firstMove),
    "a re-moved order is superseded for the earlier move",
  );

  // --- the reported case ---------------------------------------------------

  // Move A takes order 5835 off route 77. While it is in flight, move B takes
  // order 5836 off the same route. A's response then arrives carrying the route
  // resequenced as the server saw it — with 5836 still on board.
  resetOrderMutationSequence();
  const moveA = claimOrderMutation([5835]);
  claimOrderMutation([5836]);

  const responseStops = normalizeOrderStopResponse([
    stopFor(5836, 1),
    stopFor(7001, 2),
  ] as never) as RouteSolutionStopMap;
  assert(
    responseStops.allIds.length === 2,
    "the response carries the whole resequenced route",
  );

  const applicableStops = filterOrderStopsByOrder(
    responseStops,
    (orderId) => !isOrderMutationSuperseded(orderId, moveA),
  );

  assert(
    applicableStops?.allIds.length === 1,
    "only the untouched order's stop survives A's commit",
  );
  assert(
    applicableStops?.byClientId["stop-7001"] != null,
    "an order with no pending move is still applied",
  );
  assert(
    applicableStops?.byClientId["stop-5836"] == null,
    "the stop for the order move B already removed is dropped",
  );

  // B's own response is free to write that stop back when it lands.
  const moveBClaim = claimOrderMutation([5836]);
  const bStops = filterOrderStopsByOrder(
    responseStops,
    (orderId) => !isOrderMutationSuperseded(orderId, moveBClaim),
  );
  assert(
    bStops?.allIds.length === 2,
    "the newest claim applies its response in full",
  );

  // --- authoritative refetch during an in-flight move ----------------------

  // The path that actually caused the reported bug: finishing move A marks the
  // plan stale, which refetches the whole route. That snapshot predates move B,
  // so it still lists B's stop — and the refetch *replaces* every stop on the
  // solution rather than merging, so nothing about A's own response is involved.
  resetOrderMutationSequence();
  claimOrderMutation([5836]); // move B, still in flight

  const serverSnapshot = normalizeOrderStopResponse([
    stopFor(5836, 1),
    stopFor(7001, 2),
  ] as never) as RouteSolutionStopMap;

  const merged = mergeServerRouteStops({
    incoming: serverSnapshot,
    // B's stop is already gone locally, removed optimistically when B started.
    existing: [stopFor(7001, 2) as never],
    isOrderPending: hasPendingOrderMutation,
  });

  assert(
    merged.byClientId["stop-5836"] == null,
    "a refetch does not put back the stop an in-flight move removed",
  );
  assert(
    merged.byClientId["stop-7001"] != null,
    "stops for settled orders still come from the server",
  );

  // Once B settles, the next refetch is authoritative again.
  releaseOrderMutation([5836]);
  const mergedAfterRelease = mergeServerRouteStops({
    incoming: serverSnapshot,
    existing: [stopFor(7001, 2) as never],
    isOrderPending: hasPendingOrderMutation,
  });
  assert(
    mergedAfterRelease.byClientId["stop-5836"] != null,
    "a settled order accepts the server snapshot again",
  );

  // A stop the in-flight order still holds locally survives the replace.
  resetOrderMutationSequence();
  claimOrderMutation([5836]);
  const mergedPreservingLocal = mergeServerRouteStops({
    incoming: normalizeOrderStopResponse([
      stopFor(7001, 1),
    ] as never) as RouteSolutionStopMap,
    existing: [stopFor(5836, 4) as never],
    isOrderPending: hasPendingOrderMutation,
  });
  assert(
    mergedPreservingLocal.byClientId["stop-5836"]?.stop_order === 4,
    "local state for an in-flight order is carried across the replace",
  );

  // Overlapping moves on the same order: the mark clears only on the last one.
  resetOrderMutationSequence();
  claimOrderMutation([5836]);
  claimOrderMutation([5836]);
  releaseOrderMutation([5836]);
  assert(
    hasPendingOrderMutation(5836),
    "an order stays pending while a second move is unresolved",
  );
  releaseOrderMutation([5836]);
  assert(
    !hasPendingOrderMutation(5836),
    "the order settles once the last move releases",
  );

  // --- filter edges --------------------------------------------------------

  assert(
    filterOrderStopsByOrder(null, () => true) === null,
    "a missing stop map stays null",
  );
  assert(
    filterOrderStopsByOrder(responseStops, () => false) === null,
    "dropping every stop yields null rather than an empty map",
  );

  resetOrderMutationSequence();
};
