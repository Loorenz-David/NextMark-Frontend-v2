import { useCallback } from "react";

import { useMessageHandler } from "@shared-message-handler";
import type { ExternalFormReceivedPayload } from "@/realtime/externalForm/externalForm.realtime";
import { useExternalFormRealtime } from "@/realtime/externalForm/useExternalFormRealtime";

import { updateOrderClientFromLinkedDevice } from "../actions/updateOrderClientFromLinkedDevice.action";
import { mapLinkedDeviceFormToOrderUpdate } from "../domain/orderLinkedDeviceForm.domain";
import {
  consumePendingLinkedDeviceForm,
} from "../store/orderLinkedDeviceForm.store";
import {
  selectOrderByServerId,
  updateOrderByClientId,
  upsertOrder,
  useOrderStore,
} from "../store/order.store";

export const useOrderLinkedDeviceFormBackgroundFlow = (
  employeeUserId: number,
) => {
  const { showMessage } = useMessageHandler();

  const handleReceived = useCallback(
    async (payload: ExternalFormReceivedPayload) => {
      const pending = consumePendingLinkedDeviceForm(employeeUserId);
      if (!pending) {
        return;
      }

      const fields = mapLinkedDeviceFormToOrderUpdate(payload.form_data);

      try {
        const updatedOrders = await updateOrderClientFromLinkedDevice({
          orderId: pending.orderId,
          fields,
        });

        if (updatedOrders.length > 0) {
          updatedOrders.forEach(upsertOrder);
        } else {
          const currentOrder = selectOrderByServerId(pending.orderId)(
            useOrderStore.getState(),
          );
          if (currentOrder) {
            updateOrderByClientId(currentOrder.client_id, (order) => ({
              ...order,
              ...fields,
            }));
          }
        }

        showMessage({
          status: "success",
          message: "Customer form received and order updated.",
        });
      } catch (error) {
        console.error("Failed to apply linked-device customer form", error);
        showMessage({
          status: "error",
          message: "Customer form was received, but the order could not be updated.",
        });
      }
    },
    [employeeUserId, showMessage],
  );

  useExternalFormRealtime({
    onReceived: handleReceived,
  });
};
