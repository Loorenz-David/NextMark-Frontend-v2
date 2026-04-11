import { zoneApi } from "@/features/zone/api/zone.api";
import type { ZoneTemplate } from "@/features/zone/types";

export const loadZoneTemplateQuery = async (
  versionId: number,
  zoneId: number,
): Promise<ZoneTemplate | null> => {
  const response = await zoneApi.fetchZoneTemplate(versionId, zoneId);
  return response.data ?? null;
};
