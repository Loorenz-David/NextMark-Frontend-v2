import { resolvePlanType } from "@/features/plan/domain/planType";
import type { DeliveryPlan } from "@/features/plan/types/plan";

/**
 * Which objective an item label should print.
 *
 * While an order is assigned to a plan its objective belongs to the plan, and
 * moving it rewrites the objective. Label downloads are fired with the
 * destination plan id before the move's round-trip finishes, so the order in
 * hand still carries the objective it is leaving — the plan is the accurate
 * source, not the order.
 *
 * With no plan, the order's own objective is the right answer: an unassigned
 * order's objective is its planning hint, and it is also the only value left
 * when a plan could not be hydrated.
 */
export const resolveItemLabelPlanObjective = ({
  routePlan,
  orderPlanObjective,
}: {
  routePlan: DeliveryPlan | null | undefined;
  orderPlanObjective: string | null | undefined;
}): string | null =>
  routePlan ? resolvePlanType(routePlan) : (orderPlanObjective ?? null);
