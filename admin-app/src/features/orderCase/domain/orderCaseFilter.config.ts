import type { FilterConfig } from "@/shared/searchBars";
import type { OrderCaseQueryStringQueries } from "../types";

export const orderCaseStringFilters = new Set<OrderCaseQueryStringQueries>([
  "order_reference",
  "created_by_user",
  "user_in_conversation",
  "chat",
])

export const isOrderCaseStringFilter = (key: string): key is OrderCaseQueryStringQueries => {
  return orderCaseStringFilters.has(key as OrderCaseQueryStringQueries)
}

export const filterConfig: FilterConfig[] = [
  {
    type: 'option',
    key: 'order_reference',
    label: 'order reference number',
    value: '',
  },
  {
    type: 'option',
    key: 'created_by_user',
    label: 'created by user',
    value: '',
  },
  {
    type: 'option',
    key: 'user_in_conversation',
    label: 'user in conversation',
    value: '',
  },
  {
    type: "option",
    key: "chat",
    label: "conversations",
    value: "",
  },
  

]
