import type { ExternalFormData } from "@/features/externalForm/domain/externalForm.types";
import {
  coerceClientFormStep,
  LIVE_PROGRESS_STEP_COUNT,
  LIVE_PROGRESS_STEP_LABELS,
  resolveLiveProgressOrderLabel,
  resolveLiveProgressStepNumber,
  resolveLiveProgressWidgetState,
  shouldAcceptLiveProgressFrame,
  shouldMergeLiveProgressIntoOrderForm,
  type LinkedDeviceLiveProgressEntry,
} from "../orderLinkedDeviceLiveProgress.domain";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const formData: ExternalFormData = {
  client_first_name: "Ada",
  client_last_name: "Lovelace",
  client_primary_phone: { prefix: "+46", number: "701234567" },
  client_secondary_phone: null,
  client_email: "ada@example.com",
  client_address: null,
  accepted_terms_version_id: null,
  marketing_messages: false,
};

const buildEntry = (
  overrides: Partial<LinkedDeviceLiveProgressEntry> = {},
): LinkedDeviceLiveProgressEntry => ({
  employeeUserId: 7,
  status: "filling",
  step: "client_info",
  formData,
  seq: 3,
  session: "session-a",
  orderId: 41,
  hiddenUntilSubmit: false,
  updatedAt: 1_000,
  expiresAt: 10_000,
  ...overrides,
});

export const runOrderLinkedDeviceLiveProgressDomainTests = () => {
  // --- shouldAcceptLiveProgressFrame ---
  assert(
    shouldAcceptLiveProgressFrame({
      current: null,
      incomingSeq: 1,
      incomingSession: "session-a",
    }),
    "the first frame should always be accepted",
  );
  assert(
    shouldAcceptLiveProgressFrame({
      current: buildEntry(),
      incomingSeq: 4,
      incomingSession: "session-a",
    }),
    "an in-order frame of the same session should be accepted",
  );
  assert(
    !shouldAcceptLiveProgressFrame({
      current: buildEntry(),
      incomingSeq: 3,
      incomingSession: "session-a",
    }),
    "a duplicate seq should be rejected",
  );
  assert(
    !shouldAcceptLiveProgressFrame({
      current: buildEntry(),
      incomingSeq: 2,
      incomingSession: "session-a",
    }),
    "an out-of-order frame should be rejected",
  );
  assert(
    shouldAcceptLiveProgressFrame({
      current: buildEntry(),
      incomingSeq: 1,
      incomingSession: "session-b",
    }),
    "a new session should replace the old one regardless of seq",
  );
  assert(
    !shouldAcceptLiveProgressFrame({
      current: buildEntry({ status: "submitted" }),
      incomingSeq: 99,
      incomingSession: "session-a",
    }),
    "a submitted entry should reject same-session stragglers",
  );
  assert(
    shouldAcceptLiveProgressFrame({
      current: buildEntry({ status: "submitted" }),
      incomingSeq: 1,
      incomingSession: "session-b",
    }),
    "a submitted entry should still accept a new session",
  );
  assert(
    shouldAcceptLiveProgressFrame({
      current: buildEntry({ status: "requested", session: "requested:1000", seq: 0 }),
      incomingSeq: 1,
      incomingSession: "session-a",
    }),
    "any frame should supersede a requested placeholder",
  );

  // --- shouldMergeLiveProgressIntoOrderForm ---
  assert(
    shouldMergeLiveProgressIntoOrderForm({
      entry: buildEntry(),
      formOrderServerId: 41,
      isAwaitingDraft: false,
    }),
    "a fill targeting the form's order should merge",
  );
  assert(
    !shouldMergeLiveProgressIntoOrderForm({
      entry: buildEntry(),
      formOrderServerId: 99,
      isAwaitingDraft: false,
    }),
    "a fill for a different order should not merge",
  );
  assert(
    !shouldMergeLiveProgressIntoOrderForm({
      entry: buildEntry(),
      formOrderServerId: null,
      isAwaitingDraft: true,
    }),
    "an order-bound fill should not merge into an awaiting draft",
  );
  assert(
    shouldMergeLiveProgressIntoOrderForm({
      entry: buildEntry({ orderId: null }),
      formOrderServerId: null,
      isAwaitingDraft: true,
    }),
    "a draft fill should merge into the draft that armed it",
  );
  assert(
    !shouldMergeLiveProgressIntoOrderForm({
      entry: buildEntry({ orderId: null }),
      formOrderServerId: null,
      isAwaitingDraft: false,
    }),
    "a draft fill should not merge into a form that did not arm it",
  );
  assert(
    !shouldMergeLiveProgressIntoOrderForm({
      entry: buildEntry({ status: "submitted" }),
      formOrderServerId: 41,
      isAwaitingDraft: false,
    }),
    "a submitted entry should not live-merge (the submit path owns it)",
  );

  // --- resolveLiveProgressWidgetState ---
  assert(
    resolveLiveProgressWidgetState({
      entry: null,
      now: 1_000,
      isMatchingOrderFormOpen: false,
    }) === "hidden",
    "no entry should hide the widget",
  );
  assert(
    resolveLiveProgressWidgetState({
      entry: buildEntry(),
      now: 10_000,
      isMatchingOrderFormOpen: false,
    }) === "hidden",
    "an expired entry should hide the widget",
  );
  assert(
    resolveLiveProgressWidgetState({
      entry: buildEntry({ orderId: null }),
      now: 1_000,
      isMatchingOrderFormOpen: false,
    }) === "hidden",
    "a draft fill should never show the widget",
  );
  assert(
    resolveLiveProgressWidgetState({
      entry: buildEntry(),
      now: 1_000,
      isMatchingOrderFormOpen: false,
    }) === "filling",
    "an active order-bound fill should show as filling",
  );
  assert(
    resolveLiveProgressWidgetState({
      entry: buildEntry(),
      now: 1_000,
      isMatchingOrderFormOpen: true,
    }) === "hidden",
    "the widget should hide while the matching order form is open",
  );
  assert(
    resolveLiveProgressWidgetState({
      entry: buildEntry({ hiddenUntilSubmit: true }),
      now: 1_000,
      isMatchingOrderFormOpen: false,
    }) === "hidden",
    "a manually hidden fill should stay hidden while filling",
  );
  assert(
    resolveLiveProgressWidgetState({
      entry: buildEntry({ status: "submitted", hiddenUntilSubmit: true }),
      now: 1_000,
      isMatchingOrderFormOpen: false,
    }) === "submitted",
    "a submit should surface the widget even when manually hidden",
  );
  assert(
    resolveLiveProgressWidgetState({
      entry: buildEntry({ status: "submitted" }),
      now: 1_000,
      isMatchingOrderFormOpen: true,
    }) === "submitted",
    "the submitted confirmation should show even with the form open",
  );

  assert(
    resolveLiveProgressWidgetState({
      entry: buildEntry({ status: "requested" }),
      now: 1_000,
      isMatchingOrderFormOpen: false,
    }) === "requested",
    "a sent request should show as requested before the first frame",
  );
  assert(
    resolveLiveProgressWidgetState({
      entry: buildEntry({ status: "requested", hiddenUntilSubmit: true }),
      now: 1_000,
      isMatchingOrderFormOpen: false,
    }) === "hidden",
    "a manually hidden request should stay hidden",
  );

  // --- order label ---
  assert(
    resolveLiveProgressOrderLabel({
      external_source: "shopify",
      reference_number: "SH-1042",
      order_scalar_id: 87,
    }) === "SH-1042",
    "an externally-sourced order should be known by its reference number",
  );
  assert(
    resolveLiveProgressOrderLabel({
      external_source: null,
      reference_number: "R-1",
      order_scalar_id: 87,
    }) === "#87",
    "a native order should be known by its scalar id",
  );
  assert(
    resolveLiveProgressOrderLabel(null) === "" &&
      resolveLiveProgressOrderLabel({ external_source: "shopify" }) === "",
    "a missing order or number should produce no label",
  );

  // --- step coercion + labels ---
  assert(
    coerceClientFormStep("contact_info") === "contact_info",
    "a known step should pass through",
  );
  assert(
    coerceClientFormStep("bogus_step") === "client_info",
    "an unknown wire step should degrade to the first step",
  );
  assert(
    LIVE_PROGRESS_STEP_LABELS.client_info === "Client identity" &&
      LIVE_PROGRESS_STEP_LABELS.contact_info === "Contact details" &&
      LIVE_PROGRESS_STEP_LABELS.delivery_address === "Delivery address",
    "every step should have its access-page label",
  );
  assert(
    resolveLiveProgressStepNumber("client_info") === 1 &&
      resolveLiveProgressStepNumber("contact_info") === 2 &&
      resolveLiveProgressStepNumber("delivery_address") === 3 &&
      LIVE_PROGRESS_STEP_COUNT === 3,
    "step numbers should follow the kit's ordering, 1-based",
  );
};
