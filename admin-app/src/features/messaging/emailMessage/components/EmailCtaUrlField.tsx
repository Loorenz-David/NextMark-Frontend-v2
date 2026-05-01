import { SelectInputWithPopover } from "@/shared/inputs/SelectInputWithPopover";

import {
  EMAIL_CTA_LINK_OPTIONS,
  fromEmailCtaLinkToken,
  toEmailCtaLinkToken,
} from "../config/emailCtaLinkConfig";

type EmailCtaUrlFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export const EmailCtaUrlField = ({
  value,
  onChange,
}: EmailCtaUrlFieldProps) => {
  const activeTokenId = fromEmailCtaLinkToken(value);
  const activeTokenValue = activeTokenId
    ? toEmailCtaLinkToken(activeTokenId)
    : null;
  const activeTokenOption =
    EMAIL_CTA_LINK_OPTIONS.find(
      (option) => option.value === activeTokenValue,
    ) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <SelectInputWithPopover<string>
        selectionMode="single"
        value={value}
        options={EMAIL_CTA_LINK_OPTIONS}
        onChange={(nextValue) =>
          onChange(
            typeof nextValue === "string" ? nextValue : String(nextValue),
          )
        }
        onSelectOption={(option) => onChange(option.value)}
        allowCustomInput={true}
        placeholder="https://... or select a backend link"
        noMatchMessage="No backend link labels matched."
        containerClassName="rounded-xl"
      />

      {activeTokenOption ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-xl border border-[#8fe3de]/42 bg-[#8fe3de]/18 px-2.5 py-1 text-xs font-semibold text-[#78d8d2]">
            {activeTokenOption.label}
          </span>
          <span className="text-xs text-[var(--color-muted)]">
            Resolved on action time
          </span>
        </div>
      ) : null}
    </div>
  );
};
