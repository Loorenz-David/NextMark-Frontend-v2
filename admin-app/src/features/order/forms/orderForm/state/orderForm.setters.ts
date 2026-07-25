import type { ChangeEvent, Dispatch, SetStateAction } from "react";

import type { ExternalFormData } from "@/features/externalForm/domain/externalForm.types";
import type { address } from "@/types/address";
import type { Phone } from "@/types/phone";
import type { OrderDeliveryWindow } from "../../../types/order";
import type { OrderOperationTypes } from "../../../types/order";
import { sortDeliveryWindowsUtc } from "../flows/orderFormDeliveryWindows.flow";

import type { OrderFormState, OrderFormWarnings } from "./OrderForm.types";

/**
 * Overlays customer data collected on the linked device onto the form state.
 * Pure so the bootstrap path can apply it during (re)initialization — a merge
 * done only from effects loses to the provider's own reset, which runs after
 * child effects on mount and again whenever the order refreshes.
 */
export const mergeExternalClientDataIntoFormState = (
  prev: OrderFormState,
  data: ExternalFormData,
): OrderFormState => ({
  ...prev,
  client_first_name: data.client_first_name || prev.client_first_name,
  client_last_name: data.client_last_name || prev.client_last_name,
  client_email: data.client_email || prev.client_email,
  client_primary_phone: data.client_primary_phone ?? prev.client_primary_phone,
  client_secondary_phone:
    data.client_secondary_phone ?? prev.client_secondary_phone,
  client_address: data.client_address ?? prev.client_address,
  // The acceptance happened at the counter, against a version the customer
  // actually saw. Never widened by a later edit — only the device sets it.
  accepted_terms_version_id:
    data.accepted_terms_version_id ?? prev.accepted_terms_version_id,
  marketing_messages: data.marketing_messages,
});

const normalizeOperationType = (
  value: string | number,
): OrderOperationTypes => {
  if (value === "pickup") return "pickup";
  if (value === "pickup_dropoff" || value === "pickup-dropoff")
    return "pickup_dropoff";
  return "dropoff";
};

export const useOrderFormSetters = ({
  setFormState,
  warnings,
  setUpdateCostumer,
}: {
  setFormState: Dispatch<SetStateAction<OrderFormState>>;
  warnings: OrderFormWarnings;
  setUpdateCostumer: Dispatch<SetStateAction<boolean>>;
}) => {
  // Editing any customer-identity field opts the order into pushing those
  // values back to the linked customer. Staff can still switch it back off.
  const markCostumerFieldTouched = () => setUpdateCostumer(true);

  const updateFormState = (
    updater: (prev: OrderFormState) => OrderFormState,
  ) => {
    setFormState((prev) => updater(prev));
  };

  const handleOrderPlanObjective = (value: string | null) => {
    updateFormState((prev) => ({ ...prev, order_plan_objective: value }));
  };

  const handleOperationType = (value: string | number) => {
    const normalized = normalizeOperationType(value);
    updateFormState((prev) => ({ ...prev, operation_type: normalized }));
  };

  const handleReference = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    updateFormState((prev) => ({ ...prev, reference_number: value }));
    warnings.referenceWarning.validate(value);
  };

  const handleExternalSource = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    updateFormState((prev) => ({ ...prev, external_source: value }));
  };

  const handleExternalTrackingNumber = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    updateFormState((prev) => ({ ...prev, external_tracking_number: value }));
  };

  const handleExternalTrackingLink = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    updateFormState((prev) => ({ ...prev, external_tracking_link: value }));
  };

  const handleTrackingNumber = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    updateFormState((prev) => ({ ...prev, tracking_number: value }));
  };

  const handleTrackingLink = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    updateFormState((prev) => ({ ...prev, tracking_link: value }));
  };

  const handleFirstName = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    updateFormState((prev) => ({ ...prev, client_first_name: value }));
    warnings.firstNameWarning.validate(value);
    markCostumerFieldTouched();
  };

  const handleLastName = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    updateFormState((prev) => ({ ...prev, client_last_name: value }));
    warnings.lastNameWarning.validate(value);
    markCostumerFieldTouched();
  };

  const handleEmail = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    updateFormState((prev) => ({ ...prev, client_email: value }));
    warnings.emailWarning.validate(value);
    markCostumerFieldTouched();
  };

  const handlePrimaryPhone = (value: Phone) => {
    updateFormState((prev) => ({ ...prev, client_primary_phone: value }));
    warnings.primaryPhoneWarning.validate(value);
    markCostumerFieldTouched();
  };

  const handleSecondaryPhone = (value: Phone) => {
    updateFormState((prev) => ({ ...prev, client_secondary_phone: value }));
    markCostumerFieldTouched();
  };

  const handleAddress = (value: address | null) => {
    updateFormState((prev) => ({ ...prev, client_address: value }));
    warnings.addressWarning.validate(value);
    markCostumerFieldTouched();
  };

  const handleUpdateCostumer = (value: boolean) => {
    setUpdateCostumer(value);
  };

  const mergeExternalClientData = (data: ExternalFormData) => {
    updateFormState((prev) => mergeExternalClientDataIntoFormState(prev, data));
  };

  const handleDeliveryWindows = (windows: OrderDeliveryWindow[]) => {
    const sorted = sortDeliveryWindowsUtc(windows);
    updateFormState((prev) => ({ ...prev, delivery_windows: sorted }));
  };

  const handleGeneralNote = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    updateFormState((prev) => ({ ...prev, general_note: value }));
  };

  const handleCustomerNote = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    updateFormState((prev) => ({ ...prev, customer_note: value }));
  };

  const handleHelpToCarry = (value: boolean) => {
    updateFormState((prev) => ({ ...prev, help_to_carry: value }));
  };

  const handleMarketingMessages = (value: boolean) => {
    updateFormState((prev) => ({ ...prev, marketing_messages: value }));
  };

  return {
    handleOrderPlanObjective,
    handleOperationType,
    handleReference,
    handleExternalSource,
    handleExternalTrackingNumber,
    handleExternalTrackingLink,
    handleTrackingNumber,
    handleTrackingLink,
    handleFirstName,
    handleLastName,
    handleEmail,
    handlePrimaryPhone,
    handleSecondaryPhone,
    handleAddress,
    handleDeliveryWindows,
    handleGeneralNote,
    handleCustomerNote,
    handleHelpToCarry,
    handleMarketingMessages,
    handleUpdateCostumer,
    mergeExternalClientData,
  };
};
