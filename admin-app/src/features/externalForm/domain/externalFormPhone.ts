import type { Phone } from "@/types/phone";

export const hasExternalFormPhoneNumber = (
  phone: Phone | null | undefined,
): boolean => {
  return Boolean(phone?.number?.trim());
};

export const sanitizeExternalFormPhone = (
  phone: Phone | null | undefined,
): Phone | null => {
  if (!phone) {
    return null;
  }

  const number = phone.number.trim();
  if (!number) {
    return null;
  }

  return {
    ...phone,
    number,
  };
};
