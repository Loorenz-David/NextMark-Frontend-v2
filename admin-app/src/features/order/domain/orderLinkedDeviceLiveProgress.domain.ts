import {
  CLIENT_FORM_STEPS,
  getClientFormStepIndex,
  type ClientFormStep,
} from "@client-form-kit";

import type { ExternalFormData } from "@/features/externalForm/domain/externalForm.types";

export type LinkedDeviceLiveProgressStatus = "requested" | "filling" | "submitted";

export type LinkedDeviceLiveProgressEntry = {
  employeeUserId: number;
  status: LinkedDeviceLiveProgressStatus;
  step: ClientFormStep;
  formData: ExternalFormData;
  seq: number;
  session: string;
  /** From the pending registry at frame time; null = draft fill (no widget). */
  orderId: number | null;
  /** Set by the widget's X during filling; a submit still surfaces the widget. */
  hiddenUntilSubmit: boolean;
  updatedAt: number;
  expiresAt: number;
};

export type LinkedDeviceLiveWidgetState =
  | "hidden"
  | "requested"
  | "filling"
  | "submitted";

/**
 * Orders frames within one Device B fill session and lets a new session
 * replace the old one wholesale. Seq restarts per session on the device, so
 * cross-session seq comparison would silently drop an entire second fill.
 * Once submitted, same-session frames are stragglers and are rejected.
 */
export const shouldAcceptLiveProgressFrame = ({
  current,
  incomingSeq,
  incomingSession,
}: {
  current: LinkedDeviceLiveProgressEntry | null;
  incomingSeq: number;
  incomingSession: string;
}): boolean => {
  if (!current) {
    return true;
  }

  if (incomingSession !== current.session) {
    return true;
  }

  // A `requested` placeholder carries no real session, so any frame supersedes
  // it; after that, ordering is by seq while the fill is live.
  if (current.status === "requested") {
    return true;
  }

  return current.status === "filling" && incomingSeq > current.seq;
};

/**
 * An open order form previews a live fill only when the fill is its own:
 * either the fill targets the order the form is editing, or the form is a
 * draft that armed itself by sending the request (draft fills carry no
 * orderId — the pending registry only tracks saved orders).
 */
export const shouldMergeLiveProgressIntoOrderForm = ({
  entry,
  formOrderServerId,
  isAwaitingDraft,
}: {
  entry: LinkedDeviceLiveProgressEntry | null;
  formOrderServerId: number | null;
  isAwaitingDraft: boolean;
}): boolean => {
  if (!entry || entry.status !== "filling") {
    return false;
  }

  if (entry.orderId != null) {
    return formOrderServerId != null && entry.orderId === formOrderServerId;
  }

  return isAwaitingDraft;
};

/**
 * Draft fills never show the widget: the draft form stays open by design, and
 * once closed there is no saved order for the widget to reopen. A fill hidden
 * by the X stays hidden while filling but a submit still surfaces the
 * confirmation. While the matching order form is open, the form itself is the
 * preview.
 */
export const resolveLiveProgressWidgetState = ({
  entry,
  now,
  isMatchingOrderFormOpen,
}: {
  entry: LinkedDeviceLiveProgressEntry | null;
  now: number;
  isMatchingOrderFormOpen: boolean;
}): LinkedDeviceLiveWidgetState => {
  if (!entry || entry.expiresAt <= now || entry.orderId == null) {
    return "hidden";
  }

  if (entry.status === "submitted") {
    return "submitted";
  }

  if (entry.hiddenUntilSubmit || isMatchingOrderFormOpen) {
    return "hidden";
  }

  return entry.status;
};

/**
 * The number shown beside the widget header, following the card convention:
 * an externally-sourced order (e.g. Shopify) is known by its reference number,
 * a native one by its scalar id.
 */
export const resolveLiveProgressOrderLabel = (
  order:
    | {
        external_source?: string | null;
        reference_number?: string | null;
        order_scalar_id?: number | null;
      }
    | null
    | undefined,
): string => {
  if (!order) {
    return "";
  }

  if (order.external_source && order.reference_number) {
    return order.reference_number;
  }

  return order.order_scalar_id != null ? `#${order.order_scalar_id}` : "";
};

export const LIVE_PROGRESS_STEP_LABELS: Record<ClientFormStep, string> = {
  client_info: "Client identity",
  contact_info: "Contact details",
  delivery_address: "Delivery address",
};

export const LIVE_PROGRESS_STEP_COUNT = CLIENT_FORM_STEPS.length;

/** 1-based position of the step, from the kit's own ordering. */
export const resolveLiveProgressStepNumber = (step: ClientFormStep): number =>
  getClientFormStepIndex(step) + 1;

/**
 * The relay forwards `step` opaquely, so the wire value is untrusted. An
 * unknown step degrades to the first one rather than crashing the widget.
 */
export const coerceClientFormStep = (step: string): ClientFormStep => {
  return (
    CLIENT_FORM_STEPS.find((known) => known === step) ?? CLIENT_FORM_STEPS[0]
  );
};
