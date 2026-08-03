import type { RouteGroup } from "@/features/plan/routeGroup/types/routeGroup";
import type { ServiceTime } from "@/features/plan/routeGroup/types/serviceTime";
import type { address } from "@/types/address";

/**
 * The planning domain a route plan belongs to. Shares its value space with an
 * order's `order_plan_objective`: an order assigned to a plan adopts the plan's
 * type, which is how the backend keeps the two in sync.
 */
export type RoutePlanObjective =
  | "local_delivery"
  | "international_shipping"
  | "store_pickup";

export type PlanDateStrategy = "single" | "range";

export type DeliveryPlan = {
  id?: number;
  client_id: string;
  label: string;
  /** Set at creation and immutable afterwards. Absent on plans served before the backend added it. */
  plan_type?: RoutePlanObjective | null;
  date_strategy?: PlanDateStrategy | null;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  orders_ids?: number[];
  state_id?: number | null;
  total_orders?: number | null;
  total_items?: number | null;
  item_type_counts?: Record<string, number> | null;
  total_volume?: number | null;
  total_weight?: number | null;
  route_groups_count?: number | null;
  route_groups?: RoutePlanRouteGroupSummary[];
};

export type DeliveryPlanMap = {
  byClientId: Record<string, DeliveryPlan>;
  allIds: string[];
};

export type DeliveryPlanFields = {
  client_id: string;
  label: string;
  start_date?: string | null;
  end_date?: string | null;
  state_id?: number | null;
  total_orders?: number | null;
  total_items?: number | null;
  item_type_counts?: Record<string, number> | null;
  total_volume?: number | null;
  total_weight?: number | null;
};

export type RouteGroupDefaults = {
  route_solution?: {
    start_location?: address | null;
    end_location?: address | null;
    set_start_time?: string | null;
    set_end_time?: string | null;
    stops_service_time?: ServiceTime | null;
    route_end_strategy?:
      | "round_trip"
      | "custom_end_address"
      | "end_at_last_stop";
    driver_id?: number | null;
    vehicle_id?: number | null;
    eta_tolerance_seconds?: number | null;
    eta_message_tolerance?: number | null;
  };
};

export type PlanTypeDefaults = {
  route_group_defaults?: RouteGroupDefaults;
};
export type RouteGroupPlanTypeDefaults = RouteGroupDefaults;

/** Fields every plan create payload shares, whatever the destination endpoint. */
export type PlanCreateShellPayload = {
  client_id?: string;
  label: string;
  date_strategy?: PlanDateStrategy;
  start_date: string;
  end_date?: string | null;
  order_ids?: number[];
};

/**
 * `POST /route_plans/`. Zones and route-group defaults are route-operations
 * concepts and are rejected by the container-plan endpoints.
 */
export type LocalDeliveryPlanCreatePayload = PlanCreateShellPayload & {
  zone_ids?: number[];
  route_group_defaults?: RouteGroupDefaults;
};

/**
 * `POST /international_shipping_plans/` and `POST /store_pickup_plans/`.
 * Their domain-specific fields (carrier_name, pickup_location, assigned_user_id)
 * are optional server-side and deliberately not sent by the frontend yet.
 *
 * Neither endpoint accepts `plan_type` (implied by the route) or `state_id`
 * (new plans always start OPEN).
 */
export type ContainerPlanCreatePayload = PlanCreateShellPayload;

export type PlanUpdateFields = Partial<
  DeliveryPlanFields & { order_ids?: number[] }
>;

export type ClientIdMap = Record<string, number> & {
  ids_without_match?: number[];
};

export type RoutePlanRouteGroupSummary = {
  id: number;
  name: string | null;
  zone_id: number | null;
  total_orders: number | null;
  state: {
    id: number;
    name: string;
  } | null;
};

/**
 * `POST /route_plans/` keys the created plan as `delivery_plan`; the container
 * endpoints key it as `route_plan`. Both shapes are normalized by
 * `normalizePlanCreateBundle` so callers never branch on the key.
 */
export type PlanCreateResultBundle = {
  delivery_plan?: DeliveryPlan;
  route_plan?: DeliveryPlan;
  route_groups?: RouteGroup[];
};

export type PlanCreateResponse = {
  created: PlanCreateResultBundle[];
};
