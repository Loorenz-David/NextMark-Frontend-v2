import { useState } from "react";

import type { StackComponentProps } from "@/shared/stack-manager/types";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { CustomDatePicker } from "@/shared/inputs/CustomDatePicker";
import { Field } from "@/shared/inputs/FieldContainer";
import {
  FeaturePopupBody,
  FeaturePopupClosePrompt,
  FeaturePopupHeader,
  FeaturePopupShell,
  useFeaturePopupCloseController,
} from "@/shared/popups/featurePopup";

export type OrderScheduleFilterPopupPayload = {
  from: string | null;
  to: string | null;
  onApply: (payload: { from: string | null; to: string | null }) => void;
};

const parseDateValue = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateValue = (value: Date | string | null | undefined) => {
  if (!value) return null;
  if (typeof value === "string") {
    return value;
  }
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const OrderScheduleFilterPopup = ({
  payload,
  onClose,
}: StackComponentProps<OrderScheduleFilterPopupPayload>) => {
  const closeController = useFeaturePopupCloseController({
    hasUnsavedChanges: false,
    onClose,
  });
  const [fromDate, setFromDate] = useState<string | null>(payload?.from ?? null);
  const [toDate, setToDate] = useState<string | null>(payload?.to ?? null);

  if (!payload) {
    throw new Error("OrderScheduleFilterPopup payload is missing.");
  }

  const handleSubmit = async () => {
    payload.onApply({
      from: formatDateValue(fromDate),
      to: formatDateValue(toDate),
    });
    await closeController.confirmClose();
  };

  return (
    <>
      <FeaturePopupShell onRequestClose={closeController.requestClose} size="mdNoHeight" variant="center">
        <FeaturePopupHeader
          title="Select Order Schedule"
          onClose={closeController.requestClose}
        />
        <FeaturePopupBody className="flex h-full flex-col space-y-4 bg-[var(--color-ligth-bg)]">
          <div className="flex flex-col gap-3 px-4 py-4">
            <Field label="From">
              <CustomDatePicker
                selectionMode="single"
                renderPopoverInPortal
                date={parseDateValue(fromDate)}
                onChange={(value) => setFromDate(formatDateValue(value))}
              />
            </Field>
            <Field label="To">
              <CustomDatePicker
                selectionMode="single"
                renderPopoverInPortal
                date={parseDateValue(toDate)}
                onChange={(value) => setToDate(formatDateValue(value))}
              />
            </Field>
          </div>

          <div className="mt-auto flex justify-between gap-2 border-t border-white/10 bg-[var(--color-page)] px-4 pb-4 pt-4">
            <BasicButton
              params={{
                variant: "ghost",
                onClick: () => {
                  setFromDate(null);
                  setToDate(null);
                },
                ariaLabel: "Clear order schedule filters",
              }}
            >
              Clear
            </BasicButton>
            <BasicButton
              params={{
                variant: "primary",
                onClick: () => {
                  void handleSubmit();
                },
                ariaLabel: "Apply order schedule filters",
              }}
            >
              Apply Filters
            </BasicButton>
          </div>
        </FeaturePopupBody>
      </FeaturePopupShell>

      <FeaturePopupClosePrompt controller={closeController} />
    </>
  );
};
