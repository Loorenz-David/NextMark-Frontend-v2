import type { Phone } from "@/types/phone";

export type ClientFormRecipients = {
  email: string | null;
  phone: Phone | null;
};

export type ClientFormRecipientValidation = {
  recipients: ClientFormRecipients;
  hasReachableTarget: boolean;
  isEmailValid: boolean;
  isPhoneValid: boolean;
  canSubmit: boolean;
  disabledReason: string | null;
};

type ClientFormRecipientValidators = {
  validateEmail: (value: string | null | undefined) => boolean;
  validatePhone: (value: Phone | null | undefined) => boolean;
};

export const resolveClientFormRecipients = ({
  email,
  phone,
  defaultPhonePrefix,
  validators,
}: {
  email: string | null | undefined;
  phone: Phone | null | undefined;
  defaultPhonePrefix: string;
  validators: ClientFormRecipientValidators;
}): ClientFormRecipientValidation => {
  const normalizedEmail = email?.trim() || null;
  const normalizedPhoneNumber = phone?.number?.trim() || "";
  const normalizedPhone = normalizedPhoneNumber
    ? {
        prefix: phone?.prefix?.trim() || defaultPhonePrefix,
        number: normalizedPhoneNumber,
      }
    : null;

  const isEmailValid =
    normalizedEmail == null || validators.validateEmail(normalizedEmail);
  const isPhoneValid =
    normalizedPhone == null || validators.validatePhone(normalizedPhone);
  const hasReachableTarget =
    normalizedEmail != null || normalizedPhone != null;

  let disabledReason: string | null = null;
  if (!hasReachableTarget) {
    disabledReason = "Add an email or phone number to send the form.";
  } else if (!isEmailValid || !isPhoneValid) {
    disabledReason = "Fix the contact fields before sending.";
  }

  return {
    recipients: {
      email: normalizedEmail,
      phone: normalizedPhone,
    },
    hasReachableTarget,
    isEmailValid,
    isPhoneValid,
    canSubmit: hasReachableTarget && isEmailValid && isPhoneValid,
    disabledReason,
  };
};
