import {
  clearPendingLinkedDeviceForm,
  getPendingLinkedDeviceForm,
  registerPendingLinkedDeviceForm,
} from "../../store/orderLinkedDeviceForm.store";
import {
  clearLinkedDeviceLiveProgress,
  getLinkedDeviceLiveProgress,
} from "../../store/orderLinkedDeviceLiveProgress.store";
import { requestOrderClientFormOnLinkedDevice } from "../requestOrderClientFormOnLinkedDevice.flow";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const EMPLOYEE_USER_ID = 77;

const reset = () => {
  clearPendingLinkedDeviceForm(EMPLOYEE_USER_ID);
  clearLinkedDeviceLiveProgress(EMPLOYEE_USER_ID);
};

export const runRequestOrderClientFormOnLinkedDeviceFlowTests = () => {
  reset();
  let emittedOrderId: unknown = null;
  const sent = requestOrderClientFormOnLinkedDevice(
    {
      employeeUserId: EMPLOYEE_USER_ID,
      orderId: 42,
      referenceNumber: "REF-42",
    },
    {
      emitRequest: (payload) => {
        emittedOrderId = (
          payload?.request_data as { order_id?: unknown } | undefined
        )?.order_id;
      },
    },
  );

  assert(sent.status === "sent", "available linked devices should be notified");
  assert(
    getPendingLinkedDeviceForm(EMPLOYEE_USER_ID)?.orderId === 42,
    "successful requests should register the pending order",
  );
  assert(
    getLinkedDeviceLiveProgress(EMPLOYEE_USER_ID)?.status === "requested",
    "successful requests should activate live progress immediately",
  );
  assert(
    emittedOrderId === 42,
    "the linked-device frame should target the moved order",
  );

  reset();
  registerPendingLinkedDeviceForm({
    employeeUserId: EMPLOYEE_USER_ID,
    orderId: 84,
  });
  let blockedEmitCount = 0;
  const blocked = requestOrderClientFormOnLinkedDevice(
    {
      employeeUserId: EMPLOYEE_USER_ID,
      orderId: 42,
      referenceNumber: "REF-42",
    },
    {
      emitRequest: () => {
        blockedEmitCount += 1;
      },
    },
  );

  assert(
    blocked.status === "blocked",
    "a different pending order should block the request",
  );
  assert(blockedEmitCount === 0, "blocked requests must not emit");
  reset();
};
