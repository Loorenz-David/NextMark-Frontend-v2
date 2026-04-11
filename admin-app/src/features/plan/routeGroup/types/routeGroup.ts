export type LoadingScenarios = "isOptimizing";

type GeoJSONPosition = [number, number];
type GeoJSONLinearRing = GeoJSONPosition[];

export type GeoJSONPolygon = {
  type: "Polygon" | "MultiPolygon";
  coordinates: GeoJSONLinearRing[] | GeoJSONLinearRing[][];
};

export type ZoneTemplateConfig = {
  vehicle_type_id?: number | null;
  default_service_time_seconds?: number | null;
  depot_id?: number | null;
  max_stops?: number | null;
  constraints?: Record<string, unknown> | null;
};

export type RouteGroup = {
  id?: number;
  client_id: string;
  total_orders?: number | null;
  total_item_count?: number | null;
  item_type_counts?: Record<string, number> | null;
  total_volume_cm3?: number | null;
  total_weight_grams?: number | null;
  order_state_counts?: Record<string, number> | null;
  state_id?: number | null;
  zone_id?: number | null;
  zone_snapshot?: {
    name?: string | null;
    geometry?: GeoJSONPolygon | null;
  } | null;
  template_snapshot?: ZoneTemplateConfig | null;
  is_optimized?: boolean;
  route_plan_id?: number | null;
  updated_at?: string | null;
  route_solutions_ids?: number[];
  is_loading?: LoadingScenarios;
  optimization_started_at?: number | null;
};

export type RouteGroupMap = {
  byClientId: Record<string, RouteGroup>;
  allIds: string[];
};

export type RouteGroupInput = Omit<RouteGroup, "id">;
