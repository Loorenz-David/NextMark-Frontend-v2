import type {
  ZoneRouteEndStrategy,
  ZoneVehicleCapability,
} from "../domain/zoneEnums";

export type {
  ZoneRouteEndStrategy,
  ZoneVehicleCapability,
} from "../domain/zoneEnums";

type GeoJSONPosition = [number, number];
type GeoJSONLinearRing = GeoJSONPosition[];

export type GeoJSONPolygon = {
  type: "Polygon" | "MultiPolygon";
  coordinates: GeoJSONLinearRing[] | GeoJSONLinearRing[][];
};

export type ZoneTemplateConfig = {
  default_facility_id?: number | null;
  max_orders_per_route?: number | null;
  max_vehicles?: number | null;
  operating_window_start?: string | null;
  operating_window_end?: string | null;
  eta_tolerance_seconds?: number | null;
  vehicle_capabilities_required?: ZoneVehicleCapability[] | null;
  preferred_vehicle_ids?: number[] | null;
  default_route_end_strategy?: ZoneRouteEndStrategy | null;
  meta?: Record<string, unknown> | null;
};

export type ZoneTemplate = {
  id?: number;
  team_id?: number;
  zone_id?: number;
  name?: string | null;
  version?: number | null;
  is_active?: boolean;
  default_facility_id?: number | null;
  max_orders_per_route?: number | null;
  max_vehicles?: number | null;
  operating_window_start?: string | null;
  operating_window_end?: string | null;
  eta_tolerance_seconds?: number | null;
  vehicle_capabilities_required?: ZoneVehicleCapability[] | null;
  preferred_vehicle_ids?: number[] | null;
  default_route_end_strategy?: ZoneRouteEndStrategy | null;
  meta?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ZoneTemplateRef = {
  id?: number;
  name?: string | null;
  version?: number | null;
  is_active?: boolean;
};

export type ZoneCentroid = {
  lat: number | null;
  lng: number | null;
};

export type ZoneBBox = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type ZoneBootstrapBBox = {
  max_lat: number;
  min_lat: number;
  max_lng: number;
  min_lng: number;
};

export type ZoneGeometryResolution = "none" | "simplified" | "full";

export type ZoneDefinition = {
  id?: number;
  client_id?: string | null;
  team_id?: number;
  version_id?: number;
  city_key?: string | null;
  name: string;
  zone_color?: string | null;
  zone_type?: "bootstrap" | "system" | "user" | null;
  centroid_lat?: number | null;
  centroid_lng?: number | null;
  min_lat?: number | null;
  max_lat?: number | null;
  min_lng?: number | null;
  max_lng?: number | null;
  geometry?: GeoJSONPolygon | null;
  is_active?: boolean;
  template?: ZoneTemplate | null;
};

export type ZoneLite = {
  id: number;
  client_id?: string | null;
  version_id: number;
  team_id?: number;
  city_key?: string | null;
  name: string;
  zone_color?: string | null;
  zone_type?: "bootstrap" | "system" | "user" | null;
  centroid: ZoneCentroid | null;
  bbox: ZoneBBox;
  geometry_simplified?: GeoJSONPolygon | null;
  geometry_resolution: ZoneGeometryResolution;
  template_ref?: ZoneTemplateRef | null;
  is_active?: boolean;
};

export type ZoneState = {
  id: number;
  client_id?: string | null;
  version_id: number;
  team_id?: number;
  city_key?: string | null;
  name: string;
  zone_color?: string | null;
  zone_type?: "bootstrap" | "system" | "user" | null;
  is_active: boolean;
  centroid: ZoneCentroid | null;
  bbox: ZoneBBox;
  geometry_simplified: GeoJSONPolygon | null;
  geometry_full: GeoJSONPolygon | null;
  geometry_resolution: ZoneGeometryResolution;
  template_ref: ZoneTemplateRef | null;
  template_full: ZoneTemplate | null;
  is_loading_geometry: boolean;
  is_loading_template: boolean;
  geometry_error: string | null;
  template_error: string | null;
  lastFetchedAt?: string | null;
};

export type ZonesContext = {
  city_key: string;
  selected_version: {
    id: number;
    is_active?: boolean;
    version_number?: number;
  } | null;
  zones: Array<{
    id: number;
    client_id?: string | null;
    city_key?: string | null;
    name: string;
    zone_color?: string | null;
    zone_type?: "bootstrap" | "system" | "user" | null;
    centroid: ZoneCentroid | null;
    bbox: ZoneBootstrapBBox;
    geometry_resolution: ZoneGeometryResolution;
    geometry_simplified?: GeoJSONPolygon | null;
    has_geometry?: boolean;
    is_active?: boolean;
    template_ref?: ZoneTemplateRef | null;
  }>;
};

export type ZoneVersion = {
  id?: number;
  team_id?: number;
  city_key: string;
  name?: string;
  version?: number | null;
  version_number?: number;
  is_active?: boolean;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};
