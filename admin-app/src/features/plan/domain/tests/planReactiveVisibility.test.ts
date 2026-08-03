import type { DeliveryPlan } from "@/features/plan/types/plan";

import { reactivePlanVisibility } from "../planReactiveVisibility";

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

export const runPlanReactiveVisibilityTests = () => {
  assert(
    reactivePlanVisibility(buildPlan({ plan_type: "store_pickup" })),
    "with no query every plan type stays visible",
  );

  assert(
    reactivePlanVisibility(buildPlan({ plan_type: "store_pickup" }), {}),
    "an empty query does not filter by type",
  );

  // Before this change the filter compared against the literal 'local_delivery',
  // so any non-local plan disappeared as soon as a type filter was applied.
  assert(
    reactivePlanVisibility(buildPlan({ plan_type: "store_pickup" }), {
      plan_type: "store_pickup",
    }),
    "a plan matching a single-value type filter stays visible",
  );

  assert(
    !reactivePlanVisibility(buildPlan({ plan_type: "store_pickup" }), {
      plan_type: "local_delivery",
    }),
    "a plan not matching a single-value type filter is hidden",
  );

  assert(
    reactivePlanVisibility(buildPlan({ plan_type: "international_shipping" }), {
      plan_type: ["local_delivery", "international_shipping"],
    }),
    "a plan matching one of a list of types stays visible",
  );

  assert(
    !reactivePlanVisibility(buildPlan({ plan_type: "store_pickup" }), {
      plan_type: ["local_delivery", "international_shipping"],
    }),
    "a plan matching none of a list of types is hidden",
  );

  assert(
    reactivePlanVisibility(buildPlan({ plan_type: undefined }), {
      plan_type: "local_delivery",
    }),
    "a plan with no type is treated as local delivery when filtering",
  );

  assert(
    reactivePlanVisibility(buildPlan({ plan_type: "store_pickup" }), {
      filters: { plan_type: "store_pickup" },
    }),
    "the type filter is honoured when nested inside filters",
  );
};
