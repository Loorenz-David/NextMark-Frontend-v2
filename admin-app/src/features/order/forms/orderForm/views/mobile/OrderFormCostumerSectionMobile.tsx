import { useMemo, useState } from "react";

import { CostumerSearchBar } from "@/features/costumer";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { ThreeDotMenu, type ThreeDotMenuOption } from "@/shared/buttons/ThreeDotMenu";
import { BottomSheet } from "@/shared/overlays/bottomSheet";
import { PushedPage } from "@/shared/overlays/pushedPage";

import { useCostumerPanelActions } from "../../components/CostumerPanel/CostumerPanel.actions";
import {
  formatCostumerAddress,
  formatCostumerFullName,
  formatCostumerPhone,
  isCostumerPanelFormView,
} from "../../components/CostumerPanel/CostumerPanel.flows";
import { CostumerPanelEmbeddedFormView } from "../../components/CostumerPanel/CostumerPanelEmbeddedFormView";
import { CostumerPanelUpdateToggle } from "../../components/CostumerPanel/CostumerPanelUpdateToggle";
import { orderFormCostumerFieldsChanged } from "../../domain/costumerProfileSync";
import type { OrderFormLayoutModel } from "../../OrderForm.layout.model";
import { OrderFormMobileSection } from "./OrderFormMobileSection";

type OrderFormCostumerSectionMobileProps = {
  model: OrderFormLayoutModel;
};

const DetailLine = ({ label, value }: { label: string; value: string }) => (
  <div className="flex min-w-0 flex-col">
    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
      {label}
    </span>
    <span className="min-w-0 break-words text-sm text-[var(--color-text)]">{value}</span>
  </div>
);

/**
 * Phone replacement for the desktop customer panel: a summary card, a
 * search sheet to link a customer, and the customer form pushed as a page
 * for create/edit.
 */
export const OrderFormCostumerSectionMobile = ({
  model,
}: OrderFormCostumerSectionMobileProps) => {
  const costumer = model.selectedCostumer;
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const actions = useCostumerPanelActions({
    costumer,
    onSelectCostumer: (entry, source = "panel") =>
      model.requestSelectCostumer(entry, source),
  });

  const initialForm = model.initialFormRef.current;
  const canUpdateCostumer =
    model.mode === "edit" &&
    !!costumer &&
    !!initialForm &&
    orderFormCostumerFieldsChanged(model.formState, initialForm);

  const menuOptions = useMemo<ThreeDotMenuOption[]>(
    () => [
      { label: "Change customer", action: () => setIsSearchOpen(true) },
      { label: "Edit customer", action: actions.handleStartEdit },
    ],
    [actions.handleStartEdit],
  );

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  return (
    <>
      <OrderFormMobileSection
        title="Customer"
        action={
          costumer ? (
            <ThreeDotMenu
              dotWidth={3}
              dotHeight={3}
              dotClassName="bg-[var(--color-muted)]"
              triggerClassName="touch-hit-area flex h-6 w-6 cursor-pointer items-center justify-center"
              options={menuOptions}
              width={200}
              renderInPortal
            />
          ) : undefined
        }
      >
        {costumer ? (
          <div className="flex flex-col gap-3 px-4 py-3">
            <DetailLine label="Name" value={formatCostumerFullName(costumer) || "-"} />
            <DetailLine label="Email" value={costumer.email ?? "-"} />
            <DetailLine label="Phone" value={formatCostumerPhone(costumer)} />
            <DetailLine label="Address" value={formatCostumerAddress(costumer)} />
            {canUpdateCostumer ? (
              <div className="border-t border-[var(--color-border-accent)] pt-3">
                <CostumerPanelUpdateToggle
                  value={model.updateCostumer}
                  onChange={model.formSetters.handleUpdateCostumer}
                />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm text-[var(--color-muted)]">No customer linked.</p>
            <BasicButton
              params={{
                variant: "secondary",
                onClick: openSearch,
                className: "h-10 px-4",
                ariaLabel: "Find customer",
              }}
            >
              Find customer
            </BasicButton>
          </div>
        )}
      </OrderFormMobileSection>

      <BottomSheet
        open={isSearchOpen}
        onClose={closeSearch}
        title="Find customer"
        maxHeight="90dvh"
        bodyClassName="px-4 pb-4"
      >
        <CostumerSearchBar
          onSelectCostumer={(entry) => {
            closeSearch();
            actions.handleSearchSelect(entry);
          }}
          handleStartCreate={() => {
            closeSearch();
            actions.handleStartCreate();
          }}
          selectedCostumerClientId={costumer?.client_id ?? null}
        />
      </BottomSheet>

      <PushedPage
        open={isCostumerPanelFormView(actions.panelView)}
        onBack={actions.handleEmbeddedClose}
        backAriaLabel="Close customer form"
      >
        {isCostumerPanelFormView(actions.panelView) ? (
          <CostumerPanelEmbeddedFormView
            panelView={actions.panelView}
            payload={actions.embeddedFormPayload}
            onRequestClose={actions.handleEmbeddedClose}
            onSavedCostumer={actions.handleEmbeddedSaved}
          />
        ) : null}
      </PushedPage>
    </>
  );
};
