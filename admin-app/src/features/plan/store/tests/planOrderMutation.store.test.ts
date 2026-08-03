import { usePlanOrderMutationStore } from "../planOrderMutation.store";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const isPending = (planId: number) =>
  (usePlanOrderMutationStore.getState().pendingCountByPlanId[planId] ?? 0) > 0;

const reset = () =>
  usePlanOrderMutationStore.setState({ pendingCountByPlanId: {} });

export const runPlanOrderMutationStoreTests = () => {
  const { beginMutation, finishMutation } =
    usePlanOrderMutationStore.getState();

  // A move marks both ends: the plan losing the order and the one gaining it.
  reset();
  beginMutation([32, 949]);
  assert(isPending(32), "the source plan is pending");
  assert(isPending(949), "the destination plan is pending");
  finishMutation([32, 949]);
  assert(!isPending(32) && !isPending(949), "both settle when the move ends");

  // Two moves touching the same plan: the first to finish must not clear it.
  reset();
  beginMutation([32]);
  beginMutation([32, 949]);
  finishMutation([32]);
  assert(isPending(32), "a plan with work still in flight stays pending");
  finishMutation([32, 949]);
  assert(!isPending(32), "the plan settles once the last move ends");
  assert(!isPending(949), "the other plan settles with it");

  // Unscheduling has only a source plan; a null destination must not be tracked.
  reset();
  beginMutation([32]);
  assert(isPending(32), "unscheduling marks the plan it leaves");
  finishMutation([32]);
  assert(
    Object.keys(usePlanOrderMutationStore.getState().pendingCountByPlanId)
      .length === 0,
    "settled plans are removed rather than left at zero",
  );

  // Non-finite ids never reach the map.
  reset();
  beginMutation([Number.NaN, 0]);
  assert(
    Object.keys(usePlanOrderMutationStore.getState().pendingCountByPlanId)
      .length === 1,
    "NaN is ignored while a real id is kept",
  );

  // A stray finish cannot drive the count negative and wedge the spinner on.
  reset();
  finishMutation([32]);
  assert(!isPending(32), "finishing an untracked plan is a no-op");
  beginMutation([32]);
  finishMutation([32]);
  finishMutation([32]);
  beginMutation([32]);
  assert(isPending(32), "an extra finish does not corrupt later counts");

  reset();
};
