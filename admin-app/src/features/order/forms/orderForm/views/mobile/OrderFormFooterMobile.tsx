import { useState } from "react";

import { BasicButton } from "@/shared/buttons/BasicButton";
import { ActionSheet } from "@/shared/overlays/bottomSheet";

import type { OrderFormSendStatus } from "../../controllers/useOrderFormSend.controller";

type OrderFormFooterMobileProps = {
  onSendToLinkedDevice: () => void;
  onSendToCustomer: () => void;
  onRequestClearSendStatus?: () => void;
  onSaveOrder: () => void;
  sendDisabled?: boolean;
  saveDisabled?: boolean;
  sendStatus?: OrderFormSendStatus | null;
  sendInProgress?: boolean;
};

const STATUS_TONE_CLASS: Record<OrderFormSendStatus["state"], string> = {
  error: "border-danger-border bg-danger-bg text-danger",
  warning: "border-warning-border bg-warning-bg text-warning",
  success: "border-success-border bg-success-bg text-success",
  loading: "border-info-border bg-info-bg text-info",
};

/** Bottom action bar: send options in a sheet, save as the primary action. */
export const OrderFormFooterMobile = ({
  onSendToLinkedDevice,
  onSendToCustomer,
  onRequestClearSendStatus,
  onSaveOrder,
  sendDisabled = false,
  saveDisabled = false,
  sendStatus = null,
  sendInProgress = false,
}: OrderFormFooterMobileProps) => {
  const [isSendSheetOpen, setIsSendSheetOpen] = useState(false);

  const openSendSheet = () => {
    if (sendStatus && sendStatus.state !== "loading") {
      onRequestClearSendStatus?.();
    }
    setIsSendSheetOpen(true);
  };

  return (
    <footer className="safe-bottom shrink-0 border-t border-[var(--color-border)] bg-[var(--surface-popup-chrome)] px-4 pt-3 pb-3">
      {sendStatus ? (
        <div
          role="status"
          className={`mb-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${STATUS_TONE_CLASS[sendStatus.state]}`}
        >
          {sendStatus.state === "loading" ? (
            <span className="h-3 w-3 shrink-0 animate-spin rounded-full border border-current border-t-transparent" />
          ) : null}
          <span className="min-w-0 flex-1">{sendStatus.message}</span>
        </div>
      ) : null}

      <div className="flex items-stretch gap-3">
        <BasicButton
          params={{
            variant: "secondary",
            onClick: openSendSheet,
            disabled: sendDisabled || sendInProgress,
            className: "h-12 flex-1 rounded-2xl text-[15px]",
            ariaLabel: "Send form",
          }}
        >
          Send form
        </BasicButton>
        <BasicButton
          params={{
            variant: "primary",
            onClick: onSaveOrder,
            disabled: saveDisabled,
            className: "h-12 flex-[1.4] rounded-2xl text-[15px]",
            ariaLabel: "Save order",
          }}
        >
          Save order
        </BasicButton>
      </div>

      <ActionSheet
        open={isSendSheetOpen}
        onClose={() => setIsSendSheetOpen(false)}
        title="Send form"
        options={[
          {
            label: "Send to linked device",
            action: onSendToLinkedDevice,
            disabled: sendInProgress,
          },
          {
            label: "Send to customer",
            action: onSendToCustomer,
            disabled: sendInProgress,
          },
        ]}
      />
    </footer>
  );
};
