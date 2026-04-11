import type {
  GeoJSONPolygon,
  ZoneBBox,
  ZoneCentroid,
  ZoneDefinition,
  ZoneGeometryResolution,
  ZoneLite,
  ZoneState,
  ZoneTemplate,
  ZoneTemplateRef,
} from "@/features/zone/types";

const resolveCentroidFromDefinition = (
  zone: ZoneDefinition,
): ZoneCentroid | null => {
  if (
    typeof zone.centroid_lat !== "number" &&
    typeof zone.centroid_lng !== "number"
  ) {
    return null;
  }

  return {
    lat: zone.centroid_lat ?? null,
    lng: zone.centroid_lng ?? null,
  };
};

const resolveBBoxFromDefinition = (zone: ZoneDefinition): ZoneBBox | null => {
  if (
    typeof zone.max_lat !== "number" ||
    typeof zone.min_lat !== "number" ||
    typeof zone.max_lng !== "number" ||
    typeof zone.min_lng !== "number"
  ) {
    return null;
  }

  return {
    north: zone.max_lat,
    south: zone.min_lat,
    east: zone.max_lng,
    west: zone.min_lng,
  };
};

const resolveGeometryResolutionFromDefinition = (
  geometry: GeoJSONPolygon | null | undefined,
): ZoneGeometryResolution => (geometry ? "full" : "none");

const resolveTemplateRef = (
  template: ZoneTemplate | null | undefined,
): ZoneTemplateRef | null => {
  if (!template) return null;

  return {
    id: template.id,
    name: template.name ?? null,
    version: template.version ?? null,
    is_active: template.is_active,
  };
};

const nowIso = () => new Date().toISOString();

export const mapZoneDefinitionToZoneState = (
  zone: ZoneDefinition,
  existing: ZoneState | null = null,
): ZoneState | null => {
  if (typeof zone.id !== "number" || typeof zone.version_id !== "number") {
    return null;
  }

  const nextBBox = resolveBBoxFromDefinition(zone) ?? existing?.bbox ?? null;
  if (!nextBBox) {
    return null;
  }

  const nextGeometry = zone.geometry ?? null;
  const nextTemplate = zone.template ?? null;

  return {
    id: zone.id,
    version_id: zone.version_id,
    team_id: zone.team_id ?? existing?.team_id,
    city_key: zone.city_key ?? existing?.city_key ?? null,
    name: zone.name,
    zone_color: zone.zone_color ?? existing?.zone_color ?? null,
    zone_type: zone.zone_type ?? existing?.zone_type ?? null,
    is_active: zone.is_active ?? existing?.is_active ?? false,
    centroid: resolveCentroidFromDefinition(zone) ?? existing?.centroid ?? null,
    bbox: nextBBox,
    geometry_simplified:
      existing?.geometry_simplified ?? (nextGeometry ? nextGeometry : null),
    geometry_full: nextGeometry ?? existing?.geometry_full ?? null,
    geometry_resolution:
      nextGeometry != null
        ? "full"
        : existing?.geometry_resolution ??
          resolveGeometryResolutionFromDefinition(nextGeometry),
    template_ref: resolveTemplateRef(nextTemplate) ?? existing?.template_ref ?? null,
    template_full: nextTemplate ?? existing?.template_full ?? null,
    is_loading_geometry: existing?.is_loading_geometry ?? false,
    is_loading_template: existing?.is_loading_template ?? false,
    geometry_error: existing?.geometry_error ?? null,
    template_error: existing?.template_error ?? null,
    lastFetchedAt: nowIso(),
  };
};

export const mapZoneLiteToZoneState = (
  zone: ZoneLite,
  existing: ZoneState | null = null,
): ZoneState => {
  const nextGeometryResolution =
    existing?.geometry_resolution === "full"
      ? "full"
      : zone.geometry_resolution;

  return {
    id: zone.id,
    version_id: zone.version_id,
    team_id: zone.team_id ?? existing?.team_id,
    city_key: zone.city_key ?? existing?.city_key ?? null,
    name: zone.name,
    zone_color: zone.zone_color ?? existing?.zone_color ?? null,
    zone_type: zone.zone_type ?? existing?.zone_type ?? null,
    is_active: zone.is_active ?? existing?.is_active ?? false,
    centroid: zone.centroid ?? existing?.centroid ?? null,
    bbox: zone.bbox,
    geometry_simplified: zone.geometry_simplified ?? existing?.geometry_simplified ?? null,
    geometry_full: existing?.geometry_full ?? null,
    geometry_resolution: nextGeometryResolution,
    template_ref: zone.template_ref ?? existing?.template_ref ?? null,
    template_full: existing?.template_full ?? null,
    is_loading_geometry: existing?.is_loading_geometry ?? false,
    is_loading_template: existing?.is_loading_template ?? false,
    geometry_error: existing?.geometry_error ?? null,
    template_error: existing?.template_error ?? null,
    lastFetchedAt: existing?.lastFetchedAt ?? null,
  };
};

export const mapZoneStateToRenderableDefinition = (
  zone: ZoneState,
): ZoneDefinition => ({
  id: zone.id,
  version_id: zone.version_id,
  team_id: zone.team_id,
  city_key: zone.city_key,
  name: zone.name,
  zone_color: zone.zone_color ?? null,
  zone_type: zone.zone_type,
  centroid_lat: zone.centroid?.lat ?? null,
  centroid_lng: zone.centroid?.lng ?? null,
  min_lat: zone.bbox.south,
  max_lat: zone.bbox.north,
  min_lng: zone.bbox.west,
  max_lng: zone.bbox.east,
  geometry: zone.geometry_full ?? zone.geometry_simplified ?? null,
  is_active: zone.is_active,
  template: zone.template_full,
});
