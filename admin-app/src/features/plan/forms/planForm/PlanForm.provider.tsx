import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { hasFormChanges, makeInitialFormCopy } from "@shared-domain";
import { PlanFormContextProvider } from "./PlanForm.context";
import { usePlanFormSetters } from "./planForm.setters";
import { usePlanFormWarnings } from "./PlanForm.warnings";
import { usePlanFormActions } from "./planForm.actions";
import { usePlanFormValidation } from "./PlanForm.validation";
import type { DeliveryPlan } from "../../types/plan";
import { usePlanFormContextData } from "./PlanFormContextData";
import { usePlanFormBootstrapFlow } from "./planFormBootstrap.flow";
import type { PopupPayload } from "./PlanForm.types";

type PlanFormProvider = {
  children: ReactNode;
  payload?: PopupPayload;
  onSuccessClose?: () => void | Promise<void>;
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void;
};
export const PlanFormProvider = ({
  children,
  payload,
  onSuccessClose,
  onUnsavedChangesChange,
}: PlanFormProvider) => {
  const { initialPlanForm } = usePlanFormBootstrapFlow();

  const [planForm, setPlanForm] = useState<DeliveryPlan>(initialPlanForm);
  const [selectedZoneIds, setSelectedZoneIds] = useState<number[]>([]);
  const initialPlanFormRef = useRef<DeliveryPlan | null>(null);

  const planFormWarnings = usePlanFormWarnings();
  const planSetters = usePlanFormSetters({
    setPlanForm,
    setSelectedZoneIds,
    planFormWarnings,
  });

  const { planValidateForm } = usePlanFormValidation({
    planFormWarnings,
    planForm,
    initialPlanFormRef,
  });

  const { hasPlan, mode, source, planData, selectedOrderServerIds } =
    usePlanFormContextData(payload);

  const rawPlanActions = usePlanFormActions({
    planForm,
    planValidateForm,
    source,
    selectedOrderServerIds,
    selectedZoneIds,
  });

  const planActions = {
    ...rawPlanActions,
    handleCreatePlan: async (): Promise<boolean> => {
      const succeeded = await rawPlanActions.handleCreatePlan();
      if (succeeded) {
        await onSuccessClose?.();
      }
      return succeeded;
    },
    handleDeletePlan: async (): Promise<boolean> => {
      const succeeded = await rawPlanActions.handleDeletePlan();
      if (succeeded) {
        await onSuccessClose?.();
      }
      return succeeded;
    },
  };

  useEffect(() => {
    if (!hasPlan) {
      makeInitialFormCopy(initialPlanFormRef, initialPlanForm);
      return;
    }

    if (!planData) {
      return;
    }

    setPlanForm(planData);
    makeInitialFormCopy(initialPlanFormRef, planData);
  }, [hasPlan, initialPlanForm, planData]);

  const hasUnsavedChanges =
    hasFormChanges(planForm, initialPlanFormRef) || selectedZoneIds.length > 0;

  useEffect(() => {
    onUnsavedChangesChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onUnsavedChangesChange]);

  const value = {
    planForm,
    selectedZoneIds,
    mode,
    planFormWarnings,
    planSetters,
    planActions,
    hasUnsavedChanges,
  };

  return (
    <PlanFormContextProvider value={value}>{children}</PlanFormContextProvider>
  );
};
