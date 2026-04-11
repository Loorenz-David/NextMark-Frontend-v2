import { apiClient } from "@/lib/api/ApiClient";
import type { ApiResult } from "@/lib/api/types";
import type {
  DeliveryPlan,
  DeliveryPlanMap,
  PlanCreatePayload,
  PlanCreateResponse,
  PlanUpdateFields,
} from "@/features/plan/types/plan";
import type { DeliveryPlanStateMap } from "@/features/plan/types/planState";
import type {
  PlanPagination,
  PlanQueryFilters,
  DeliveryPlanStatePagination,
  DeliveryPlanStateQueryFilters,
  PlanStats,
} from "@/features/plan/types/planMeta";

import type { OrderListResponse } from "@/features/order/api/orderApi";

export type PlanListResponse = {
  route_plan: DeliveryPlanMap;
  route_plan_stats: PlanStats;
  route_plan_pagination: PlanPagination;
};

export type PlanDetailResponse = {
  route_plan: DeliveryPlanMap | DeliveryPlan;
};

export type DeliveryPlanStateListResponse = {
  route_plan_states: DeliveryPlanStateMap;
  route_plan_states_pagination: DeliveryPlanStatePagination;
};

export type PlanUpdatePayload = {
  target_id: number | string;
  fields: PlanUpdateFields;
};

export type PlanDeletePayload = {
  target_id?: number | string;
  target_ids?: Array<number | string>;
};

export const planApi = {
  listPlans: (query?: PlanQueryFilters): Promise<ApiResult<PlanListResponse>> =>
    apiClient.request<PlanListResponse>({
      path: "/route_plans/",
      method: "GET",
      query,
    }),

  getPlan: (planId: number | string): Promise<ApiResult<PlanDetailResponse>> =>
    apiClient.request<PlanDetailResponse>({
      path: `/route_plans/${planId}`,
      method: "GET",
    }),

  getPlanOrders: (
    planId: number | string,
    query?: any,
  ): Promise<ApiResult<OrderListResponse>> =>
    apiClient.request<OrderListResponse>({
      path: `/route_plans/${planId}/orders/`,
      method: "GET",
      query,
    }),

  createPlan: (
    payload: PlanCreatePayload | PlanCreatePayload[],
  ): Promise<ApiResult<PlanCreateResponse>> =>
    apiClient.request<PlanCreateResponse>({
      path: "/route_plans/",
      method: "POST",
      data: { fields: payload },
    }),

  updatePlan: (
    payload: PlanUpdatePayload | PlanUpdatePayload[],
  ): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: "/route_plans/",
      method: "PATCH",
      data: { target: payload },
    }),

  deletePlan: (
    payload: PlanDeletePayload,
  ): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: "/route_plans/",
      method: "DELETE",
      data: payload,
    }),

  listDeliveryPlanStates: (
    query?: DeliveryPlanStateQueryFilters,
  ): Promise<ApiResult<DeliveryPlanStateListResponse>> =>
    apiClient.request<DeliveryPlanStateListResponse>({
      path: "/route_plans/states/",
      method: "GET",
      query,
    }),

  updateDeliveryPlanState: (
    planId: number | string,
    stateId: number | string,
  ): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: `/route_plans/${planId}/state/${stateId}`,
      method: "PATCH",
    }),
};

export type { ClientIdMap } from "@/features/plan/types/plan";
