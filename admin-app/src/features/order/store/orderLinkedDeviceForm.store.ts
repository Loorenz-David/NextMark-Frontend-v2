import { create } from "zustand";

const LINKED_DEVICE_REQUEST_TTL_MS = 30 * 60 * 1000;

export type PendingLinkedDeviceFormRequest = {
  employeeUserId: number;
  orderId: number;
  requestedAt: number;
  expiresAt: number;
};

type OrderLinkedDeviceFormState = {
  pendingByEmployeeUserId: Record<number, PendingLinkedDeviceFormRequest>;
  registerPending: (request: PendingLinkedDeviceFormRequest) => void;
  clearPending: (employeeUserId: number) => void;
};

export const useOrderLinkedDeviceFormStore =
  create<OrderLinkedDeviceFormState>((set) => ({
    pendingByEmployeeUserId: {},
    registerPending: (request) =>
      set((state) => ({
        pendingByEmployeeUserId: {
          ...state.pendingByEmployeeUserId,
          [request.employeeUserId]: request,
        },
      })),
    clearPending: (employeeUserId) =>
      set((state) => {
        const nextPending = { ...state.pendingByEmployeeUserId };
        delete nextPending[employeeUserId];
        return { pendingByEmployeeUserId: nextPending };
      }),
  }));

export const registerPendingLinkedDeviceForm = ({
  employeeUserId,
  orderId,
  now = Date.now(),
}: {
  employeeUserId: number;
  orderId: number;
  now?: number;
}) => {
  useOrderLinkedDeviceFormStore.getState().registerPending({
    employeeUserId,
    orderId,
    requestedAt: now,
    expiresAt: now + LINKED_DEVICE_REQUEST_TTL_MS,
  });
};

export const clearPendingLinkedDeviceForm = (employeeUserId: number) => {
  useOrderLinkedDeviceFormStore.getState().clearPending(employeeUserId);
};

export const getPendingLinkedDeviceForm = (
  employeeUserId: number,
  now = Date.now(),
): PendingLinkedDeviceFormRequest | null => {
  const request =
    useOrderLinkedDeviceFormStore.getState().pendingByEmployeeUserId[
      employeeUserId
    ] ?? null;

  if (!request) {
    return null;
  }

  if (request.expiresAt <= now) {
    clearPendingLinkedDeviceForm(employeeUserId);
    return null;
  }

  return request;
};

export const consumePendingLinkedDeviceForm = (
  employeeUserId: number,
  now = Date.now(),
): PendingLinkedDeviceFormRequest | null => {
  const request = getPendingLinkedDeviceForm(employeeUserId, now);
  if (request) {
    clearPendingLinkedDeviceForm(employeeUserId);
  }
  return request;
};
