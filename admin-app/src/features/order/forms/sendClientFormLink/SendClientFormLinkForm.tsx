import { useState } from "react";

import { BasicButton } from "@/shared/buttons/BasicButton";
import { Field } from "@/shared/inputs/FieldContainer";
import {
  InputField,
  PLAIN_INPUT_CLASS,
  PLAIN_INPUT_CONTAINER_CLASS,
} from "@/shared/inputs/InputField";
import { PhoneField } from "@/shared/inputs/PhoneField";
import {
  formatIsoDateFriendly,
  formatIsoTime,
} from "@/shared/utils/formatIsoDate";

import { useSendClientFormLinkFormController } from "./controllers/useSendClientFormLinkForm.controller";
import type { SendClientFormLinkPopupPayload } from "./state/sendClientFormLink.types";
import { fieldContainer } from "@/constants/classes";

export const SendClientFormLinkForm = ({
  payload,
  onSuccessClose,
}: {
  payload: SendClientFormLinkPopupPayload;
  onSuccessClose: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const controller = useSendClientFormLinkFormController({
    payload,
    onSuccess: onSuccessClose,
  });

  const handleCopy = async () => {
    if (!payload.formUrl) return;

    try {
      await navigator.clipboard.writeText(payload.formUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const expiryLabel = payload.expiresAt
    ? [
        formatIsoDateFriendly(payload.expiresAt),
        formatIsoTime(payload.expiresAt),
      ]
        .filter(Boolean)
        .join(" at ")
    : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 scroll-thin">
        {!payload.hasGeneratedLink ? (
          <div className="rounded-[18px] border border-amber-300/20 bg-amber-400/[0.1] px-4 py-3 text-sm leading-6 text-amber-100">
            A client form link must be generated before it can be sent.
          </div>
        ) : null}

        <Field label="Email:">
          <InputField
            value={controller.formState.email}
            onChange={(event) =>
              controller.handleEmailChange(event.target.value)
            }
            placeholder="customer@email.com"
          />
        </Field>

        <Field label="Phone:">
          <PhoneField
            containerClassName={fieldContainer}
            phoneNumber={controller.formState.phone}
            onChange={controller.handlePhoneChange}
          />
        </Field>

        {payload.formUrl ? (
          <div className="rounded-[18px] border border-white/10 bg-white/[0.035] px-4 py-4 mt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Generated Link
              </p>
              {expiryLabel ? (
                <span className="text-[0.72rem] text-[var(--color-muted)]">
                  Expires {expiryLabel}
                </span>
              ) : null}
            </div>

            <div className="mt-3 rounded-[14px] border border-white/10 bg-white/[0.04] px-3 py-3">
              <p className="truncate text-xs text-[var(--color-text)]">
                {payload.formUrl}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[var(--color-muted)] transition-colors hover:bg-white/[0.08] hover:text-[var(--color-text)]"
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <a
                href={payload.formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[var(--color-primary)] transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                Open in page
              </a>
            </div>
          </div>
        ) : null}

        {controller.disabledReason ? (
          <p className="text-xs text-[var(--color-muted)]">
            {controller.disabledReason}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] px-4 py-3">
        <BasicButton
          params={{
            variant: "primary",
            onClick: controller.handleSubmit,
            disabled: !controller.canSubmit,
            className: "px-4 py-2.5",
            style: { backgroundColor: "var(--color-turques)" },
          }}
        >
          {controller.isSubmitting ? "Sending…" : "Send Link"}
        </BasicButton>
      </div>
    </div>
  );
};
