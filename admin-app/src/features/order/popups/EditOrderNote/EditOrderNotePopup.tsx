import { useMemo, useState } from "react";

import type { StackComponentProps } from "@/shared/stack-manager/types";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { InputField } from "@/shared/inputs/InputField";
import {
  FeaturePopupBody,
  FeaturePopupClosePrompt,
  FeaturePopupFooter,
  FeaturePopupHeader,
  FeaturePopupShell,
  useFeaturePopupCloseController,
} from "@/shared/popups/featurePopup";

import { useOrderNotesController } from "../../controllers/orderNotes.controller";
import type { NormalizedNoteType } from "../../domain/orderNotes";

export type EditOrderNotePopupPayload = {
  clientId: string;
  noteIndex: number;
  noteType: NormalizedNoteType;
  noteContent: string;
  noteCreationDate: string | null;
};

export const EditOrderNotePopup = ({
  payload,
  onClose,
}: StackComponentProps<EditOrderNotePopupPayload>) => {
  const closeController = useFeaturePopupCloseController({
    hasUnsavedChanges: false,
    onClose,
  });
  const { updateOrderNote } = useOrderNotesController();
  const [value, setValue] = useState(payload?.noteContent ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => value.trim().length > 0 && value.trim() !== (payload?.noteContent ?? "").trim() && !isSubmitting,
    [isSubmitting, payload?.noteContent, value],
  );

  if (!payload) {
    throw new Error("EditOrderNotePopup payload is missing.");
  }

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const success = await updateOrderNote({
        clientId: payload.clientId,
        content: value,
        note: {
          id: `popup-${payload.noteIndex}`,
          index: payload.noteIndex,
          type: payload.noteType,
          content: payload.noteContent,
          creation_date: payload.noteCreationDate,
        },
      });

      if (success) {
        await closeController.confirmClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FeaturePopupShell onRequestClose={closeController.requestClose} size="sm" variant="center">
        <FeaturePopupHeader title="Edit Note" onClose={closeController.requestClose} />
        <FeaturePopupBody className="relative flex min-h-[220px] flex-col gap-4 bg-[var(--color-ligth-bg)] px-4 py-4">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Update note content
          </div>
          <InputField
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Enter note"
            fieldClassName="w-full"
            inputClassName="form-plain-input min-h-[48px] w-full"
          />
          <FeaturePopupFooter>
            <div />
            <div className="flex items-center gap-2">
              <BasicButton
                params={{
                  variant: "toolbarSecondary",
                  onClick: closeController.requestClose,
                  ariaLabel: "Cancel note edit",
                }}
              >
                Cancel
              </BasicButton>
              <BasicButton
                params={{
                  variant: "primary",
                  onClick: () => {
                    void handleSubmit();
                  },
                  ariaLabel: "Save note",
                  disabled: !canSubmit,
                }}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </BasicButton>
            </div>
          </FeaturePopupFooter>
        </FeaturePopupBody>
      </FeaturePopupShell>
      <FeaturePopupClosePrompt controller={closeController} />
    </>
  );
};
