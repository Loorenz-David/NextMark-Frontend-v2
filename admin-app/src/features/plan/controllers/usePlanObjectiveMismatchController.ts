import { useCallback } from "react";

import type { Order } from "@/features/order";
import {
  resolveObjectiveMismatch,
  type ObjectiveMismatch,
} from "@/features/plan/domain/planObjectiveMismatch.domain";
import { isPlanType } from "@/features/plan/domain/planType";
import type {
  PlanObjectiveMismatchDecision,
  PlanObjectiveMismatchOrderSummary,
} from "@/features/plan/popups/PlanObjectiveMismatch/PlanObjectiveMismatchPopup";
import type { RoutePlanObjective } from "@/features/plan/types/plan";
import { usePopupManager } from "@/shared/resource-manager/useResourceManager";

const POPUP_KEY = "plan.order-objective-mismatch";

const describeOrder = (order: Order): PlanObjectiveMismatchOrderSummary => {
  const reference = order.reference_number?.trim();
  const scalar =
    typeof order.order_scalar_id === "number"
      ? `#${order.order_scalar_id}`
      : null;

  return {
    label: reference || scalar || "Untitled order",
    // Only mismatching orders reach here, so the objective is always a real type.
    objective: isPlanType(order.order_plan_objective)
      ? order.order_plan_objective
      : ("local_delivery" as RoutePlanObjective),
  };
};

export const usePlanObjectiveMismatchController = () => {
  const popupManager = usePopupManager();

  const resolveMismatch = useCallback(
    (
      orders: Array<Order | null | undefined>,
      targetPlanType: RoutePlanObjective,
    ): ObjectiveMismatch | null =>
      resolveObjectiveMismatch({ orders, targetPlanType }),
    [],
  );

  const requestDecision = useCallback(
    ({
      mismatch,
      targetPlanLabel,
    }: {
      mismatch: ObjectiveMismatch;
      targetPlanLabel: string | null;
    }): Promise<PlanObjectiveMismatchDecision> =>
      new Promise((resolve) => {
        popupManager.open({
          key: POPUP_KEY,
          payload: {
            targetPlanType: mismatch.targetPlanType,
            targetPlanLabel,
            orders: mismatch.orders.map(describeOrder),
            onDecision: resolve,
          },
        });
      }),
    [popupManager],
  );

  /**
   * Returns true when the move should proceed: either nothing disagreed, or the
   * user confirmed. Dismissing the popup any way at all resolves to cancel.
   */
  const confirmObjectiveChange = useCallback(
    async ({
      orders,
      targetPlanType,
      targetPlanLabel = null,
    }: {
      orders: Array<Order | null | undefined>;
      targetPlanType: RoutePlanObjective;
      targetPlanLabel?: string | null;
    }): Promise<boolean> => {
      const mismatch = resolveMismatch(orders, targetPlanType);
      if (!mismatch) return true;

      const decision = await requestDecision({ mismatch, targetPlanLabel });
      return decision.kind === "move_anyway";
    },
    [requestDecision, resolveMismatch],
  );

  return {
    resolveMismatch,
    requestDecision,
    confirmObjectiveChange,
  };
};
