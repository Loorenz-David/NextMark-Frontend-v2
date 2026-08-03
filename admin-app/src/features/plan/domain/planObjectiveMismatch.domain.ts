import type { Order } from "@/features/order";
import type { RoutePlanObjective } from "@/features/plan/types/plan";

import { DEFAULT_PLAN_TYPE, isPlanType } from "./planType";

export type ObjectiveMismatch = {
  targetPlanType: RoutePlanObjective;
  /** Only the orders that actually disagree, not the whole dragged set. */
  orders: Order[];
};

/**
 * An order carries its own intention in `order_plan_objective`. Assigning it to
 * a plan of a different type is legal — the backend performs the transition and
 * the order adopts the plan's type — but it discards that intention, so it needs
 * confirmation first.
 *
 * An order with no objective has stated no intention, so it adopts the plan type
 * silently and never triggers the prompt.
 *
 * Returns null when nothing disagrees, so callers can treat it as "no gate".
 */
export const resolveObjectiveMismatch = ({
  orders,
  targetPlanType,
}: {
  orders: Array<Order | null | undefined>;
  targetPlanType: RoutePlanObjective;
}): ObjectiveMismatch | null => {
  const mismatched = orders.filter((order): order is Order => {
    const objective = order?.order_plan_objective;
    if (!isPlanType(objective)) return false;
    return objective !== targetPlanType;
  });

  return mismatched.length > 0
    ? { targetPlanType, orders: mismatched }
    : null;
};

/**
 * Which plan type to create when a drop onto an empty calendar day creates the
 * plan implicitly. There is no plan yet to disagree with, so this reads the
 * dragged orders' intentions instead:
 *
 * - one distinct objective  → that type
 * - none stated             → local delivery
 * - several                 → the majority, ties falling back to local delivery
 *
 * Whatever it returns is then run through `resolveObjectiveMismatch`, so orders
 * left on the losing side of a mixed drag still get confirmed by the user.
 */
export const resolveAutoCreatePlanType = (
  orders: Array<Order | null | undefined>,
): RoutePlanObjective => {
  const countsByType = new Map<RoutePlanObjective, number>();

  orders.forEach((order) => {
    const objective = order?.order_plan_objective;
    if (!isPlanType(objective)) return;
    countsByType.set(objective, (countsByType.get(objective) ?? 0) + 1);
  });

  if (countsByType.size === 0) return DEFAULT_PLAN_TYPE;

  let winner: RoutePlanObjective = DEFAULT_PLAN_TYPE;
  let winningCount = 0;
  let isTied = false;

  countsByType.forEach((count, planType) => {
    if (count > winningCount) {
      winner = planType;
      winningCount = count;
      isTied = false;
      return;
    }
    if (count === winningCount) {
      isTied = true;
    }
  });

  return isTied ? DEFAULT_PLAN_TYPE : winner;
};
