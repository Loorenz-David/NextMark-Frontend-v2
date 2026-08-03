import type { Order } from "@/features/order";

import {
  resolveAutoCreatePlanType,
  resolveObjectiveMismatch,
} from "../planObjectiveMismatch.domain";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 42,
  client_id: "order-42",
  ...overrides,
});

export const runPlanObjectiveMismatchDomainTests = () => {
  // --- resolveObjectiveMismatch -------------------------------------------

  assert(
    resolveObjectiveMismatch({
      orders: [buildOrder({ order_plan_objective: "local_delivery" })],
      targetPlanType: "local_delivery",
    }) === null,
    "an order already matching the plan type does not prompt",
  );

  assert(
    resolveObjectiveMismatch({
      orders: [buildOrder({ order_plan_objective: null })],
      targetPlanType: "store_pickup",
    }) === null,
    "an order with no stated objective adopts the plan type silently",
  );

  assert(
    resolveObjectiveMismatch({
      orders: [buildOrder({ order_plan_objective: "route_plan" })],
      targetPlanType: "store_pickup",
    }) === null,
    "an unrecognised objective is treated as no intention, not a conflict",
  );

  assert(
    resolveObjectiveMismatch({ orders: [], targetPlanType: "local_delivery" }) ===
      null,
    "an empty drag does not prompt",
  );

  assert(
    resolveObjectiveMismatch({
      orders: [null, undefined],
      targetPlanType: "local_delivery",
    }) === null,
    "orders missing from the store do not prompt",
  );

  const singleMismatch = resolveObjectiveMismatch({
    orders: [buildOrder({ order_plan_objective: "international_shipping" })],
    targetPlanType: "store_pickup",
  });
  assert(singleMismatch !== null, "a differing objective prompts");
  assert(
    singleMismatch?.targetPlanType === "store_pickup",
    "the mismatch reports the destination type",
  );

  const partialMismatch = resolveObjectiveMismatch({
    orders: [
      buildOrder({ id: 1, order_plan_objective: "local_delivery" }),
      buildOrder({ id: 2, order_plan_objective: "international_shipping" }),
      buildOrder({ id: 3, order_plan_objective: null }),
    ],
    targetPlanType: "local_delivery",
  });
  assert(
    partialMismatch?.orders.length === 1 && partialMismatch.orders[0].id === 2,
    "only the orders that actually disagree are reported",
  );

  // --- resolveAutoCreatePlanType ------------------------------------------

  assert(
    resolveAutoCreatePlanType([]) === "local_delivery",
    "an empty drag creates a local delivery plan",
  );

  assert(
    resolveAutoCreatePlanType([buildOrder({ order_plan_objective: null })]) ===
      "local_delivery",
    "orders with no objective create a local delivery plan",
  );

  assert(
    resolveAutoCreatePlanType([
      buildOrder({ id: 1, order_plan_objective: "international_shipping" }),
      buildOrder({ id: 2, order_plan_objective: "international_shipping" }),
    ]) === "international_shipping",
    "a unanimous objective decides the plan type",
  );

  assert(
    resolveAutoCreatePlanType([
      buildOrder({ id: 1, order_plan_objective: "international_shipping" }),
      buildOrder({ id: 2, order_plan_objective: null }),
    ]) === "international_shipping",
    "orders with no objective do not dilute a unanimous intention",
  );

  assert(
    resolveAutoCreatePlanType([
      buildOrder({ id: 1, order_plan_objective: "store_pickup" }),
      buildOrder({ id: 2, order_plan_objective: "store_pickup" }),
      buildOrder({ id: 3, order_plan_objective: "local_delivery" }),
    ]) === "store_pickup",
    "a mixed drag takes the majority objective",
  );

  assert(
    resolveAutoCreatePlanType([
      buildOrder({ id: 1, order_plan_objective: "store_pickup" }),
      buildOrder({ id: 2, order_plan_objective: "international_shipping" }),
    ]) === "local_delivery",
    "a tie falls back to local delivery",
  );

  // Order of appearance must not change the outcome of a tie.
  assert(
    resolveAutoCreatePlanType([
      buildOrder({ id: 1, order_plan_objective: "international_shipping" }),
      buildOrder({ id: 2, order_plan_objective: "store_pickup" }),
    ]) === "local_delivery",
    "a tie resolves the same whichever objective was dragged first",
  );
};
