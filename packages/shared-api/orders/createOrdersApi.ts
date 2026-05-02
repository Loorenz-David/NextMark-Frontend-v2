import type {
  Order,
  OrderBatchMoveResponse,
  OrderBatchSelectionPayload,
  OrderBatchSelectionResolveResponse,
  OrderCreatePayload,
  OrderCreateResponse,
  OrderDeleteResponse,
  OrderMap,
  OrderPagination,
  OrderPlanUpdateResponse,
  OrderQueryFilters,
  OrderStats,
  OrderUpdateFields,
  OrderUpdateResponse,
  coordinates,
} from "@shared-domain";
import type { ApiResult } from "../core";
import type { QueryValue } from "../http";
import type { HttpApiClient } from "../http/createApiClient";

export type OrderListResponse = {
  order: OrderMap;
  order_stats: OrderStats;
  order_pagination: OrderPagination;
};

export type OrderMapMarkerResponse = {
  markers: Array<{
    id: string;
    coordinates: coordinates;
    primary_order_client_id: string;
    order_client_ids: string[];
    count: number;
  }>;
  order: OrderMap;
  truncated: boolean;
};

export type OrderDetailResponse = {
  order: OrderMap | Order;
};

export type OrderEventActionStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "SKIPPED";

export type OrderEventAction = {
  id: number;
  event_id: number;
  team_id: number;
  action_name: string;
  status: OrderEventActionStatus;
  attempts: number;
  last_error: string | null;
  scheduled_for: string | null;
  enqueued_at: string | null;
  processed_at: string | null;
  schedule_anchor_type: string | null;
  schedule_anchor_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderEventItem = {
  id: number;
  event_id: string;
  order_id: number;
  team_id: number;
  actor_id: number | null;
  event_name: string;
  payload: Record<string, unknown> | null;
  occurred_at: string;
  entity_type: string;
  entity_id: string;
  entity_version: string | null;
  dispatch_status: string;
  dispatch_attempts: number;
  claimed_at: string | null;
  claimed_by: string | null;
  next_attempt_at: string | null;
  last_error: string | null;
  relayed_at: string | null;
  actions: OrderEventAction[];
};

export type OrderEventsResponse = {
  order_id: number;
  order_events: OrderEventItem[];
};

export type OrderUpdatePayload = {
  target_id: number | string;
  fields: OrderUpdateFields;
};

export type OrderDeletePayload = {
  target_id?: number | string;
  target_ids?: Array<number | string>;
};

export type UpdateOrderDeliveryPlanPayload = {
  route_group_id?: number;
  prevent_event_bus?: boolean;
};

export type OrderNoteMutationPayload = {
  target_id: number | string;
  order_notes: { type: string; content: string };
};

export type OrderNoteMutationResponse = {
  order?: Order | null;
  order_notes?: (string | { type: string; content: string; creation_date?: string | null })[] | null;
};

export const createOrdersApi = (client: Pick<HttpApiClient, "request">) => ({
  listOrders: (
    query?: OrderQueryFilters,
  ): Promise<ApiResult<OrderListResponse>> =>
    client.request<OrderListResponse>({
      path: "/orders/",
      method: "GET",
      query,
    }),

  getOrder: (
    orderId: number | string,
  ): Promise<ApiResult<OrderDetailResponse>> =>
    client.request<OrderDetailResponse>({
      path: `/orders/${orderId}`,
      method: "GET",
    }),

  getOrderEvents: (
    orderId: number | string,
  ): Promise<ApiResult<OrderEventsResponse>> =>
    client.request<OrderEventsResponse>({
      path: `/orders/${orderId}/events/`,
      method: "GET",
    }),

  createOrder: (
    payload: OrderCreatePayload,
  ): Promise<ApiResult<OrderCreateResponse>> =>
    client.request<OrderCreateResponse>({
      path: "/orders/",
      method: "PUT",
      data: { fields: payload },
    }),

  updateOrder: (
    payload: OrderUpdatePayload | OrderUpdatePayload[],
  ): Promise<ApiResult<OrderUpdateResponse>> =>
    client.request<OrderUpdateResponse>({
      path: "/orders/",
      method: "PATCH",
      data: { target: payload },
    }),

  updateOrderNote: (
    payload: OrderNoteMutationPayload,
  ): Promise<ApiResult<OrderNoteMutationResponse>> =>
    client.request<OrderNoteMutationResponse>({
      path: "/orders/notes/",
      method: "PATCH",
      data: payload,
    }),

  deleteOrderNote: (
    payload: OrderNoteMutationPayload,
  ): Promise<ApiResult<OrderNoteMutationResponse>> =>
    client.request<OrderNoteMutationResponse>({
      path: "/orders/notes/",
      method: "DELETE",
      data: payload,
    }),

  deleteOrder: (
    payload: OrderDeletePayload,
  ): Promise<ApiResult<OrderDeleteResponse>> =>
    client.request<OrderDeleteResponse>({
      path: "/orders/",
      method: "DELETE",
      data: payload,
    }),

  archiveOrder: (
    payload: OrderDeletePayload,
  ): Promise<ApiResult<Record<string, never>>> =>
    client.request<Record<string, never>>({
      path: "/orders/archive",
      method: "PATCH",
      data: payload,
    }),

  unarchiveOrder: (
    payload: OrderDeletePayload,
  ): Promise<ApiResult<Record<string, never>>> =>
    client.request<Record<string, never>>({
      path: "/orders/unarchive",
      method: "PATCH",
      data: payload,
    }),

  updateOrderDeliveryPlan: (
    orderId: number | string,
    planId: number | string,
    payload?: UpdateOrderDeliveryPlanPayload,
  ): Promise<ApiResult<OrderPlanUpdateResponse>> =>
    client.request<OrderPlanUpdateResponse>({
      path: `/order_assignments/orders/${orderId}/plan/${planId}`,
      method: "PATCH",
      data: payload,
    }),

  resolveOrderBatchSelection: (
    selection: OrderBatchSelectionPayload,
  ): Promise<ApiResult<OrderBatchSelectionResolveResponse>> =>
    client.request<OrderBatchSelectionResolveResponse>({
      path: "/order_assignments/selection/resolve",
      method: "POST",
      data: { selection },
    }),

  updateOrdersDeliveryPlanBatch: (
    planId: number | string,
    selection: OrderBatchSelectionPayload,
  ): Promise<ApiResult<OrderBatchMoveResponse>> =>
    client.request<OrderBatchMoveResponse>({
      path: `/order_assignments/plans/${planId}/batch`,
      method: "PATCH",
      data: { selection },
    }),

  listOrderMapMarkers: (
    query?: Record<string, QueryValue>,
  ): Promise<ApiResult<OrderMapMarkerResponse>> =>
    client.request<OrderMapMarkerResponse>({
      path: "/orders/map_markers/",
      method: "GET",
      query,
    }),
});
