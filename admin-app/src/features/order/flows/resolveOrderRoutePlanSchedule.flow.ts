import type { ClientFormRoutePlanSchedule } from "@client-form-kit";

import {
  selectRoutePlanByServerId,
  useRoutePlanStore,
} from "@/features/plan/store/routePlan.slice";

import { selectOrderByServerId, useOrderStore } from "../store/order.store";

/**
 * The route-plan schedule date of a persisted order, read from the client
 * stores when a linked-device form is requested so the counter device can show
 * it in the form header.
 *
 * Returns `null` when the order is unknown to the store, is not assigned to a
 * plan, or the plan carries no scheduled date — the header omits the line in
 * every one of those cases. Read imperatively (via `getState`) because the
 * caller is a one-shot send, not a subscription.
 */
export const resolveOrderRoutePlanSchedule = (
  orderServerId: number | null | undefined,
): ClientFormRoutePlanSchedule | null => {
  if (!orderServerId) {
    return null;
  }

  const order = selectOrderByServerId(orderServerId)(useOrderStore.getState());
  const planId = order?.delivery_plan_id ?? null;
  if (!planId) {
    return null;
  }

  const plan = selectRoutePlanByServerId(planId)(useRoutePlanStore.getState());
  if (!plan || (!plan.start_date && !plan.end_date)) {
    return null;
  }

  return {
    date_strategy: plan.date_strategy ?? null,
    start_date: plan.start_date ?? null,
    end_date: plan.end_date ?? null,
  };
};
