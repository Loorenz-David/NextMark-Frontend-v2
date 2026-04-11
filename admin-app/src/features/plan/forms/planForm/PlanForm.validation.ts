import type { RefObject } from "react";

import { hasFormChanges } from "@shared-domain";
import { isDateOnOrAfterToday } from "@/shared/data-validation/timeValidation";

import type { DeliveryPlan } from "../../types/plan";
import type { PlanWarningsControllers, PlanTypeState } from "./PlanForm.types";

type Props = {
  planFormWarnings: PlanWarningsControllers;
  planForm: DeliveryPlan;
  initialPlanFormRef: RefObject<DeliveryPlan | null>;
};

export const usePlanFormValidation = ({
  planFormWarnings,
  planForm,
  initialPlanFormRef,
}: Props) => {
  const planValidateForm = () => {
    const v = planFormWarnings;
    const isRange = planForm.date_strategy === "range";

    const valid = [
      v.planNameWarning.validate(planForm.label),
      v.planStartDateWarning.validate({
        start_date: planForm.start_date,
        end_date: isRange ? planForm.end_date : null,
      }),
      isDateOnOrAfterToday(planForm.start_date),
      ...(isRange ? [isDateOnOrAfterToday(planForm.end_date)] : []),
    ];

    return valid.every((v) => v === true);
  };

  const setCloseGuards = () => {
    const val = !hasFormChanges(planForm, initialPlanFormRef);

    return val;
  };

  return {
    planValidateForm,
    hasChanges: setCloseGuards,
  };
};
