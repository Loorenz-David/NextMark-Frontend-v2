import { createOrdersApi } from "@shared-api";
import { apiClient } from "@/lib/api/ApiClient";

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

export const useGetOrders = () => listOrders;
export const useGetOrder = () => getOrder;
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
