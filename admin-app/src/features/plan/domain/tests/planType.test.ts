import {
  DEFAULT_PLAN_TYPE,
  isLocalDeliveryPlan,
  isPlanType,
  normalizePlanType,
  PLAN_TYPES,
  PLAN_TYPE_OPTIONS,
  resolvePlanType,
} from "../planType";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runPlanTypeTests = () => {
  assert(PLAN_TYPES.length === 3, "all three plan types are registered");

  assert(isPlanType("local_delivery"), "local_delivery is a plan type");
  assert(
    isPlanType("international_shipping"),
    "international_shipping is a plan type",
  );
  assert(isPlanType("store_pickup"), "store_pickup is a plan type");
  assert(!isPlanType("local-delivery"), "hyphenated values are not plan types");
  assert(!isPlanType(null), "null is not a plan type");
  assert(!isPlanType(undefined), "undefined is not a plan type");
  assert(!isPlanType(7), "non-strings are not plan types");

  assert(
    normalizePlanType("store_pickup") === "store_pickup",
    "a known value normalizes to itself",
  );
  assert(
    normalizePlanType(null) === DEFAULT_PLAN_TYPE,
    "null falls back to the default type",
  );
  assert(
    normalizePlanType("route_plan") === DEFAULT_PLAN_TYPE,
    "the legacy 'route_plan' literal falls back to the default type",
  );

  // Plans served before the backend added plan_type were all route operations
  // plans, so an absent value must read as local delivery rather than unknown.
  assert(
    resolvePlanType({ plan_type: undefined }) === "local_delivery",
    "a plan with no type resolves to local delivery",
  );
  assert(
    resolvePlanType(null) === "local_delivery",
    "a missing plan resolves to local delivery",
  );
  assert(
    resolvePlanType({ plan_type: "international_shipping" }) ===
      "international_shipping",
    "an explicit type wins",
  );

  assert(
    isLocalDeliveryPlan({ plan_type: "local_delivery" }),
    "local delivery plans are local delivery",
  );
  assert(
    !isLocalDeliveryPlan({ plan_type: "store_pickup" }),
    "store pickup plans are not local delivery",
  );
  assert(
    isLocalDeliveryPlan(undefined),
    "an unknown plan is treated as local delivery",
  );

  assert(
    PLAN_TYPE_OPTIONS.length === PLAN_TYPES.length,
    "every plan type is offered in the create form",
  );
  assert(
    PLAN_TYPE_OPTIONS.every((option) => option.label.length > 0),
    "every plan type option has a label",
  );
};
