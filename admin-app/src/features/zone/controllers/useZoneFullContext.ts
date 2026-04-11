import { useCallback } from "react";

import {
  selectZoneByVersionAndId,
  useZoneStore,
} from "@/features/zone/store/zone.store";

import { useEnsureZoneGeometry } from "./useEnsureZoneGeometry";
import { useEnsureZoneTemplate } from "./useEnsureZoneTemplate";

export const useZoneFullContext = (
  versionId: number | null | undefined,
  zoneId: number | null | undefined,
) => {
  const zone = useZoneStore((state) =>
    selectZoneByVersionAndId(state, versionId, zoneId),
  );
  const { load: ensureGeometry } = useEnsureZoneGeometry(versionId, zoneId);
  const { load: ensureTemplate } = useEnsureZoneTemplate(versionId, zoneId);

  const getZoneFullContext = useCallback(async () => {
    await Promise.all([ensureGeometry(), ensureTemplate()]);
    return useZoneStore
      .getState()
      .zonesByVersionId?.[versionId ?? -1]?.[zoneId ?? -1] ?? zone;
  }, [ensureGeometry, ensureTemplate, versionId, zone, zoneId]);

  return { getZoneFullContext };
};
