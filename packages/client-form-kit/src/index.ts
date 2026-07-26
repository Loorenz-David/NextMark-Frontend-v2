/**
 * @nextmark/client-form-kit — the customer-facing delivery-details form.
 *
 * One implementation for every surface that asks a customer for their details:
 * the public link sent by email or SMS, and the linked device handed over the
 * counter in the store. The kit owns the steps, the validation, the terms and
 * rules gates, and the stationery theme; the host owns the route, the screens
 * around the form, and how the answers travel — supplied as `ClientFormPorts`.
 *
 * Requires `@nextmark/client-form-kit/styles.css` and a `.client-form-theme`
 * element wrapping the form.
 */

export { ClientFormProvider } from "./context/ClientForm.provider";
export { ClientFormContext } from "./context/ClientForm.context";
export type { ClientFormContextValue } from "./context/ClientForm.context";
export { useClientForm } from "./context/useClientForm";

export { ClientFormSteps } from "./components/ClientFormSteps";
export { ClientFormFrame } from "./components/ClientFormFrame";
export { ClientFormMediaCarousel } from "./components/ClientFormMediaCarousel";
export { ClientFormMediaRail } from "./components/ClientFormMediaRail";
export {
  ClientFormMediaImage,
  ClientFormMediaLink,
} from "./components/ClientFormMediaImage";
export { ClientFormItemsList } from "./components/ClientFormItemsList";
export { ClientFormScheduledDate } from "./components/ClientFormScheduledDate";
export { ClientFormSheet } from "./components/ClientFormSheet";
export { TermsDocumentView } from "./components/TermsDocumentView";
export { StepButton } from "./components/StepButton";
export { StepIndicator } from "./components/StepIndicator";
export { StepLayout } from "./components/StepLayout";

export type {
  ClientFormPorts,
  ClientFormOptions,
  ClientFormSubmitResult,
} from "./ports/clientFormPorts";

export type {
  ClientFormData,
  ClientFormItem,
  ClientFormMeta,
  ClientFormRoutePlanSchedule,
  ClientFormStep,
  ClientOrderNote,
  ClientOrderNoteType,
  Phone,
  address,
} from "./domain/clientForm.types";
export { EMPTY_CLIENT_FORM_META } from "./domain/clientForm.types";

export type {
  ClientFormConfig,
  ClientFormMedia,
  ClientFormRule,
  ClientFormTerms,
  MediaPlacement,
} from "./domain/clientFormConfig.types";
export {
  EMPTY_CLIENT_FORM_CONFIG,
  MEDIA_PLACEMENTS,
} from "./domain/clientFormConfig.types";
export { mapClientFormConfig } from "./domain/clientFormConfig.map";
export {
  getClientFormMedia,
  hasClientFormMedia,
  resolveClientFormMediaHref,
} from "./domain/clientFormMedia";

export {
  CLIENT_FORM_STEPS,
  canNavigateToClientFormStep,
  getClientFormStepIndex,
  getNextClientFormStep,
} from "./domain/clientForm.flow";
export { isStepValid, validateStep } from "./domain/clientForm.validation";
export type { ClientFormFieldErrors } from "./domain/clientForm.validation";
export {
  getClientFormOrderTitle,
  getClientFormScheduledDelivery,
} from "./domain/clientFormOrderDisplay";

export { CheckMarkIcon } from "./icons/CheckMarkIcon";
export { BackArrowIcon } from "./icons/BackArrowIcon";
