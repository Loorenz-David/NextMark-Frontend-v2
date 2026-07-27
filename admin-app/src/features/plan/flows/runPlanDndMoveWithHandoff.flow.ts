export const runPlanDndMoveWithHandoff = async <
  TMoveResult extends { success: boolean },
  THandoffResult,
>({
  move,
  handoff,
  handoffMode = "concurrent",
}: {
  move: () => Promise<TMoveResult>;
  handoff?: () => Promise<THandoffResult>;
  handoffMode?: "concurrent" | "after_move_success";
}): Promise<{
  moveResult: TMoveResult;
  handoffResult: THandoffResult | null;
}> => {
  if (handoffMode === "after_move_success") {
    // Plan creation cannot expose a route-plan schedule until the server has
    // returned the new plan and the order link has been patched into the store.
    const moveResult = await move();
    const handoffResult =
      moveResult.success && handoff ? await handoff() : null;
    return { moveResult, handoffResult };
  }

  // Start the move first, then the handoff, then await both together.
  //
  // The move's optimistic store update — the order's new delivery_plan_id — runs
  // synchronously before its server round-trip, so invoking move() first
  // guarantees the order store already points at the target plan by the time
  // handoff() resolves the route-plan schedule it streams to the linked device.
  // The two then run concurrently: the form reaches the customer or device at
  // the same time as the plan assignment, not after it.
  //
  // Fire-and-forget: the handoff is deliberately NOT gated on the move
  // succeeding. A rare server-side move failure rolls back the optimistic
  // assignment but leaves the already-sent form in place; each side reports its
  // own outcome to the user.
  const movePromise = move();
  const handoffPromise: Promise<THandoffResult | null> = handoff
    ? handoff()
    : Promise.resolve(null);

  const [moveResult, handoffResult] = await Promise.all([
    movePromise,
    handoffPromise,
  ]);

  return { moveResult, handoffResult };
};
