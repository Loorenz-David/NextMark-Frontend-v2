import { zoneApi } from "@/features/zone/api/zone.api";
import type {
  GeoJSONPolygon,
  ZoneDefinition,
  ZoneTemplate,
  ZoneTemplateConfig,
} from "@/features/zone/types";

export type CreateZoneCommand = {
  versionId: number;
  name: string;
  zoneColor?: string | null;
  geometry: GeoJSONPolygon;
  templatePayload: ({ name: string } & ZoneTemplateConfig) | null;
};

export type CreateZoneDeps = {
  upsertZone: (zone: ZoneDefinition) => void;
  removeZoneOptimistic: (versionId: number, zoneId: number) => void;
  showMessage: (params: { status: number; message: string }) => void;
};

export async function createZoneAction(
  command: CreateZoneCommand,
  deps: CreateZoneDeps,
): Promise<ZoneDefinition | null> {
  const optimisticId = Date.now() * -1;

  const centroid = computeCentroid(command.geometry);
  const bbox = computeBBox(command.geometry);

  const optimisticZone: ZoneDefinition = {
    id: optimisticId,
    version_id: command.versionId,
    name: command.name,
    zone_color: command.zoneColor ?? null,
    geometry: command.geometry,
    zone_type: "user",
    centroid_lat: centroid?.lat ?? null,
    centroid_lng: centroid?.lng ?? null,
    min_lat: bbox?.south ?? null,
    max_lat: bbox?.north ?? null,
    min_lng: bbox?.west ?? null,
    max_lng: bbox?.east ?? null,
  };

  deps.upsertZone(optimisticZone);

  try {
    const response = await zoneApi.createZone(command.versionId, {
      name: command.name,
      zone_color: command.zoneColor ?? null,
      zone_type: "user",
      geometry: command.geometry,
      centroid_lat: centroid?.lat ?? null,
      centroid_lng: centroid?.lng ?? null,
      min_lat: bbox?.south ?? null,
      max_lat: bbox?.north ?? null,
      min_lng: bbox?.west ?? null,
      max_lng: bbox?.east ?? null,
    });

    const createdZone = response.data;
    if (!createdZone) {
      throw new Error("No zone returned from server");
    }

    deps.removeZoneOptimistic(command.versionId, optimisticId);
    deps.upsertZone(createdZone);

    if (command.templatePayload && typeof createdZone.id === "number") {
      const templateResponse = await zoneApi.upsertZoneTemplate(
        command.versionId,
        createdZone.id,
        command.templatePayload,
      );

      const nextTemplate = templateResponse.data ?? null;
      deps.upsertZone({
        ...createdZone,
        template: nextTemplate as ZoneTemplate | null,
      });
    }

    return createdZone;
  } catch {
    deps.removeZoneOptimistic(command.versionId, optimisticId);
    deps.showMessage({
      status: 500,
      message: "Failed to create zone. Please try again.",
    });
    return null;
  }
}

function computeCentroid(
  geometry: GeoJSONPolygon,
): { lat: number; lng: number } | null {
  if (geometry.type !== "Polygon") {
    return null;
  }

  const ring = geometry.coordinates[0];
  if (!Array.isArray(ring) || ring.length === 0) return null;

  let lngSum = 0;
  let latSum = 0;
  const points = ring.filter(
    (point): point is [number, number] =>
      Array.isArray(point) &&
      point.length >= 2 &&
      Number.isFinite(point[0]) &&
      Number.isFinite(point[1]),
  );

  if (points.length === 0) {
    return null;
  }

  points.forEach((point) => {
    lngSum += point[0];
    latSum += point[1];
  });

  return { lat: latSum / points.length, lng: lngSum / points.length };
}

function computeBBox(geometry: GeoJSONPolygon) {
  const rings =
    geometry.type === "Polygon"
      ? [geometry.coordinates[0]]
      : geometry.coordinates.flat();

  const points = rings
    .flat()
    .filter(
      (point): point is [number, number] =>
        Array.isArray(point) &&
        point.length >= 2 &&
        Number.isFinite(point[0]) &&
        Number.isFinite(point[1]),
    );

  if (points.length === 0) {
    return null;
  }

  const lngValues = points.map(([lng]) => lng);
  const latValues = points.map(([, lat]) => lat);

  return {
    north: Math.max(...latValues),
    south: Math.min(...latValues),
    east: Math.max(...lngValues),
    west: Math.min(...lngValues),
  };
}
