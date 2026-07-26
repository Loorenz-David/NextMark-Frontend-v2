import { resolveClientFormRecipients } from "../clientFormRecipients.domain";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const validators = {
  validateEmail: (value: string | null | undefined) =>
    value == null || value.includes("@"),
  validatePhone: (
    value: { prefix: string; number: string } | null | undefined,
  ) => value == null || (value.prefix.startsWith("+") && value.number.length >= 3),
};

export const runClientFormRecipientsDomainTests = () => {
  const empty = resolveClientFormRecipients({
    email: " ",
    phone: { prefix: "+46", number: " " },
    defaultPhonePrefix: "+46",
    validators,
  });
  assert(!empty.canSubmit, "a recipient is required");
  assert(
    empty.disabledReason === "Add an email or phone number to send the form.",
    "empty recipients should explain what is required",
  );

  const emailOnly = resolveClientFormRecipients({
    email: " customer@example.com ",
    phone: null,
    defaultPhonePrefix: "+46",
    validators,
  });
  assert(emailOnly.canSubmit, "a valid email should be sufficient");
  assert(
    emailOnly.recipients.email === "customer@example.com",
    "email should be trimmed",
  );

  const phoneOnly = resolveClientFormRecipients({
    email: null,
    phone: { prefix: "", number: " 701234567 " },
    defaultPhonePrefix: "+46",
    validators,
  });
  assert(phoneOnly.canSubmit, "a valid phone should be sufficient");
  assert(
    phoneOnly.recipients.phone?.prefix === "+46",
    "blank prefixes should use the configured default",
  );

  const invalid = resolveClientFormRecipients({
    email: "invalid",
    phone: null,
    defaultPhonePrefix: "+46",
    validators,
  });
  assert(!invalid.canSubmit, "invalid recipients should block submission");
  assert(
    invalid.disabledReason === "Fix the contact fields before sending.",
    "invalid recipients should expose the shared validation message",
  );
};
