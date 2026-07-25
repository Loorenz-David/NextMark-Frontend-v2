import { create } from "zustand";

import type { ClientFormStep } from "@client-form-kit";

import type { ExternalFormData } from "@/features/externalForm/domain/externalForm.types";
import {
  shouldAcceptLiveProgressFrame,
  type LinkedDeviceLiveProgressEntry,
} from "../domain/orderLinkedDeviceLiveProgress.domain";

// Aligned with the pending-request TTL: a live entry must never outlive the
// pending request that gives it an order to belong to.
const LIVE_PROGRESS_TTL_MS = 30 * 60 * 1000;

type OrderLinkedDeviceLiveProgressState = {
  entryByEmployeeUserId: Record<number, LinkedDeviceLiveProgressEntry>;
  setEntry: (entry: LinkedDeviceLiveProgressEntry) => void;
  clearEntry: (employeeUserId: number) => void;
};

export const useOrderLinkedDeviceLiveProgressStore =
  create<OrderLinkedDeviceLiveProgressState>((set) => ({
    entryByEmployeeUserId: {},
    setEntry: (entry) =>
      set((state) => ({
        entryByEmployeeUserId: {
          ...state.entryByEmployeeUserId,
          [entry.employeeUserId]: entry,
        },
      })),
    clearEntry: (employeeUserId) =>
      set((state) => {
        const nextEntries = { ...state.entryByEmployeeUserId };
        delete nextEntries[employeeUserId];
        return { entryByEmployeeUserId: nextEntries };
      }),
  }));

/**
 * Marks a fill as requested the moment the form is sent to the device, so the
 * widget shows from the send rather than from the customer's first keystroke.
 * The placeholder session is never a device session id, so the first real
 * frame always supersedes this entry.
 */
export const registerLinkedDeviceLiveRequested = ({
  employeeUserId,
  orderId,
  now = Date.now(),
}: {
  employeeUserId: number;
  orderId: number;
  now?: number;
}) => {
  useOrderLinkedDeviceLiveProgressStore.getState().setEntry({
    employeeUserId,
    status: "requested",
    step: "client_info",
    formData: {
      client_first_name: "",
      client_last_name: "",
      client_primary_phone: null,
      client_secondary_phone: null,
      client_email: "",
      client_address: null,
      accepted_terms_version_id: null,
      marketing_messages: false,
    },
    seq: 0,
    session: `requested:${now}`,
    orderId,
    hiddenUntilSubmit: false,
    updatedAt: now,
    expiresAt: now + LIVE_PROGRESS_TTL_MS,
  });
};

/**
 * Applies one progress frame, gated by session/seq ordering. `hiddenUntilSubmit`
 * survives within a session — the X means "stop showing me this fill" — but a
 * new session is a new customer and starts visible again. `orderId` always
 * comes from the caller's fresh pending lookup so a stale entry cannot pin a
 * new session to the previous order.
 */
export const applyLinkedDeviceLiveProgress = ({
  employeeUserId,
  formData,
  step,
  seq,
  session,
  orderId,
  now = Date.now(),
}: {
  employeeUserId: number;
  formData: ExternalFormData;
  step: ClientFormStep;
  seq: number;
  session: string;
  orderId: number | null;
  now?: number;
}) => {
  const current = getLinkedDeviceLiveProgress(employeeUserId, now);

  if (
    !shouldAcceptLiveProgressFrame({
      current,
      incomingSeq: seq,
      incomingSession: session,
    })
  ) {
    return;
  }

  const sameSession = current?.session === session;
  // The X during the waiting phase means "stop showing me this request's
  // fill", so it carries into the device session that supersedes the
  // placeholder. Only a genuinely new fill starts visible again.
  const carriesHide =
    sameSession || current?.status === "requested"
      ? (current?.hiddenUntilSubmit ?? false)
      : false;

  useOrderLinkedDeviceLiveProgressStore.getState().setEntry({
    employeeUserId,
    status: "filling",
    step,
    formData,
    seq,
    session,
    orderId,
    hiddenUntilSubmit: carriesHide,
    updatedAt: now,
    expiresAt: now + LIVE_PROGRESS_TTL_MS,
  });
};

export const markLinkedDeviceLiveSubmitted = (
  employeeUserId: number,
  now = Date.now(),
) => {
  const current = getLinkedDeviceLiveProgress(employeeUserId, now);
  if (!current) {
    return;
  }

  useOrderLinkedDeviceLiveProgressStore.getState().setEntry({
    ...current,
    status: "submitted",
    updatedAt: now,
    expiresAt: now + LIVE_PROGRESS_TTL_MS,
  });
};

export const hideLinkedDeviceLiveUntilSubmit = (
  employeeUserId: number,
  now = Date.now(),
) => {
  const current = getLinkedDeviceLiveProgress(employeeUserId, now);
  if (!current) {
    return;
  }

  useOrderLinkedDeviceLiveProgressStore.getState().setEntry({
    ...current,
    hiddenUntilSubmit: true,
  });
};

export const clearLinkedDeviceLiveProgress = (employeeUserId: number) => {
  useOrderLinkedDeviceLiveProgressStore.getState().clearEntry(employeeUserId);
};

export const getLinkedDeviceLiveProgress = (
  employeeUserId: number,
  now = Date.now(),
): LinkedDeviceLiveProgressEntry | null => {
  const entry =
    useOrderLinkedDeviceLiveProgressStore.getState().entryByEmployeeUserId[
      employeeUserId
    ] ?? null;

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= now) {
    clearLinkedDeviceLiveProgress(employeeUserId);
    return null;
  }

  return entry;
};
