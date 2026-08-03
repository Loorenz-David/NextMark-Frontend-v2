import { useCallback } from "react";
import { useMessageHandler } from "@shared-message-handler";
import type { DeliveryPlan } from "../../types/plan";
import { usePlanController } from "../../controllers/plan.controller";
import { useOptionalBaseControlls } from "@/shared/resource-manager/useResourceManager";
import { useOrderSelectionStore } from "@/features/order/store/orderSelection.store";
import {
  selectOrderByServerId,
  useOrderStore,
} from "@/features/order/store/order.store";
import { usePlanObjectiveMismatchController } from "../../controllers/usePlanObjectiveMismatchController";
import { resolvePlanType } from "../../domain/planType";

type Props = {
  planForm: DeliveryPlan;
  planValidateForm: () => boolean;
  selectedOrderServerIds?: number[];
  selectedZoneIds?: number[];
  source?: "order_multi_select" | null;
};

export const usePlanFormActions = ({
  planForm,
  planValidateForm,
  selectedOrderServerIds = [],
  selectedZoneIds = [],
  source,
}: Props) => {
  const { showMessage } = useMessageHandler();
  const { createPlan, deletePlan } = usePlanController();
  const { confirmObjectiveChange } = usePlanObjectiveMismatchController();
  const baseControlls = useOptionalBaseControlls();

  const handleCreatePlan = useCallback(async (): Promise<boolean> => {
    const isValidPlanForm = planValidateForm();

    if (!isValidPlanForm) {
      showMessage({
        message: "Invalid form, check for required fields.",
        status: "warning",
      });
      return false;
    }

    // Creating a plan from a multi-select carries those orders onto it, so the
    // same objective-change confirmation applies as when they are dragged.
    const planType = resolvePlanType(planForm);
    if (selectedOrderServerIds.length > 0) {
      const orderState = useOrderStore.getState();
      const confirmed = await confirmObjectiveChange({
        orders: selectedOrderServerIds.map((orderId) =>
          selectOrderByServerId(orderId)(orderState),
        ),
        targetPlanType: planType,
        targetPlanLabel: planForm.label ?? null,
      });
      if (!confirmed) return false;
    }

    const response = await createPlan(planForm, {
      newOrderLinks: selectedOrderServerIds,
      zoneIds: selectedZoneIds,
      planType,
    });

    if (response !== null) {
      if (source === "order_multi_select") {
        useOrderSelectionStore.getState().disableSelectionMode();
      }
      return true;
    }
    return false;
  }, [
    confirmObjectiveChange,
    createPlan,
    planForm,
    planValidateForm,
    selectedOrderServerIds,
    selectedZoneIds,
    showMessage,
    source,
  ]);

  const handleDeletePlan = useCallback(async (): Promise<boolean> => {
    const planId = planForm.id ?? planForm.client_id;
    if (!planId) {
      showMessage({ message: "Plan id is missing.", status: "warning" });
      return false;
    }

    const result = await deletePlan(planId);
    if (result) {
      baseControlls?.closeBase();
      return true;
    }
    return false;
  }, [baseControlls, deletePlan, planForm, showMessage]);

  return {
    handleCreatePlan,
    handleDeletePlan,
  };
};
