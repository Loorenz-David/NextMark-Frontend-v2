import { zoneApi } from "@/features/zone/api/zone.api";
import type { GeoJSONPolygon } from "@/features/zone/types";

export const loadZoneGeometryQuery = async (
  versionId: number,
  zoneId: number,
): Promise<GeoJSONPolygon | null> => {
  const response = await zoneApi.fetchZoneGeometry(versionId, zoneId);
  const payload = response.data;

  if (!payload) {
    return null;
  }

  if ("type" in payload && "coordinates" in payload) {
    return payload as GeoJSONPolygon;
  }

  if (
    typeof payload === "object" &&
    payload != null &&
    "geometry" in payload &&
    payload.geometry &&
    typeof payload.geometry === "object"
  ) {
    return payload.geometry as GeoJSONPolygon;
  }

  return null;
};
