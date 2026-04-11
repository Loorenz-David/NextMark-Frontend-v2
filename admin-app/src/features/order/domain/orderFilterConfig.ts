import type { FilterConfig } from "@/shared/searchBars";
import type {
  OrderQueryStringQueries,
  OrderQueryFilters,
} from "../types/orderMeta";

export const orderStringFilters = new Set<OrderQueryStringQueries>([
  "order_scalar_id",
  "reference_number",
  "external_source",
  "tracking_number",
  "client_name",
  "client_email",
  "client_address",
  "client_phone",
  "plan_label",
  "plan_type",
  "article_number",
  "item_type",
]);

export const filterConfig: FilterConfig[] = [
  {
    type: "popup-multi-select",
    key: "order_state",
    label: "Order State",
    popupKey: "order.filter.order-state",
  },
  {
    type: "popup-date-range",
    keyStart: "order_schedule_from",
    keyEnd: "order_schedule_to",
    label: "Order Schedule",
    popupKey: "order.filter.order-schedule-range",
  },
  // {
  //   type: "option",
  //   key: "schedule_order",
  //   label: "Only schedule orders",
  //   value: true,
  // },
  {
    type: "option",
    key: "unschedule_order",
    label: "Only unschedule orders",
    value: true,
  },
  {
    type: "option",
    key: "show_archived",
    label: "Archived",
    value: true,
  },

  // ORDER DETAIL FILTERS new
  {
    type: "option",
    key: "plan_label",
    label: "Plan name",
    value: "",
  },
  {
    type: "option",
    key: "plan_type",
    label: "Plan Type",
    value: "",
  },

  {
    type: "option",
    key: "reference_number",
    label: "Reference Number",
    value: "",
  },
  {
    type: "option",
    key: "external_source",
    label: "External Source",
    value: "",
  },
  {
    type: "option",
    key: "tracking_number",
    label: "Tracking number",
    value: "",
  },

  // CLIENT DETAILS
  {
    type: "option",
    key: "client_name",
    label: "Client Name",
    value: "",
  },
  {
    type: "option",
    key: "client_email",
    label: "Client Email",
    value: "",
  },
  // new
  {
    type: "option",
    key: "client_address",
    label: "Client address",
    value: "",
  },
  {
    type: "option",
    key: "client_phone",
    label: "Client Phone",
    value: "",
  },

  // ITEM FILTERS new
  {
    type: "option",
    key: "article_number",
    label: "Item Article Number",
    value: "",
  },
  {
    type: "option",
    key: "item_type",
    label: "Item Type",
    value: "",
  },
  {
    type: "option",
    key: "reference_number-in-items",
    label: "Item Reference Number",
    value: "",
  },
  {
    type: "option",
    key: "quantity-in-items",
    label: "Item Quantity",
    value: "",
  },
  {
    type: "option",
    key: "weight-in-items",
    label: "Item Weight",
    value: "",
  },
  {
    type: "option",
    key: "dimension_height-in-items",
    label: "Item Dimension Height",
    value: "",
  },
  {
    type: "option",
    key: "dimension_width-in-items",
    label: "Item Dimension Width",
    value: "",
  },
  {
    type: "option",
    key: "dimension_depth-in-items",
    label: "Item Dimension Depth",
    value: "",
  },
];

export const filterBehavior = {
  schedule_order: {
    exclusiveWith: ["unschedule_order"],
  },
  unschedule_order: {
    exclusiveWith: [
      "schedule_order",
      "order_schedule_from",
      "order_schedule_to",
    ],
  },
  order_schedule_from: {
    exclusiveWith: ["unschedule_order"],
  },
  order_schedule_to: {
    exclusiveWith: ["unschedule_order"],
  },
};

export const resolveConflicts = (current: OrderQueryFilters, key: string) => {
  const currentFilters = { ...current };
  const conflict = filterBehavior[key as keyof typeof filterBehavior];

  if (conflict?.exclusiveWith) {
    conflict.exclusiveWith.forEach(
      (c) => delete currentFilters[c as keyof OrderQueryFilters],
    );
  }

  return currentFilters;
};
