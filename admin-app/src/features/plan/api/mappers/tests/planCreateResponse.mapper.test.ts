import { normalizePlanCreateBundle } from "../planCreateResponse.mapper";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runPlanCreateResponseMapperTests = () => {
  // `POST /route_plans/` keys the plan as `delivery_plan`.
  const localBundle = normalizePlanCreateBundle({
    delivery_plan: { client_id: "plan-1", label: "Local", plan_type: "local_delivery" },
    route_groups: [{ client_id: "rg-1" }],
  });
  assert(
    localBundle?.plan.client_id === "plan-1",
    "the local delivery response is read from delivery_plan",
  );
  assert(
    localBundle?.routeGroups.length === 1,
    "route groups from the local delivery response are carried through",
  );

  // The container endpoints key it as `route_plan`.
  const containerBundle = normalizePlanCreateBundle({
    route_plan: {
      client_id: "plan-2",
      label: "Q4 Overseas",
      plan_type: "international_shipping",
    },
  });
  assert(
    containerBundle?.plan.client_id === "plan-2",
    "the container response is read from route_plan",
  );
  assert(
    containerBundle?.routeGroups.length === 0,
    "a container plan reports no route groups",
  );

  // The domain child row is present in the JSON but deliberately ignored.
  const withChildRow = normalizePlanCreateBundle({
    route_plan: { client_id: "plan-3", label: "Counter A" },
    ...({ store_pickup_plan: { id: 2 } } as object),
  });
  assert(
    withChildRow?.plan.client_id === "plan-3",
    "an unread domain child row does not break normalization",
  );

  assert(
    normalizePlanCreateBundle(null) === null,
    "a missing bundle normalizes to null",
  );
  assert(
    normalizePlanCreateBundle({}) === null,
    "a bundle with neither key normalizes to null",
  );
  assert(
    normalizePlanCreateBundle({
      route_plan: { client_id: "", label: "Broken" },
    }) === null,
    "a plan without a client id is unusable and normalizes to null",
  );
};
