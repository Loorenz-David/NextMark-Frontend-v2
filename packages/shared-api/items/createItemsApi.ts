import type {
  Item,
  ItemMap,
  ItemQueryFilters,
  ItemUpdateFields,
} from "@shared-domain";

import type { ApiResult } from "../core";
import type { HttpApiClient } from "../http/createApiClient";

export type ItemCreateResponseEntry = Item & { id: number };

export type ItemListResponse = {
  items: ItemMap;
};

export type OrderTotalsEntry = {
  id: number;
  total_weight: number | null;
  total_volume: number | null;
  total_items: number | null;
  item_type_counts?: Record<string, number> | null;
};

export type PlanTotalsEntry = {
  id: number;
  total_weight: number | null;
  total_volume: number | null;
  total_items: number | null;
  item_type_counts?: Record<string, number> | null;
  total_orders: number | null;
};

export type ItemCreateResponse = {
  item: ItemCreateResponseEntry[];
  order_totals?: OrderTotalsEntry[];
  plan_totals?: PlanTotalsEntry[];
};

export type ItemMutationResponse = {
  order_totals?: OrderTotalsEntry[];
  plan_totals?: PlanTotalsEntry[];
};

export type ItemUpdatePayload = {
  target_id: number | string;
  fields: ItemUpdateFields;
};

export type ItemDeletePayload = {
  target_id?: number | string;
  target_ids?: Array<number | string>;
};

export const createItemsApi = (client: Pick<HttpApiClient, "request">) => ({
  getOrderItems: (
    orderId: number,
    query?: ItemQueryFilters,
  ): Promise<ApiResult<ItemListResponse>> =>
    client.request<ItemListResponse>({
      path: `/orders/${orderId}/items/`,
      method: "GET",
      query,
    }),

  createItem: (
    payload: Item | Item[],
  ): Promise<ApiResult<ItemCreateResponse>> =>
    client.request<ItemCreateResponse>({
      path: "/items/",
      method: "POST",
      data: { fields: payload },
    }),

  updateItem: (
    payload: ItemUpdatePayload | ItemUpdatePayload[],
  ): Promise<ApiResult<ItemMutationResponse>> =>
    client.request<ItemMutationResponse>({
      path: "/items/",
      method: "PATCH",
      data: { target: payload },
    }),

  deleteItem: (
    payload: ItemDeletePayload,
  ): Promise<ApiResult<ItemMutationResponse>> =>
    client.request<ItemMutationResponse>({
      path: "/items/",
      method: "DELETE",
      data: payload,
    }),
});
