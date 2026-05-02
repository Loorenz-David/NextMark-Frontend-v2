import { apiClient } from "@/lib/api/ApiClient";
import type { ApiResult } from "@/lib/api/types";
import type { DeliveryPlan } from "@/features/plan/types/plan";
import type { RouteGroup } from "@/features/plan/routeGroup/types/routeGroup";

import type { Order } from "../types/order";
import type { OrderUpdateFields } from "../types/order";
import type { OrderStateMap } from "../types/orderState";

/** Single typed note object accepted by the state-change endpoint. */
export type OrderStateNoteInput = { type: string; content: string };

/**
 * Fields accepted by the /orders/:id/state/:stateId endpoint.
 * order_notes is a single note object, not an array.
 */
export type OrderStateFields = Omit<OrderUpdateFields, "order_notes"> & {
  order_notes?: OrderStateNoteInput | null;
};

export type OrderStateListResponse = {
  order_states: OrderStateMap;
};

export type OrderStateUpdatePayload = {
  orders?: Order[];
  route_groups?: RouteGroup[];
  route_plans?: DeliveryPlan[];
};

export const getOrderStates = (): Promise<ApiResult<OrderStateListResponse>> =>
  apiClient.request<OrderStateListResponse>({
    path: "/orders/states/",
    method: "GET",
  });

export const updateOrderState = (
  orderId: number,
  stateId: number,
  fields?: OrderStateFields,
): Promise<ApiResult<OrderStateUpdatePayload>> =>
  apiClient.request<OrderStateUpdatePayload>({
    path: `/orders/${orderId}/state/${stateId}`,
    method: "PATCH",
    ...(fields ? { data: { fields } } : {}),
  });

export const useGetOrderStates = () => getOrderStates;
export const useUpdateOrderState = () => updateOrderState;
