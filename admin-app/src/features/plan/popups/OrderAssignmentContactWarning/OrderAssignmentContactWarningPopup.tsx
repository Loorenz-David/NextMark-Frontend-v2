import { useCallback, useEffect, useRef, useState } from "react";

import { ExclamationIcon } from "@/assets/icons";
import {
  useClientFormRecipientFieldsController,
  type LinkedDeviceOrderFormAvailability,
} from "@/features/order";
import type { OrderAssignmentContactWarningDecision } from "@/features/plan/domain/orderAssignmentContactWarning.domain";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { fieldContainer } from "@/constants/classes";
import { Field } from "@/shared/inputs/FieldContainer";
import { InputField } from "@/shared/inputs/InputField";
import { PhoneField } from "@/shared/inputs/PhoneField";
import {
  FeaturePopupBody,
  FeaturePopupHeader,
  FeaturePopupShell,
} from "@/shared/popups/featurePopup";
import type { StackComponentProps } from "@/shared/stack-manager/types";

export type OrderAssignmentContactWarningPopupPayload = {
  orderLabel: string;
  initialEmail?: string | null;
  initialPhone?: {
    prefix: string;
    number: string;
  } | null;
  canSendForm: boolean;
  linkedDeviceAvailability: LinkedDeviceOrderFormAvailability;
  onDecision: (decision: OrderAssignmentContactWarningDecision) => void;
};

type WarningView = "options" | "customer";

export const OrderAssignmentContactWarningPopup = ({
  payload,
  onClose,
}: StackComponentProps<OrderAssignmentContactWarningPopupPayload>) => {
  const [view, setView] = useState<WarningView>("options");
  const settledRef = useRef(false);
  const recipientsController = useClientFormRecipientFieldsController({
    initialEmail: payload?.initialEmail,
    initialPhone: payload?.initialPhone,
  });

  const settle = useCallback(
    (decision: OrderAssignmentContactWarningDecision) => {
      if (settledRef.current || !payload) return;
      settledRef.current = true;
      payload.onDecision(decision);
    },
    [payload],
  );

  const closeWithDecision = useCallback(
    (decision: OrderAssignmentContactWarningDecision) => {
      settle(decision);
      onClose?.();
    },
    [onClose, settle],
  );

  useEffect(
    () => () => {
      settle({ kind: "cancel" });
    },
    [settle],
  );

  if (!payload) {
    throw new Error("OrderAssignmentContactWarningPopup payload is missing.");
  }

  const handleCustomerSubmit = () => {
    if (!payload.canSendForm || !recipientsController.canSubmit) {
      return;
    }
    closeWithDecision({
      kind: "send_customer",
      recipients: recipientsController.recipients,
    });
  };

  const linkedDeviceDisabled =
    !payload.canSendForm || !payload.linkedDeviceAvailability.available;
  const sendDisabledMessage = !payload.canSendForm
    ? "The order must be synced before a client form can be sent."
    : payload.linkedDeviceAvailability.message;

  return (
    <FeaturePopupShell
      onRequestClose={() => closeWithDecision({ kind: "cancel" })}
      size="mdNoHeight"
      variant="center"
    >
      <FeaturePopupHeader
        title="Missing primary contact information"
        subtitle={payload.orderLabel}
        onClose={() => closeWithDecision({ kind: "cancel" })}
      />

      <FeaturePopupBody className="flex flex-col bg-[var(--color-ligth-bg)]">
        {view === "options" ? (
          <>
            <div className="flex flex-col gap-4 px-4 py-5 md:px-5">
              <div className="flex gap-3 rounded-2xl border border-warning-border bg-warning-bg px-4 py-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning/15">
                  <ExclamationIcon className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    This order has no primary email address or phone number.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                    Choose how to collect the customer&apos;s contact details,
                    or move the order without sending a form.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  disabled={!payload.canSendForm}
                  onClick={() => setView("customer")}
                  className="rounded-2xl border border-border bg-[var(--color-page)] px-4 py-4 text-left transition hover:border-border-accent hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="block text-sm font-semibold text-[var(--color-text)]">
                    Send form to customer
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--color-muted)]">
                    Enter an email address or phone number.
                  </span>
                </button>

                <button
                  type="button"
                  disabled={linkedDeviceDisabled}
                  onClick={() =>
                    closeWithDecision({ kind: "send_linked_device" })
                  }
                  className="rounded-2xl border border-border bg-[var(--color-page)] px-4 py-4 text-left transition hover:border-border-accent hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="block text-sm font-semibold text-[var(--color-text)]">
                    Move &amp; send to linked device
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--color-muted)]">
                    Track the customer&apos;s progress live.
                  </span>
                </button>
              </div>

              {linkedDeviceDisabled && sendDisabledMessage ? (
                <p className="text-xs text-warning">{sendDisabledMessage}</p>
              ) : null}
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-border bg-[var(--color-page)] px-4 py-3 md:px-5">
              <BasicButton
                params={{
                  variant: "secondary",
                  onClick: () => closeWithDecision({ kind: "cancel" }),
                }}
              >
                Cancel
              </BasicButton>
              <BasicButton
                params={{
                  variant: "primary",
                  onClick: () => closeWithDecision({ kind: "move_anyway" }),
                }}
              >
                Move anyway
              </BasicButton>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-3 px-4 py-5 md:px-5">
              <p className="text-sm leading-6 text-[var(--color-muted)]">
                Add at least one recipient. The order will move first; after
                the move succeeds, the client form will be sent.
              </p>

              <Field label="Email">
                <InputField
                  type="email"
                  value={recipientsController.email}
                  onChange={(event) =>
                    recipientsController.setEmail(event.target.value)
                  }
                  placeholder="customer@example.com"
                />
              </Field>

              <Field label="Phone">
                <PhoneField
                  containerClassName={fieldContainer}
                  phoneNumber={recipientsController.phone}
                  onChange={recipientsController.setPhone}
                />
              </Field>

              {recipientsController.disabledReason ? (
                <p className="text-xs text-warning">
                  {recipientsController.disabledReason}
                </p>
              ) : null}
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-border bg-[var(--color-page)] px-4 py-3 md:px-5">
              <BasicButton
                params={{
                  variant: "secondary",
                  onClick: () => setView("options"),
                }}
              >
                Back
              </BasicButton>
              <BasicButton
                params={{
                  variant: "primary",
                  onClick: handleCustomerSubmit,
                  disabled:
                    !payload.canSendForm || !recipientsController.canSubmit,
                }}
              >
                Move &amp; send form
              </BasicButton>
            </div>
          </>
        )}
      </FeaturePopupBody>
    </FeaturePopupShell>
  );
};
