import { useEffect } from "react";

import { useMapManager } from "@/shared/resource-manager/useResourceManager";

import type { ZoneState } from "@/features/zone/types";

type ZoneMapLayerProps = {
  zones: ZoneState[];
  selectedZoneId?: number | null;
};

export const ZoneMapLayer = ({
  zones,
  selectedZoneId = null,
}: ZoneMapLayerProps) => {
  const mapManager = useMapManager();

  useEffect(() => {
    const selectedZone = zones.find((zone) => zone.id === selectedZoneId);
    const fallbackZone = zones[0];
    const zoneGeometry =
      (selectedZone ?? fallbackZone)?.geometry_full ??
      (selectedZone ?? fallbackZone)?.geometry_simplified ??
      null;

    mapManager.setZonePolygonOverlay(zoneGeometry);

    return () => {
      mapManager.clearZonePolygonOverlay();
    };
  }, [mapManager, selectedZoneId, zones]);

  return null;
};
