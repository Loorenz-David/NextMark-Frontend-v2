import {
  selectRoutePlanByServerId,
  updateRoutePlan,
  useRoutePlanStore,
} from "@/features/plan/store/routePlan.slice";

type RoutePlanTargetPatch = {
  id: number;
  state_id?: number | null;
};

export const applyRoutePlanTargetPatch = (
  patch?: RoutePlanTargetPatch | null,
) => {
  if (!patch || typeof patch.id !== "number") {
    return;
  }

  const plan = selectRoutePlanByServerId(patch.id)(useRoutePlanStore.getState());
  if (!plan?.client_id) {
    return;
  }

  updateRoutePlan(plan.client_id, (existing) => ({
    ...existing,
    state_id:
      typeof patch.state_id === "number" || patch.state_id === null
        ? patch.state_id
        : existing.state_id,
  }));
};
