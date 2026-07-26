import type {
  ClientFormRecipients,
  Order,
} from "@/features/order";

import type { PlanDndIntent } from "./planDndIntent";

export type OrderAssignmentContactWarningDecision =
  | { kind: "cancel" }
  | { kind: "move_anyway" }
  | {
      kind: "send_customer";
      recipients: ClientFormRecipients;
    }
  | { kind: "send_linked_device" };

const hasNonBlankValue = (value: string | null | undefined): boolean =>
  Boolean(value?.trim());

export const shouldWarnForMissingOrderAssignmentContact = ({
  intent,
  order,
}: {
  intent: PlanDndIntent;
  order: Order | null | undefined;
}): boolean => {
  if (intent?.kind !== "ASSIGN_ORDER_TO_PLAN" || !order) {
    return false;
  }

  if (order.delivery_plan_id != null) {
    return false;
  }

  const hasEmail = hasNonBlankValue(order.client_email);
  const hasPhone = hasNonBlankValue(order.client_primary_phone?.number);
  return !hasEmail && !hasPhone;
};
