import { apiClient } from "@/lib/api/ApiClient";
import type { ApiResult } from "@/lib/api/types";
import type {
  OrderBatchSelectionPayload,
  OrderBatchMoveResponse,
  PlanTotalsEntry,
} from "@shared-domain";

import type { Order } from "@/features/order/types/order";
import type { RouteGroupDefaults } from "@/features/plan/types/plan";
import type { RouteGroup } from "../types/routeGroup";
import type { RouteSolution } from "../types/routeSolution";
import type { RouteSolutionStop } from "../types/routeSolutionStop";
import type { RouteSolutionMap } from "../types/routeSolution";
import type { RouteSolutionStopMap } from "../types/routeSolutionStop";
import type { RouteGroupMap } from "../types/routeGroup";

export type MaterializeRouteGroupsPayload = {
  zone_ids: number[];
};

export type CreateRouteGroupPayload = {
  zone_id?: number | null;
  name?: string;
  route_group_defaults?: {
    name?: string;
    client_id?: string;
    route_solution?: RouteGroupDefaults["route_solution"];
  };
};

export type MoveOrderToRouteGroupPayload = {
  selection: OrderBatchSelectionPayload;
  route_group_id: number;
  prevent_event_bus: false;
};

export type OrderGroupMovedBundle = {
  order: Order;
  order_stops?: RouteSolutionStop[];
  route_solution?: RouteSolution[];
  plan_totals?: PlanTotalsEntry[];
};

export type RouteGroupDetailsResponse = {
  route_group?: RouteGroup | null;
  route_solutions?: RouteSolution[] | RouteSolutionMap | null;
  route_solution_stops?: RouteSolutionStop[] | RouteSolutionStopMap | null;
};

type RoutePlanTargetResponse = {
  id: number;
  state_id?: number | null;
};

export type CreateRouteGroupResponse = {
  created?: boolean;
  route_group?: RouteGroupMap | null;
  route_solution?: RouteSolution | RouteSolutionMap | null;
  route_plan?: RoutePlanTargetResponse | null;
};

export type DeleteRouteGroupResponse = {
  route_plan?: RoutePlanTargetResponse | null;
};

export type MoveOrderToRouteGroupResponse = OrderBatchMoveResponse & {
  // Legacy payload compatibility.
  updated?: OrderGroupMovedBundle[];
};

export const routeGroupApi = {
  getRouteGroupDetails: (
    planId: number | string,
    routeGroupId: number | string,
  ): Promise<ApiResult<RouteGroupDetailsResponse>> =>
    apiClient.request<RouteGroupDetailsResponse>({
      path: `/route_plans/${planId}/route-groups/${routeGroupId}`,
      method: "GET",
    }),
  createRouteGroup: (
    planId: number,
    payload: CreateRouteGroupPayload,
  ): Promise<ApiResult<CreateRouteGroupResponse>> =>
    apiClient.request<CreateRouteGroupResponse>({
      path: `/route_plans/${planId}/route-groups`,
      method: "POST",
      data: payload,
    }),
  deleteRouteGroup: (
    planId: number | string,
    routeGroupId: number | string,
  ): Promise<ApiResult<DeleteRouteGroupResponse>> =>
    apiClient.request<DeleteRouteGroupResponse>({
      path: `/route_plans/${planId}/route-groups/${routeGroupId}`,
      method: "DELETE",
    }),
  materializeRouteGroups: (
    planId: number | string,
    payload: MaterializeRouteGroupsPayload,
  ): Promise<ApiResult<RouteGroup[]>> =>
    apiClient.request<RouteGroup[]>({
      path: `/route_plans/${planId}/route-groups/materialize`,
      method: "POST",
      data: payload,
    }),
  moveOrderToRouteGroup: (
    planId: number,
    payload: MoveOrderToRouteGroupPayload,
  ): Promise<ApiResult<MoveOrderToRouteGroupResponse>> =>
    apiClient.request<MoveOrderToRouteGroupResponse>({
      path: `/order_assignments/plans/${planId}/batch`,
      method: "PATCH",
      data: payload,
    }),
};
