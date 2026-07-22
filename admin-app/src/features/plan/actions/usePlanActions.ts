import {
  useBaseControlls,
  usePopupManager,
  useSectionManager,
} from "@/shared/resource-manager/useResourceManager";
import type { PayloadBase } from "@/features/home-route-operations/types/types";
import type { DeliveryPlan } from "../types/plan";

export type CreatePlanOptions = {
  selectedOrderServerIds?: number[];
  source?: "order_multi_select";
};

export const useOpenCreatePlanFormAction = () => {
  const popupManager = usePopupManager();

  return (options?: CreatePlanOptions) => {
    popupManager.open({
      key: "PlanForm",
      payload: { mode: "create", ...options },
    });
  };
};

export const usePlanHeaderAction = () => {
  const onCreatePlan = useOpenCreatePlanFormAction();
  const baseControlls = useBaseControlls<PayloadBase>();
  const sectionManager = useSectionManager();

  const openPlanSection = (plan: DeliveryPlan) => {
    if (!plan.id) return;

    if (sectionManager.getOpenCount() > 0) {
      sectionManager.closeAll();
    }
    baseControlls.openBase({
      payload: {
        planId: plan.id,
      },
    });
  };

  return {
    onCreatePlan,
    openPlanSection,
  };
};
