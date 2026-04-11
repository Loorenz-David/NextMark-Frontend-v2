import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import type { StackComponentProps } from "@/shared/stack-manager/types";
import { BasicButton } from "@/shared/buttons/BasicButton";
import {
  FeaturePopupBody,
  FeaturePopupClosePrompt,
  FeaturePopupHeader,
  FeaturePopupShell,
  useFeaturePopupCloseController,
} from "@/shared/popups/featurePopup";
import { selectAllOrderStates, useOrderStateStore } from "../../store/orderState.store";

export type OrderStateFilterPopupPayload = {
  selectedStates: string[];
  onApply: (states: string[]) => void;
};

const CheckMarkIcon = ({ className }: { className?: string }) => (
  <svg fill="none" viewBox="0 0 24 24" className={className}>
    <path
      d="M5 12.5 9.5 17 19 7.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.25"
    />
  </svg>
);

export const OrderStateFilterPopup = ({
  payload,
  onClose,
}: StackComponentProps<OrderStateFilterPopupPayload>) => {
  const closeController = useFeaturePopupCloseController({
    hasUnsavedChanges: false,
    onClose,
  });
  const orderStates = useOrderStateStore(useShallow(selectAllOrderStates));
  const [selectedStates, setSelectedStates] = useState<string[]>(
    payload?.selectedStates ?? [],
  );

  const sortedStates = useMemo(
    () =>
      [...orderStates].sort(
        (left, right) =>
          (left.index ?? Number.MAX_SAFE_INTEGER) -
          (right.index ?? Number.MAX_SAFE_INTEGER),
      ),
    [orderStates],
  );

  if (!payload) {
    throw new Error("OrderStateFilterPopup payload is missing.");
  }

  const toggleState = (stateName: string) => {
    setSelectedStates((current) =>
      current.includes(stateName)
        ? current.filter((entry) => entry !== stateName)
        : [...current, stateName],
    );
  };

  const handleSubmit = async () => {
    payload.onApply(selectedStates);
    await closeController.confirmClose();
  };

  return (
    <>
      <FeaturePopupShell onRequestClose={closeController.requestClose} size="mdNoHeight" variant="center">
        <FeaturePopupHeader
          title="Select Order States"
          onClose={closeController.requestClose}
        />
        <FeaturePopupBody className="flex h-full flex-col space-y-4 bg-[var(--color-ligth-bg)]">
          <div className="flex flex-col px-4 py-4 space-y-3">
            {sortedStates.map((state) => {
              const isSelected = selectedStates.includes(state.name);

              return (
                <button
                  key={state.client_id}
                  type="button"
                  onClick={() => toggleState(state.name)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? "border-cyan-300/25 bg-[linear-gradient(135deg,rgba(56,189,248,0.15),rgba(56,189,248,0.05))] text-[var(--color-text)]"
                      : "border-white/10 bg-[var(--color-page)] text-white/80 hover:border-white/25"
                  }`}
                >
                  {isSelected ? (
                    <div className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(96,165,250,0.92)] text-white">
                      <CheckMarkIcon className="h-3 w-3" />
                    </div>
                  ) : (
                    <span className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[rgba(147,197,253,0.72)] bg-[rgba(239,246,255,0.96)]" />
                  )}

                  <span className="leading-6">{state.name}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto flex justify-between gap-2 border-t border-white/10 bg-[var(--color-page)] px-4 pb-4 pt-4">
            <BasicButton
              params={{
                variant: "ghost",
                onClick: () => setSelectedStates([]),
                ariaLabel: "Clear selected states",
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
                ariaLabel: "Apply order state filters",
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
