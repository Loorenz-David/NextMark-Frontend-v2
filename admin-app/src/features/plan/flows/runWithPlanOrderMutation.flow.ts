import { usePlanOrderMutationStore } from "../store/planOrderMutation.store";

/**
 * Marks every plan an order move touches as busy for the duration of the
 * request, so their cards can show progress.
 *
 * Both ends of a move are marked: the plan losing the order and the one gaining
 * it. Local delivery re-sequences and re-optimizes its routes server-side, so
 * the response can lag well behind the optimistic store update.
 */
export const runWithPlanOrderMutation = async <T>(
  planIds: Array<number | null | undefined>,
  operation: () => Promise<T>,
): Promise<T> => {
  const affectedPlanIds = planIds.filter(
    (planId): planId is number =>
      typeof planId === "number" && Number.isFinite(planId),
  );

  if (affectedPlanIds.length === 0) {
    return operation();
  }

  usePlanOrderMutationStore.getState().beginMutation(affectedPlanIds);
  try {
    return await operation();
  } finally {
    usePlanOrderMutationStore.getState().finishMutation(affectedPlanIds);
  }
};
