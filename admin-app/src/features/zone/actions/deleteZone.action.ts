import { ApiError } from "@/lib/api/ApiClient";
import { zoneApi } from "@/features/zone/api/zone.api";
import { mapZoneStateToRenderableDefinition } from "@/features/zone/domain/zoneState.mapper";
import type { ZoneDefinition, ZoneState } from "@/features/zone/types";

export type DeleteZoneCommand = {
  versionId: number;
  zone: ZoneState & { id: number };
};

export type DeleteZoneDeps = {
  upsertZone: (zone: ZoneDefinition) => void;
  removeZoneById: (versionId: number, zoneId: number) => void;
  showMessage: (params: { status: number; message: string }) => void;
};

export async function deleteZoneAction(
  command: DeleteZoneCommand,
  deps: DeleteZoneDeps,
): Promise<boolean> {
  deps.removeZoneById(command.versionId, command.zone.id);

  try {
    await zoneApi.deleteZone(command.versionId, command.zone.id);
    return true;
  } catch (error: unknown) {
    deps.upsertZone(mapZoneStateToRenderableDefinition(command.zone));

    const isVersionActiveError =
      error instanceof ApiError && error.status === 410;

    const hasDerivedConstraint =
      error instanceof ApiError &&
      typeof error.payload?.code === "string" &&
      error.payload.code.includes("DERIVED");

    deps.showMessage({
      status: isVersionActiveError || hasDerivedConstraint ? 410 : 500,
      message: isVersionActiveError
        ? "This zone cannot be deleted because its version is active."
        : hasDerivedConstraint
          ? "This zone cannot be deleted because route groups derived from it still exist."
          : "Failed to delete zone. Please try again.",
    });

    return false;
  }
}
