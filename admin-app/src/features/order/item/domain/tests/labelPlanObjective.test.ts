import type { DeliveryPlan } from "@/features/plan/types/plan";

import { resolveItemLabelPlanObjective } from "../labelPlanObjective";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const buildPlan = (overrides: Partial<DeliveryPlan> = {}): DeliveryPlan => ({
  client_id: "plan-1",
  label: "Plan",
  ...overrides,
});

export const runItemLabelPlanObjectiveTests = () => {
  // The case this rule exists for: labels are rendered before the move's
  // round-trip lands, so the order still carries the objective it is leaving.
  assert(
    resolveItemLabelPlanObjective({
      routePlan: buildPlan({ plan_type: "international_shipping" }),
      orderPlanObjective: "local_delivery",
    }) === "international_shipping",
    "the destination plan's type wins over the order's stale objective",
  );

  assert(
    resolveItemLabelPlanObjective({
      routePlan: buildPlan({ plan_type: "store_pickup" }),
      orderPlanObjective: null,
    }) === "store_pickup",
    "an order with no objective prints the plan's type",
  );

  assert(
    resolveItemLabelPlanObjective({
      routePlan: buildPlan({ plan_type: "local_delivery" }),
      orderPlanObjective: "local_delivery",
    }) === "local_delivery",
    "a matching objective is unchanged",
  );

  // Plans served before the backend added plan_type were all route operations.
  assert(
    resolveItemLabelPlanObjective({
      routePlan: buildPlan({ plan_type: undefined }),
      orderPlanObjective: "local_delivery",
    }) === "local_delivery",
    "a plan with no type still reads as local delivery",
  );

  // No plan: either the order is unassigned, or hydration failed. Either way the
  // order's own objective is all we have, and for an unassigned order it is the
  // correct answer.
  assert(
    resolveItemLabelPlanObjective({
      routePlan: null,
      orderPlanObjective: "international_shipping",
    }) === "international_shipping",
    "with no plan the order's own objective is printed",
  );

  assert(
    resolveItemLabelPlanObjective({
      routePlan: undefined,
      orderPlanObjective: undefined,
    }) === null,
    "no plan and no objective resolves to null rather than undefined",
  );
};
