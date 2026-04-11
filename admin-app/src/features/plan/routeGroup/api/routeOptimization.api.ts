import { apiClient } from "@/lib/api/ApiClient";
import type { ApiResult } from "@/lib/api/types";

import type { RouteSolution } from "@/features/plan/routeGroup/types/routeSolution";
import type { RouteSolutionStop } from "@/features/plan/routeGroup/types/routeSolutionStop";

export type RouteOptimizationPayload = {
  route_group_id: number;
  return_shape?: string;
  interpret_injected_solutions_using_labels?: boolean;
  populate_transition_polylines?: boolean;
  [key: string]: unknown;
};

export type RouteOptimizationResponse = {
  route_solution?: Record<string, RouteSolution> | RouteSolution;
  route_solution_stop?: Record<string, RouteSolutionStop> | RouteSolutionStop[];
  route_solution_stop_skipped?:
    | Record<string, RouteSolutionStop>
    | RouteSolutionStop[];
  [key: string]: unknown;
};

export const routeOptimizationApi = {
  createOptimization: (
    payload: RouteOptimizationPayload,
  ): Promise<ApiResult<RouteOptimizationResponse>> =>
    apiClient.request<RouteOptimizationResponse>({
      path: "/route_operations/optimize",
      method: "POST",
      data: payload,
    }),

  updateOptimization: (
    payload: RouteOptimizationPayload,
  ): Promise<ApiResult<RouteOptimizationResponse>> =>
    apiClient.request<RouteOptimizationResponse>({
      path: "/route_operations/optimize",
      method: "PATCH",
      data: payload,
    }),
};
