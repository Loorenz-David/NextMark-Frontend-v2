import type { useOrderValidation } from "./useOrderValidation";
import type { Order } from "../types/order";

type OrderValidationContract = ReturnType<typeof useOrderValidation>;

export const getOrderMissingRequiredFieldLabels = (
  order: Order,
  validators: Pick<
    OrderValidationContract,
    | "validateReferenceNumber"
    | "validateCustomerName"
    | "validateCustomerEmail"
    | "validatePhone"
    | "validateAddressValue"
  >,
): string[] => {
  const missingFields: string[] = [];

  if (!validators.validateReferenceNumber(order.reference_number ?? "")) {
    missingFields.push("Reference number");
  }

  if (!validators.validateCustomerName(order.client_first_name ?? "")) {
    missingFields.push("Client first name");
  }

  if (!validators.validateCustomerName(order.client_last_name ?? "")) {
    missingFields.push("Client last name");
  }

  if (!validators.validateCustomerEmail(order.client_email ?? null)) {
    missingFields.push("Client email");
  }

  if (
    !validators.validatePhone(order.client_primary_phone ?? null, {
      required: true,
    })
  ) {
    missingFields.push("Client primary phone");
  }

  if (!validators.validateAddressValue(order.client_address ?? null)) {
    missingFields.push("Client address");
  }

  return missingFields;
};
