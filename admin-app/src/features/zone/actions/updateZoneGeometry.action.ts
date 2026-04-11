import { ApiError } from "@/lib/api/ApiClient";
import { zoneApi } from "@/features/zone/api/zone.api";
import { mapZoneStateToRenderableDefinition } from "@/features/zone/domain/zoneState.mapper";
import type { GeoJSONPolygon, ZoneDefinition, ZoneState } from "@/features/zone/types";

const extractBoundsFromGeometry = (geometry: GeoJSONPolygon) => {
  const rings: Array<[number, number][]> = [];

  if (geometry.type === "MultiPolygon") {
    (geometry.coordinates as Array<Array<[number, number][]>>).forEach(
      (polygon) => {
        polygon.forEach((ring) => {
          rings.push(ring);
        });
      },
    );
  } else {
    (geometry.coordinates as Array<[number, number][]>).forEach((ring) => {
      rings.push(ring);
    });
  }

  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;
  let minLng = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;

  rings.forEach((ring) => {
    ring.forEach((point) => {
      const lng = Number(point[0]);
      const lat = Number(point[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return;
      }

      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });
  });

  if (
    !Number.isFinite(minLat) ||
    !Number.isFinite(maxLat) ||
    !Number.isFinite(minLng) ||
    !Number.isFinite(maxLng)
  ) {
    return null;
  }

  return {
    min_lat: minLat,
    max_lat: maxLat,
    min_lng: minLng,
    max_lng: maxLng,
    centroid_lat: (minLat + maxLat) / 2,
    centroid_lng: (minLng + maxLng) / 2,
  };
};

export type UpdateZoneGeometryCommand = {
  versionId: number;
  zone: ZoneState & { id: number };
  geometry: GeoJSONPolygon;
};

export type UpdateZoneGeometryDeps = {
  upsertZone: (zone: ZoneDefinition) => void;
  showMessage: (params: { status: number; message: string }) => void;
};

export async function updateZoneGeometryAction(
  command: UpdateZoneGeometryCommand,
  deps: UpdateZoneGeometryDeps,
): Promise<boolean> {
  const geometryMetrics = extractBoundsFromGeometry(command.geometry);
  if (!geometryMetrics) {
    deps.showMessage({
      status: 400,
      message: "Unable to derive geometry bounds for this zone.",
    });
    return false;
  }

  const optimisticZone: ZoneDefinition = {
    ...mapZoneStateToRenderableDefinition(command.zone),
    geometry: command.geometry,
    ...geometryMetrics,
  };

  deps.upsertZone(optimisticZone);

  try {
    const response = await zoneApi.updateZoneGeometry(
      command.versionId,
      command.zone.id,
      {
        geometry: command.geometry,
        ...geometryMetrics,
      },
    );

    if (response.data) {
      deps.upsertZone({ ...optimisticZone, ...response.data });
    }

    return true;
  } catch (error: unknown) {
    deps.upsertZone(mapZoneStateToRenderableDefinition(command.zone));

    const isVersionActiveError =
      error instanceof ApiError && error.status === 410;

    deps.showMessage({
      status: isVersionActiveError ? 410 : 500,
      message: isVersionActiveError
        ? error.message
        : "Failed to update zone path. Please try again.",
    });

    return false;
  }
}
