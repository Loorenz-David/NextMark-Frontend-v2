import type { ClientFormData } from "@client-form-kit";

import { toExternalFormData } from "../externalForm.map";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runExternalFormMapTests = () => {
  const data: ClientFormData = {
    client_first_name: "Ada",
    client_last_name: "Lovelace",
    client_primary_phone: { prefix: "+46", number: "  701234567  " },
    client_secondary_phone: { prefix: "+46", number: "   " },
    client_email: "ada@example.com",
    client_address: null,
    order_notes: "leave at the door",
    accepted_terms_version_id: 3,
    marketing_messages: true,
  };

  const wire = toExternalFormData(data);

  assert(
    !("order_notes" in wire),
    "the delivery note must not travel — the order form has its own notes field",
  );
  assert(
    wire.client_primary_phone?.number === "701234567",
    "the primary phone should be trimmed",
  );
  assert(
    wire.client_secondary_phone === null,
    "a whitespace-only phone should narrow to null",
  );
  assert(
    wire.client_first_name === "Ada" &&
      wire.client_last_name === "Lovelace" &&
      wire.client_email === "ada@example.com",
    "identity fields should pass through unchanged",
  );
  assert(
    wire.accepted_terms_version_id === 3 && wire.marketing_messages === true,
    "terms acceptance and the marketing opt-in should travel",
  );
  assert(wire.client_address === null, "a missing address should stay null");
};
