import type { ExternalFormData } from "@/features/externalForm/domain/externalForm.types";
import {
  applyLinkedDeviceLiveProgress,
  clearLinkedDeviceLiveProgress,
  getLinkedDeviceLiveProgress,
  hideLinkedDeviceLiveUntilSubmit,
  markLinkedDeviceLiveSubmitted,
  registerLinkedDeviceLiveRequested,
} from "../orderLinkedDeviceLiveProgress.store";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const formData: ExternalFormData = {
  client_first_name: "Ada",
  client_last_name: "",
  client_primary_phone: null,
  client_secondary_phone: null,
  client_email: "",
  client_address: null,
  accepted_terms_version_id: null,
  marketing_messages: false,
};

const EMPLOYEE = 7;

const frame = (
  overrides: Partial<Parameters<typeof applyLinkedDeviceLiveProgress>[0]> = {},
) => {
  applyLinkedDeviceLiveProgress({
    employeeUserId: EMPLOYEE,
    formData,
    step: "client_info",
    seq: 1,
    session: "session-a",
    orderId: 41,
    now: 1_000,
    ...overrides,
  });
};

export const runOrderLinkedDeviceLiveProgressStoreTests = () => {
  clearLinkedDeviceLiveProgress(EMPLOYEE);

  // A sent request shows immediately; the first real frame supersedes it.
  registerLinkedDeviceLiveRequested({
    employeeUserId: EMPLOYEE,
    orderId: 41,
    now: 1_000,
  });
  let requested = getLinkedDeviceLiveProgress(EMPLOYEE, 1_000);
  assert(
    requested?.status === "requested" && requested.orderId === 41,
    "sending the form should register a requested placeholder",
  );

  hideLinkedDeviceLiveUntilSubmit(EMPLOYEE, 1_000);
  frame({ seq: 1 });
  requested = getLinkedDeviceLiveProgress(EMPLOYEE, 1_000);
  assert(
    requested?.status === "filling" && requested.hiddenUntilSubmit === true,
    "the first frame should supersede the placeholder and keep the manual hide",
  );

  clearLinkedDeviceLiveProgress(EMPLOYEE);

  // Ordering: in-order accepted, stale rejected.
  frame({ seq: 1 });
  frame({ seq: 3, step: "contact_info" });
  frame({ seq: 2, step: "delivery_address" });
  let entry = getLinkedDeviceLiveProgress(EMPLOYEE, 1_000);
  assert(
    entry?.seq === 3 && entry.step === "contact_info",
    "an out-of-order frame must not overwrite a newer one",
  );

  // A new session replaces regardless of seq, and resets the manual hide.
  hideLinkedDeviceLiveUntilSubmit(EMPLOYEE, 1_000);
  entry = getLinkedDeviceLiveProgress(EMPLOYEE, 1_000);
  assert(entry?.hiddenUntilSubmit === true, "the X should mark the session hidden");

  frame({ seq: 5 });
  entry = getLinkedDeviceLiveProgress(EMPLOYEE, 1_000);
  assert(
    entry?.hiddenUntilSubmit === true,
    "the manual hide should survive same-session frames",
  );

  frame({ seq: 1, session: "session-b", orderId: 52 });
  entry = getLinkedDeviceLiveProgress(EMPLOYEE, 1_000);
  assert(
    entry?.session === "session-b" &&
      entry.seq === 1 &&
      entry.orderId === 52 &&
      entry.hiddenUntilSubmit === false,
    "a new session should replace the entry and start visible again",
  );

  // Submit flips status and blocks same-session stragglers.
  markLinkedDeviceLiveSubmitted(EMPLOYEE, 2_000);
  frame({ seq: 9, session: "session-b" });
  entry = getLinkedDeviceLiveProgress(EMPLOYEE, 2_000);
  assert(
    entry?.status === "submitted" && entry.seq === 1,
    "same-session frames after submit must be rejected",
  );

  // TTL: the getter self-clears an expired entry.
  const expired = getLinkedDeviceLiveProgress(EMPLOYEE, 2_000 + 30 * 60 * 1000);
  assert(expired === null, "an expired entry should read as absent");
  assert(
    getLinkedDeviceLiveProgress(EMPLOYEE, 0) === null,
    "an expired entry should have been cleared, not just filtered",
  );

  clearLinkedDeviceLiveProgress(EMPLOYEE);
};
