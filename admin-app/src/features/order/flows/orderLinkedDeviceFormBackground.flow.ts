import { useCallback } from "react";

import { useMessageHandler } from "@shared-message-handler";
import type {
  ExternalFormProgressPayload,
  ExternalFormReceivedPayload,
} from "@/realtime/externalForm/externalForm.realtime";
import { useExternalFormRealtime } from "@/realtime/externalForm/useExternalFormRealtime";

import { updateOrderClientFromLinkedDevice } from "../actions/updateOrderClientFromLinkedDevice.action";
import { mapLinkedDeviceFormToOrderUpdate } from "../domain/orderLinkedDeviceForm.domain";
import { coerceClientFormStep } from "../domain/orderLinkedDeviceLiveProgress.domain";
import {
  consumePendingLinkedDeviceForm,
  getPendingLinkedDeviceForm,
} from "../store/orderLinkedDeviceForm.store";
import {
  applyLinkedDeviceLiveProgress,
  markLinkedDeviceLiveSubmitted,
} from "../store/orderLinkedDeviceLiveProgress.store";
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

  const handleProgress = useCallback(
    (payload: ExternalFormProgressPayload) => {
      // Non-consuming lookup — the submit that follows must still find the
      // pending request. Draft fills (no pending) are stored with a null
      // orderId: the open draft form previews them, the widget never does.
      const pending = getPendingLinkedDeviceForm(employeeUserId);

      applyLinkedDeviceLiveProgress({
        employeeUserId,
        formData: payload.progress_data.form_data,
        step: coerceClientFormStep(payload.progress_data.step),
        seq: payload.progress_data.seq,
        session: payload.progress_data.session,
        orderId: pending?.orderId ?? null,
      });
    },
    [employeeUserId],
  );

  const handleReceived = useCallback(
    async (payload: ExternalFormReceivedPayload) => {
      // Before the pending guard: draft submits must also flip the live entry
      // so straggler progress frames from the finished session are rejected.
      markLinkedDeviceLiveSubmitted(employeeUserId);

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
    onProgress: handleProgress,
  });
};
