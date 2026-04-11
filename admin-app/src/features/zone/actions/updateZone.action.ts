import { ApiError } from "@/lib/api/ApiClient";
import { zoneApi } from "@/features/zone/api/zone.api";
import { mapZoneStateToRenderableDefinition } from "@/features/zone/domain/zoneState.mapper";
import type {
  ZoneDefinition,
  ZoneState,
  ZoneTemplateConfig,
} from "@/features/zone/types";

export type UpdateZoneCommand = {
  versionId: number;
  zone: ZoneState & { id: number };
  name: string;
  zoneColor?: string | null;
  templatePayload: ({ name: string } & ZoneTemplateConfig) | null;
};

export type UpdateZoneDeps = {
  upsertZone: (zone: ZoneDefinition) => void;
  showMessage: (params: { status: number; message: string }) => void;
};

export async function updateZoneAction(
  command: UpdateZoneCommand,
  deps: UpdateZoneDeps,
): Promise<boolean> {
  const optimisticZone: ZoneDefinition = {
    id: command.zone.id,
    version_id: command.zone.version_id,
    team_id: command.zone.team_id,
    name: command.name,
    zone_color: command.zoneColor ?? null,
    zone_type: command.zone.zone_type,
    centroid_lat: command.zone.centroid?.lat ?? null,
    centroid_lng: command.zone.centroid?.lng ?? null,
    min_lat: command.zone.bbox.south,
    max_lat: command.zone.bbox.north,
    min_lng: command.zone.bbox.west,
    max_lng: command.zone.bbox.east,
    geometry: command.zone.geometry_full ?? command.zone.geometry_simplified,
    is_active: command.zone.is_active,
    template: command.templatePayload
      ? {
          ...(command.zone.template_full ?? {}),
          zone_id: command.zone.id,
          ...command.templatePayload,
        }
      : (command.zone.template_full ?? null),
  };

  deps.upsertZone(optimisticZone);

  try {
    if (command.name !== command.zone.name || command.zoneColor !== (command.zone.zone_color ?? null)) {
      const patchResponse = await zoneApi.updateZoneName(
        command.versionId,
        command.zone.id,
        {
          name: command.name,
          zone_color: command.zoneColor ?? null,
        },
      );
      if (patchResponse.data) {
        deps.upsertZone({ ...optimisticZone, ...patchResponse.data });
      }
    }

    if (command.templatePayload) {
      const templateResponse = await zoneApi.upsertZoneTemplate(
        command.versionId,
        command.zone.id,
        command.templatePayload,
      );
      if (templateResponse.data) {
        deps.upsertZone({ ...optimisticZone, template: templateResponse.data });
      }
    }

    return true;
  } catch (error: unknown) {
    deps.upsertZone(mapZoneStateToRenderableDefinition(command.zone));

    const isVersionActiveError =
      error instanceof ApiError && error.status === 410;

    deps.showMessage({
      status: isVersionActiveError ? 410 : 500,
      message: isVersionActiveError
        ? "This zone cannot be edited because its version is active."
        : "Failed to update zone. Please try again.",
    });

    return false;
  }
}
