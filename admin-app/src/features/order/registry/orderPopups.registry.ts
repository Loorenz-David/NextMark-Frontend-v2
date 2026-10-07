import { createElement } from "react";
import type { StackComponentProps } from "@/shared/stack-manager/types";

import { OrderForm } from "../popups/OrderForm/OrderForm";
import { ItemForm } from "../item";
import { SendClientFormLinkPopup } from "../popups/SendClientFormLink/SendClientFormLinkPopup";
import { FailureNotePopup } from "../popups/FailureNote/FailureNotePopup";
import { EditOrderNotePopup } from "../popups/EditOrderNote/EditOrderNotePopup";
import { OrderFilterPopup } from "../popups/OrderFilter/OrderFilterPopup";

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>> ? P : never;

const PlaceholderPopup = () => createElement("div");

export const popupRegistry = {
  "order.edit": OrderForm,
  "order.item.create": ItemForm,
  "order.item.edit": ItemForm,
  "order.create": OrderForm,
  "order.client-form-link.send": SendClientFormLinkPopup,
  "order.failure-note.create": FailureNotePopup,
  "order.note.edit": EditOrderNotePopup,
  "order.filter.panel": OrderFilterPopup,
  FilterForm: PlaceholderPopup,
};

export type PopupKey = keyof typeof popupRegistry;

export type OrderPopupPayloads = {
  [K in keyof typeof popupRegistry]: ExtractPayload<(typeof popupRegistry)[K]>;
};
