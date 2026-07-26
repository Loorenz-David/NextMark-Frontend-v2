import { useCallback } from "react";

import type {
  LinkedDeviceOrderFormAvailability,
  Order,
} from "@/features/order";
import {
  shouldWarnForMissingOrderAssignmentContact,
  type OrderAssignmentContactWarningDecision,
} from "@/features/plan/domain/orderAssignmentContactWarning.domain";
import type { PlanDndIntent } from "@/features/plan/domain/planDndIntent";
import { usePopupManager } from "@/shared/resource-manager/useResourceManager";

const POPUP_KEY = "plan.order-assignment-contact-warning";

export const usePlanDndContactWarningController = () => {
  const popupManager = usePopupManager();

  const requiresConfirmation = useCallback(
    (intent: PlanDndIntent, order: Order | null | undefined) =>
      shouldWarnForMissingOrderAssignmentContact({ intent, order }),
    [],
  );

  const requestDecision = useCallback(
    ({
      order,
      linkedDeviceAvailability,
    }: {
      order: Order;
      linkedDeviceAvailability: LinkedDeviceOrderFormAvailability;
    }): Promise<OrderAssignmentContactWarningDecision> =>
      new Promise((resolve) => {
        const reference = order.reference_number?.trim();
        const scalar =
          typeof order.order_scalar_id === "number"
            ? `#${order.order_scalar_id}`
            : null;
        popupManager.open({
          key: POPUP_KEY,
          payload: {
            orderLabel: reference || scalar || "Unscheduled order",
            initialEmail: order.client_email,
            initialPhone: order.client_primary_phone,
            canSendForm: typeof order.id === "number",
            linkedDeviceAvailability,
            onDecision: resolve,
          },
        });
      }),
    [popupManager],
  );

  return {
    requiresConfirmation,
    requestDecision,
  };
};
