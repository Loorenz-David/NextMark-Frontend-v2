import { useEffect, useRef } from "react";

import { zoneApi } from "../api/zone.api";
import { useZonesByVersion } from "./useZoneSelectors";
import { useZoneStore } from "../store/zone.store";

export const useHydrateSelectedZones = ({
  versionId,
  selectedZoneIds,
}: {
  versionId: number | null | undefined;
  selectedZoneIds: Array<number | string>;
}) => {
  const zones = useZonesByVersion(versionId);
  const upsertZone = useZoneStore((state) => state.upsertZone);
  const requestedVersionIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (typeof versionId !== "number" || selectedZoneIds.length === 0) {
      return;
    }

    const zoneKeySet = new Set(
      zones.flatMap((zone) => [String(zone.id ?? ""), String(zone.client_id ?? "")]),
    );

    const hasMissingSelectedZone = selectedZoneIds.some((id) => {
      const key = String(id);
      return key.length > 0 && !zoneKeySet.has(key);
    });

    if (!hasMissingSelectedZone || requestedVersionIdsRef.current.has(versionId)) {
      return;
    }

    requestedVersionIdsRef.current.add(versionId);

    let cancelled = false;

    zoneApi.fetchZonesForVersion(versionId).then((response) => {
      if (cancelled) {
        return;
      }

      const fetchedZones = Array.isArray(response.data) ? response.data : [];
      fetchedZones.forEach((zone) => {
        upsertZone(zone);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [selectedZoneIds, upsertZone, versionId, zones]);
};
