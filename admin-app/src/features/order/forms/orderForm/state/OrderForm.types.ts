import type { RefObject } from "react";

import type { address } from "@/types/address";
import type { Phone } from "@/types/phone";

import type { Item } from "../../../item";
import type { Order } from "../../../types/order";
import type { OrderDeliveryWindow } from "../../../types/order";
import type { OrderOperationTypes } from "../../../types/order";
import type { useOrderFormWarnings } from "./OrderForm.warnings";
import type { useOrderFormActions } from "../controllers/useOrderFormSubmit.actions";
import type { useOrderFormSetters } from "./orderForm.setters";
import type { useOrderFormItemEditorActions } from "../actions/orderFormItemEditor.actions";
import type { Costumer } from "@/features/costumer";

export type OrderFormMode = "create" | "edit";
export type OrderFormCloseState = "idle" | "confirming";
export type CostumerSelectionSource = "lookup" | "panel" | "embedded";
export type CostumerSelectionRequestResult = "applied" | "prompted" | "ignored";

export type OrderFormState = {
  client_id: string;
  order_plan_objective: string | null;
  operation_type: OrderOperationTypes;
  reference_number: string | null;
  external_source: string;
  external_tracking_number: string;
  external_tracking_link: string;
  tracking_number: string;
  tracking_link: string;
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  client_primary_phone: Phone;
  client_secondary_phone: Phone;
  client_address: address | null;
  delivery_windows: OrderDeliveryWindow[];
  delivery_plan_id?: number | null;
  route_group_id?: number | null;
  general_note: string;
  customer_note: string;
  order_notes_source?: unknown[] | null;
};

export type OrderFormPayload = {
  mode?: OrderFormMode;
  clientId?: string;
  costumer_id?: number;
  deliveryPlanId?: number | null;
  routeGroupId?: number | null;
  restoreFormState?: OrderFormState;
};

export type OrderFormWarnings = ReturnType<typeof useOrderFormWarnings>;
export type OrderFormActions = ReturnType<typeof useOrderFormActions>;
export type OrderFormSetters = ReturnType<typeof useOrderFormSetters>;
export type OrderFormItemEditorState = ReturnType<
  typeof useOrderFormItemEditorActions
>;

export type OrderFormMeta = {
  mode: OrderFormMode;
  order: Order | null;
  creationDate: string | null;
  selectedCostumer: Costumer | null;
  selectedCostumerSource: CostumerSelectionSource | null;
  pendingCostumerChange: Costumer | null;
  isCostumerChangePromptOpen: boolean;
  initialFormRef: RefObject<OrderFormState | null>;
  visibleItemDrafts: Item[];
  itemInitialByClientId: Record<string, Item>;
  isLoadingInitialItems: boolean;
};

export type OrderFormCloseController = {
  closeState: OrderFormCloseState;
  hasUnsavedChanges: boolean;
  requestClose: () => void;
  confirmClose: () => void;
  cancelClose: () => void;
};

export type OrderFormContextValue = {
  formState: OrderFormState;
  warnings: OrderFormWarnings;
  formSetters: OrderFormSetters;
  actions: OrderFormActions;
  requestSelectCostumer: (
    value: Costumer,
    source: CostumerSelectionSource,
  ) => CostumerSelectionRequestResult;
  confirmReplaceWithPendingCostumer: () => void;
  confirmKeepSnapshotWithPendingCostumer: () => void;
  cancelPendingCostumerChange: () => void;
  itemEditor: OrderFormItemEditorState;
  meta: OrderFormMeta;
  closeController: OrderFormCloseController;
};

export type OrderFormFormSlice = Pick<
  OrderFormContextValue,
  "formState" | "warnings" | "formSetters"
>;
export type OrderFormActionsSlice = Pick<OrderFormContextValue, "actions">;
export type OrderFormItemEditorSlice = Pick<
  OrderFormContextValue,
  "itemEditor"
>;
export type OrderFormMetaSlice = Pick<
  OrderFormContextValue,
  | "meta"
  | "requestSelectCostumer"
  | "confirmReplaceWithPendingCostumer"
  | "confirmKeepSnapshotWithPendingCostumer"
  | "cancelPendingCostumerChange"
>;
export type OrderFormCloseSlice = Pick<
  OrderFormContextValue,
  "closeController"
>;
