import { emitExternalFormRequest } from "@/realtime/externalForm/externalForm.realtime";

import { resolveLinkedDeviceSendDecision } from "../domain/orderLinkedDeviceForm.domain";
import { resolveOrderRoutePlanSchedule } from "./resolveOrderRoutePlanSchedule.flow";
import {
  clearPendingLinkedDeviceForm,
  getPendingLinkedDeviceForm,
  registerPendingLinkedDeviceForm,
} from "../store/orderLinkedDeviceForm.store";
import {
  clearLinkedDeviceLiveProgress,
  registerLinkedDeviceLiveRequested,
} from "../store/orderLinkedDeviceLiveProgress.store";

export type LinkedDeviceOrderFormAvailability =
  | { available: true; message: null }
  | { available: false; message: string };

export type LinkedDeviceOrderFormRequestResult =
  | { status: "sent" }
  | { status: "blocked" | "error"; message: string };

type LinkedDeviceOrderFormRequestDependencies = {
  emitRequest: typeof emitExternalFormRequest;
};

const defaultRequestDependencies: LinkedDeviceOrderFormRequestDependencies = {
  emitRequest: emitExternalFormRequest,
};

export const getLinkedDeviceOrderFormAvailability = ({
  employeeUserId,
  orderId,
}: {
  employeeUserId: number;
  orderId: number;
}): LinkedDeviceOrderFormAvailability => {
  if (employeeUserId <= 0) {
    return {
      available: false,
      message: "Linked device unavailable.",
    };
  }

  const pending = getPendingLinkedDeviceForm(employeeUserId);
  const decision = resolveLinkedDeviceSendDecision({
    pendingOrderId: pending?.orderId ?? null,
    targetOrderId: orderId,
  });

  if (decision.status === "blocked") {
    return {
      available: false,
      message: "Another order is awaiting this linked device.",
    };
  }

  return { available: true, message: null };
};

export const requestOrderClientFormOnLinkedDevice = ({
  employeeUserId,
  orderId,
  referenceNumber,
}: {
  employeeUserId: number;
  orderId: number;
  referenceNumber: string;
}, dependencies: LinkedDeviceOrderFormRequestDependencies =
  defaultRequestDependencies): LinkedDeviceOrderFormRequestResult => {
  const availability = getLinkedDeviceOrderFormAvailability({
    employeeUserId,
    orderId,
  });
  if (!availability.available) {
    return {
      status: employeeUserId <= 0 ? "error" : "blocked",
      message: availability.message,
    };
  }

  clearLinkedDeviceLiveProgress(employeeUserId);
  registerPendingLinkedDeviceForm({
    employeeUserId,
    orderId,
  });
  registerLinkedDeviceLiveRequested({
    employeeUserId,
    orderId,
  });

  try {
    dependencies.emitRequest({
      request_data: {
        reference_number: referenceNumber,
        order_id: orderId,
        route_plan_schedule: resolveOrderRoutePlanSchedule(orderId),
      },
    });
  } catch {
    clearPendingLinkedDeviceForm(employeeUserId);
    clearLinkedDeviceLiveProgress(employeeUserId);
    return {
      status: "error",
      message: "Unable to contact linked device.",
    };
  }

  return { status: "sent" };
};
