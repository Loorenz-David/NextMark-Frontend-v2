import type { SelectOption } from "@/shared/inputs/SelectInputWithPopover";

export const EMAIL_CTA_LINK_TOKEN_START = "{{";
export const EMAIL_CTA_LINK_TOKEN_END = "}}";

const EMAIL_CTA_LINK_LABELS = [
  { id: "tracking_link", displayName: "Tracking page" },
  { id: "client_form_link", displayName: "Client form link" },
] as const;

export const toEmailCtaLinkToken = (labelId: string) =>
  `${EMAIL_CTA_LINK_TOKEN_START}${labelId}${EMAIL_CTA_LINK_TOKEN_END}`;

export const fromEmailCtaLinkToken = (value: string): string | null => {
  if (
    !value.startsWith(EMAIL_CTA_LINK_TOKEN_START) ||
    !value.endsWith(EMAIL_CTA_LINK_TOKEN_END)
  ) {
    return null;
  }

  return value.slice(
    EMAIL_CTA_LINK_TOKEN_START.length,
    value.length - EMAIL_CTA_LINK_TOKEN_END.length,
  );
};

export const EMAIL_CTA_LINK_OPTIONS: SelectOption<string>[] =
  EMAIL_CTA_LINK_LABELS.map(({ id, displayName }) => ({
    label: displayName,
    value: toEmailCtaLinkToken(id),
  }));
