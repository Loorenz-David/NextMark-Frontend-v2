import type { Order, OrderUpdateFields } from "../types/order";

export type LinkedDeviceClientFormData = Pick<
  Order,
  | "client_first_name"
  | "client_last_name"
  | "client_primary_phone"
  | "client_secondary_phone"
  | "client_email"
  | "client_address"
>;

export const mapLinkedDeviceFormToOrderUpdate = (
  formData: LinkedDeviceClientFormData,
): OrderUpdateFields => ({
  client_first_name: formData.client_first_name,
  client_last_name: formData.client_last_name,
  client_primary_phone: formData.client_primary_phone,
  client_secondary_phone: formData.client_secondary_phone,
  client_email: formData.client_email,
  client_address: formData.client_address,
});

export type LinkedDeviceSendDecision =
  | { status: "send"; closeAfterSend: boolean }
  | { status: "blocked" };

export const resolveLinkedDeviceSendDecision = ({
  pendingOrderId,
  targetOrderId,
}: {
  pendingOrderId: number | null;
  targetOrderId: number | null;
}): LinkedDeviceSendDecision => {
  if (pendingOrderId != null && pendingOrderId !== targetOrderId) {
    return { status: "blocked" };
  }

  return {
    status: "send",
    closeAfterSend: targetOrderId != null,
  };
};
