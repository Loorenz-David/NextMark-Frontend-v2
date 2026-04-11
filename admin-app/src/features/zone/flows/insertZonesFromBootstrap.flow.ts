import { useZoneStore } from "@/features/zone/store/zone.store";
import { useZoneVersionStore } from "@/features/zone/store/zoneVersion.store";
import type { ZoneLite, ZonesContext } from "@/features/zone/types";

export const insertZonesFromBootstrap = (zonesContext: ZonesContext) => {
  const zoneStore = useZoneStore.getState();
  const zoneVersionStore = useZoneVersionStore.getState();
  const versionId = zonesContext?.selected_version?.id;
  if (
    typeof versionId !== "number" ||
    !Array.isArray(zonesContext.zones)
  ) {
    return;
  }

  const zoneLites: ZoneLite[] = zonesContext.zones.map((zone) => ({
    id: zone.id,
    version_id: versionId,
    name: zone.name,
    zone_type: zone.zone_type ?? null,
    centroid: zone.centroid ?? null,
    bbox: {
      north: zone.bbox.max_lat,
      south: zone.bbox.min_lat,
      east: zone.bbox.max_lng,
      west: zone.bbox.min_lng,
    },
    geometry_simplified: zone.geometry_simplified ?? null,
    geometry_resolution: zone.geometry_resolution,
    template_ref: zone.template_ref ?? null,
    is_active: zone.is_active ?? false,
  }));

  zoneVersionStore.setVersions([
    {
      id: versionId,
      city_key: zonesContext.city_key,
      version_number: zonesContext.selected_version?.version_number,
      is_active: zonesContext.selected_version?.is_active,
    },
  ]);
  zoneVersionStore.setSelectedVersionId(versionId);
  zoneStore.setVersions([
    {
      id: versionId,
      city_key: zonesContext.city_key,
      version_number: zonesContext.selected_version?.version_number,
      is_active: zonesContext.selected_version?.is_active,
    },
  ]);
  zoneStore.setSelectedVersionId(versionId);
  zoneStore.replaceZoneLitesForVersion(versionId, zoneLites);
};
