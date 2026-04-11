import { useCallback } from "react";

import { loadZoneGeometryQuery } from "@/features/zone/actions/loadZoneGeometry.query";
import {
  selectZoneByVersionAndId,
  useZoneStore,
} from "@/features/zone/store/zone.store";

export const useEnsureZoneGeometry = (
  versionId: number | null | undefined,
  zoneId: number | null | undefined,
) => {
  const zone = useZoneStore((state) =>
    selectZoneByVersionAndId(state, versionId, zoneId),
  );
  const markZoneGeometryLoading = useZoneStore(
    (state) => state.markZoneGeometryLoading,
  );
  const setZoneFullGeometry = useZoneStore((state) => state.setZoneFullGeometry);
  const setZoneGeometryError = useZoneStore(
    (state) => state.setZoneGeometryError,
  );

  const load = useCallback(async () => {
    if (typeof versionId !== "number" || typeof zoneId !== "number" || !zone) {
      return null;
    }

    if (zone.geometry_resolution === "full") {
      return zone.geometry_full;
    }

    if (zone.is_loading_geometry) {
      return zone.geometry_full ?? zone.geometry_simplified;
    }

    markZoneGeometryLoading(versionId, zoneId, true);

    try {
      const geometry = await loadZoneGeometryQuery(versionId, zoneId);
      setZoneFullGeometry(versionId, zoneId, geometry);
      return geometry;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load zone geometry.";
      setZoneGeometryError(versionId, zoneId, message);
      return zone.geometry_simplified;
    }
  }, [
    markZoneGeometryLoading,
    setZoneFullGeometry,
    setZoneGeometryError,
    versionId,
    zone,
    zoneId,
  ]);

  return { load };
};
