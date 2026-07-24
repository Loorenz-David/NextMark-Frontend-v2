import type { ClientFormData, ClientFormStep } from "./clientForm.types";
import type { ClientFormConfig } from "./clientFormConfig.types";
import { isStepValid } from "./clientForm.validation";

export const CLIENT_FORM_STEPS: ClientFormStep[] = [
  "client_info",
  "contact_info",
  "delivery_address",
];

export const getClientFormStepIndex = (step: ClientFormStep): number =>
  CLIENT_FORM_STEPS.indexOf(step);

export const getNextClientFormStep = (
  step: ClientFormStep,
): ClientFormStep | null => {
  const nextIndex = getClientFormStepIndex(step) + 1;
  return nextIndex < CLIENT_FORM_STEPS.length
    ? CLIENT_FORM_STEPS[nextIndex]
    : null;
};

/**
 * Stepping back is always allowed; stepping forward requires every step in
 * between to already hold valid answers, so the indicator can never jump the
 * customer past a step they have not filled in.
 */
export const canNavigateToClientFormStep = (
  targetStep: ClientFormStep,
  data: ClientFormData,
  config: ClientFormConfig,
): boolean => {
  const targetIndex = getClientFormStepIndex(targetStep);
  if (targetIndex <= 0) {
    return true;
  }

  return CLIENT_FORM_STEPS.slice(0, targetIndex).every((step) =>
    isStepValid(step, data, config),
  );
};
