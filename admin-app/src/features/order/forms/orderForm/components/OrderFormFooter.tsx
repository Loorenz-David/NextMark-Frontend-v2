import { useState } from "react";

import { BasicButton } from "@/shared/buttons/BasicButton";
import { ConfirmActionButton } from "@/shared/buttons/DeleteButton";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";

import type { OrderFormSendStatus } from "../controllers/useOrderFormSend.controller";

type OrderFormFooterProps = {
  onSendToLinkedDevice: () => void;
  onSendToCustomer: () => void;
  onRequestClearSendStatus?: () => void;
  onSaveOrder: () => void;
  onDeleteOrder?: () => void;
  sendDisabled?: boolean;
  saveDisabled?: boolean;
  isMobile?: boolean;
  sendStatus?: OrderFormSendStatus | null;
  sendInProgress?: boolean;
};

export const OrderFormFooter = ({
  onSendToLinkedDevice,
  onSendToCustomer,
  onRequestClearSendStatus,
  onSaveOrder,
  onDeleteOrder,
  sendDisabled = false,
  saveDisabled = false,
  isMobile = false,
  sendStatus = null,
  sendInProgress = false,
}: OrderFormFooterProps) => {
  const [isSendOptionsOpen, setIsSendOptionsOpen] = useState(false);

  const statusToneClass =
    sendStatus?.state === "error"
      ? "border-rose-300/25 bg-rose-300/[0.12] text-rose-100"
      : sendStatus?.state === "success"
        ? "border-emerald-300/25 bg-emerald-300/[0.12] text-emerald-100"
        : "border-sky-300/25 bg-sky-300/[0.12] text-sky-100";

  return (
    <footer
      className={`flex w-full items-center  bottom-0 left-0  border-t border-[var(--color-border)] bg-[var(--color-page)] px-6 py-4 z-20 ${
        isMobile ? "fixed rounded-none" : "absolute rounded-b-xl"
      }`}
    >
      {onDeleteOrder && (
        <ConfirmActionButton
          onConfirm={onDeleteOrder}
          deleteContent={"Delete"}
          confirmContent={"Confirm Deletion"}
          deleteClassName={
            "text-sm rounded-md bg-[var(--color-page)] text-red-500 border-[text-red-500] px-2 py-2"
          }
          confirmClassName={
            "text-sm rounded-md bg-red-500 py-2 px-2 text-white"
          }
        />
      )}
      <div className="flex flex-1 items-center justify-end gap-3">
        {sendStatus ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.64rem] font-medium uppercase tracking-[0.12em] ${statusToneClass}`}
          >
            {sendStatus.state === "loading" ? (
              <span className="h-2.5 w-2.5 animate-spin rounded-full border border-current border-t-transparent" />
            ) : null}
            {sendStatus.message}
          </span>
        ) : null}
        <div>
          <FloatingPopover
            open={isSendOptionsOpen}
            onOpenChange={(nextOpen) => {
              if (nextOpen && sendStatus && sendStatus.state !== "loading") {
                onRequestClearSendStatus?.();
              }
              setIsSendOptionsOpen(nextOpen);
            }}
            classes="relative "
            offSetNum={8}
            closeOnInsideClick
            reference={
              <BasicButton
                params={{
                  variant: "secondary",
                  onClick: () => setIsSendOptionsOpen((current) => !current),
                  disabled: sendDisabled || sendInProgress,
                  className: "px-5 py-2 ",
                }}
              >
                Send Form
              </BasicButton>
            }
          >
            <div className="admin-glass-popover w-[240px] rounded-2xl border border-[var(--color-border-accent)] p-2 shadow-xl">
              <button
                type="button"
                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-[var(--color-text)] transition-colors hover:bg-white/[0.08]"
                disabled={sendInProgress}
                onClick={() => {
                  setIsSendOptionsOpen(false);
                  onSendToLinkedDevice();
                }}
              >
                Send to linked device
              </button>
              <button
                type="button"
                className="mt-1 flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-[var(--color-text)] transition-colors hover:bg-white/[0.08]"
                disabled={sendInProgress}
                onClick={() => {
                  setIsSendOptionsOpen(false);
                  onSendToCustomer();
                }}
              >
                Send to customer
              </button>
            </div>
          </FloatingPopover>
        </div>

        <BasicButton
          params={{
            variant: "primary",
            onClick: onSaveOrder,
            disabled: saveDisabled,
            className: "px-5 py-2",
          }}
        >
          Save Order
        </BasicButton>
      </div>
    </footer>
  );
};
