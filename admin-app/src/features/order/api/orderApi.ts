import { createOrdersApi } from "@shared-api";
import { apiClient } from "@/lib/api/ApiClient";
import type { ApiResult } from "@/lib/api/types";
import type { RouteSolution } from "@/features/plan/routeGroup/types/routeSolution";
import type { RouteSolutionStop } from "@/features/plan/routeGroup/types/routeSolutionStop";

export type {
  OrderDeletePayload,
  OrderDetailResponse,
  OrderEventAction,
  OrderEventActionStatus,
  OrderEventItem,
  OrderListResponse,
  OrderNoteMutationPayload,
  OrderNoteMutationResponse,
  OrderEventsResponse,
  OrderMapMarkerResponse,
  OrderUpdatePayload,
} from "@shared-api";

const ordersApi = createOrdersApi(apiClient);

export const {
  listOrders,
  getOrder,
  getOrderEvents,
  createOrder,
  updateOrder,
  updateOrderNote,
  deleteOrderNote,
  deleteOrder,
  archiveOrder,
  unarchiveOrder,
  updateOrderDeliveryPlan,
  resolveOrderBatchSelection,
  updateOrdersDeliveryPlanBatch,
  listOrderMapMarkers,
} = ordersApi;

export type OrderRouteContextResponse = {
  order_id: number;
  route_solution?: RouteSolution | null;
  route_solution_stop?: RouteSolutionStop | null;
  route_plan_id?: number | null;
  route_group_id?: number | null;
};

export const getOrderRouteContext = (
  orderId: number | string,
): Promise<ApiResult<OrderRouteContextResponse>> =>
  apiClient.request<OrderRouteContextResponse>({
    path: `/orders/${orderId}/route-context`,
    method: "GET",
  });

export const useGetOrders = () => listOrders;
export const useGetOrder = () => getOrder;
export const useGetOrderRouteContext = () => getOrderRouteContext;
export const useGetOrderEvents = () => getOrderEvents;
export const useCreateOrder = () => createOrder;
export const useUpdateOrder = () => updateOrder;
export const useUpdateOrderNote = () => updateOrderNote;
export const useDeleteOrderNote = () => deleteOrderNote;
export const useDeleteOrder = () => deleteOrder;
export const useUpdateOrderDeliveryPlan = () => updateOrderDeliveryPlan;
export const useResolveOrderBatchSelection = () => resolveOrderBatchSelection;
export const useUpdateOrdersDeliveryPlanBatch = () =>
  updateOrdersDeliveryPlanBatch;
export const useArchiveOrder = () => archiveOrder;
export const useUnarchiveOrder = () => unarchiveOrder;
export const useListOrderMapMarkers = () => listOrderMapMarkers;
