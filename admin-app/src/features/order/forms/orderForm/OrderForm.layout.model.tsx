import type { PopoverSelectOption } from "@/shared/inputs/OptionPopoverSelect";

import { useOrderFormActionsSlice } from "./context/OrderFormActions.context";
import { useOrderFormCloseSlice } from "./context/OrderFormClose.context";
import { useOrderFormFormSlice } from "./context/OrderFormForm.context";
import { useOrderFormItemEditorSlice } from "./context/OrderFormItemEditor.context";
import { useOrderFormMetaSlice } from "./context/OrderFormMeta.context";

export const ORDER_PLAN_OBJECTIVE_OPTIONS: Array<PopoverSelectOption<string>> =
  [
    { label: "Local delivery", value: "local_delivery" },
    { label: "International shipping", value: "international_shipping" },
    { label: "Store pickup", value: "store_pickup" },
  ];

export const toDateValue = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export const useOrderFormLayoutModel = () => {
  const { formState, warnings, formSetters } = useOrderFormFormSlice();
  const { actions } = useOrderFormActionsSlice();
  const { itemEditor } = useOrderFormItemEditorSlice();
  const {
    meta,
    requestSelectCostumer,
    confirmReplaceWithPendingCostumer,
    confirmKeepSnapshotWithPendingCostumer,
    cancelPendingCostumerChange,
  } = useOrderFormMetaSlice();
  const { closeController } = useOrderFormCloseSlice();

  const {
    mode,
    order,
    creationDate,
    visibleItemDrafts,
    isLoadingInitialItems,
    selectedCostumer,
    isCostumerChangePromptOpen,
    pendingCostumerChange,
  } = meta;
  const { handleSave, handleDelete, handlePrepareOrderForCustomerSend } =
    actions;
  const {
    isItemEditorOpen,
    itemEditorPayload,
    openItemCreateForm,
    openItemEditForm,
    closeItemEditor,
  } = itemEditor;
  const labelMode = mode === "create" ? "Creating Order" : "Editing Order";

  return {
    label: labelMode,
    mode,
    order,
    orderServerId: typeof order?.id === "number" ? order.id : null,
    creationDate,
    formState,
    warnings,
    formSetters,
    handleSave,
    handlePrepareOrderForCustomerSend,
    handleDelete,
    isItemEditorOpen,
    itemEditorPayload,
    openItemCreateForm,
    openItemEditForm,
    closeItemEditor,
    visibleItemDrafts,
    isLoadingInitialItems,
    closeController,
    selectedCostumer,
    isCostumerChangePromptOpen,
    pendingCostumerChange,
    requestSelectCostumer,
    confirmReplaceWithPendingCostumer,
    confirmKeepSnapshotWithPendingCostumer,
    cancelPendingCostumerChange,
  };
};

export type OrderFormLayoutModel = ReturnType<typeof useOrderFormLayoutModel>;
