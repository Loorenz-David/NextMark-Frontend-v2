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

export type ItemIdPagination = {
  has_more: boolean;
  next_cursor: { after_id: number } | null;
  prev_cursor: { before_id: number } | null;
};

/**
 * Response of `GET /items/` (the batched, cross-order list endpoint). `items`
 * is an ItemMap keyed by client_id (same shape as the per-order endpoint), but
 * spans multiple orders — every entry carries its own `order_id`, so callers
 * bucket the items back per order themselves.
 */
export type ItemBatchListResponse = {
  items: ItemMap;
  items_pagination?: ItemIdPagination | null;
};

export type ItemBatchListQuery = {
  limit?: number;
  after_id?: number;
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

  // Batched item fetch across many orders in a single request. The endpoint
  // reads order_id as a comma-separated value, so ids are joined here. Pass an
  // explicit `limit` sized to the expected total item count — it defaults to 50
  // server-side. Cursor-paginated by item id via `items_pagination.next_cursor`.
  getItemsByOrderIds: (
    orderIds: Array<number | string>,
    query?: ItemBatchListQuery,
  ): Promise<ApiResult<ItemBatchListResponse>> =>
    client.request<ItemBatchListResponse>({
      path: "/items/",
      method: "GET",
      query: {
        order_id: orderIds.join(","),
        ...query,
      },
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
