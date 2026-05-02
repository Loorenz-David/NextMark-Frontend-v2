import { useMemo, useRef, useState } from "react";

import { FailureNoteComposer } from "@shared-failure-notes";
import type { StackComponentProps } from "@/shared/stack-manager/types";
import { BasicButton } from "@/shared/buttons/BasicButton";
import {
  FeaturePopupBody,
  FeaturePopupClosePrompt,
  FeaturePopupHeader,
  FeaturePopupShell,
  useFeaturePopupCloseController,
} from "@/shared/popups/featurePopup";
import { useMessageHandler } from "@shared-message-handler";

import { useOrderStateController } from "../../controllers/orderState.controller";

export type FailureNotePopupPayload = {
  clientId: string;
  targetStateId: number;
};

export const FailureNotePopup = ({
  payload,
  onClose,
}: StackComponentProps<FailureNotePopupPayload>) => {
  const { setOrderState } = useOrderStateController();
  const { showMessage } = useMessageHandler();
  const closeController = useFeaturePopupCloseController({
    hasUnsavedChanges: false,
    onClose,
  });
  const [noteValue, setNoteValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const didSubmitRef = useRef(false);

  const canSubmit = useMemo(
    () => noteValue.trim().length > 0 && !isSubmitting,
    [isSubmitting, noteValue],
  );

  if (!payload) {
    throw new Error("FailureNotePopup payload is missing.");
  }

  const handleCancelClose = () => {
    if (!didSubmitRef.current) {
      showMessage({
        status: 200,
        message: "Fail state change canceled.",
      });
    }
    closeController.requestClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const failureNote = noteValue.trim();

      const success = await setOrderState(
        payload.clientId,
        payload.targetStateId,
        { order_notes: { type: "FAILURE", content: failureNote } },
      );

      if (success) {
        didSubmitRef.current = true;
        await closeController.confirmClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FeaturePopupShell
        onRequestClose={handleCancelClose}
        size="mdNoHeight"
        variant="center"
      >
        <FeaturePopupHeader
          title="Create Failure Note"
          onClose={handleCancelClose}
        />
        <FeaturePopupBody className="space-y-4   h-full flex flex-col bg-[var(--color-ligth-bg)]">
          <FailureNoteComposer value={noteValue} onValueChange={setNoteValue} />

          <div className="flex justify-end mt-auto gap-2 border-t px-4 pt-4 pb-4 border-white/10 bg-[var(--color-page)]">
            <BasicButton
              params={{
                variant: "primary",
                onClick: () => {
                  void handleSubmit();
                },
                ariaLabel: "Submit failure note",
                disabled: !canSubmit,
              }}
            >
              {isSubmitting ? "Saving..." : "Submit Failure"}
            </BasicButton>
          </div>
        </FeaturePopupBody>
      </FeaturePopupShell>

      <FeaturePopupClosePrompt controller={closeController} />
    </>
  );
};
