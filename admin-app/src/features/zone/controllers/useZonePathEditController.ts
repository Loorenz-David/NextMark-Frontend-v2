import { useCallback } from "react";

import { useMessageHandler } from "@shared-message-handler";

import { updateZoneGeometryAction } from "@/features/zone/actions/updateZoneGeometry.action";
import { useEnsureZoneGeometry } from "@/features/zone/controllers/useEnsureZoneGeometry";
import {
  selectWorkingZoneVersion,
  useZoneVersionStore,
} from "@/features/zone/store/zoneVersion.store";
import {
  selectZoneByVersionAndId,
  selectZonePathEditSession,
  useZoneStore,
} from "@/features/zone/store/zone.store";

export const useZonePathEditController = (
  versionId: number | null | undefined,
  zoneId: number | null | undefined,
) => {
  const { showMessage } = useMessageHandler();
  const { load: ensureZoneGeometry } = useEnsureZoneGeometry(versionId, zoneId);
  const workingVersion = useZoneVersionStore(selectWorkingZoneVersion);
  const zone = useZoneStore((state) =>
    selectZoneByVersionAndId(state, versionId, zoneId),
  );
  const pathEditSession = useZoneStore(selectZonePathEditSession);
  const setIsZoneMode = useZoneStore((state) => state.setIsZoneMode);
  const setSelectedVersionId = useZoneVersionStore(
    (state) => state.setSelectedVersionId,
  );
  const setSelectedZoneId = useZoneStore((state) => state.setSelectedZoneId);
  const setDrawnGeometry = useZoneStore((state) => state.setDrawnGeometry);
  const setHoveredZoneId = useZoneStore((state) => state.setHoveredZoneId);
  const closeZoneDetailsPopover = useZoneStore(
    (state) => state.closeZoneDetailsPopover,
  );
  const startPathEditSession = useZoneStore(
    (state) => state.startPathEditSession,
  );
  const updatePathEditDraft = useZoneStore((state) => state.updatePathEditDraft);
  const setPathEditSaving = useZoneStore((state) => state.setPathEditSaving);
  const setPathEditError = useZoneStore((state) => state.setPathEditError);
  const completePathEditSession = useZoneStore(
    (state) => state.completePathEditSession,
  );
  const cancelPathEditSession = useZoneStore(
    (state) => state.cancelPathEditSession,
  );
  const upsertZone = useZoneStore((state) => state.upsertZone);

  const beginPathEdit = useCallback(async () => {
    if (typeof versionId !== "number" || typeof zoneId !== "number" || !zone) {
      return false;
    }

    if (workingVersion?.is_active) {
      showMessage({
        status: 410,
        message:
          "Zone boundaries cannot be edited on the active version. Create a new draft version to redraw zones.",
      });
      return false;
    }

    const fullGeometry = zone.geometry_full ?? (await ensureZoneGeometry());
    if (!fullGeometry) {
      showMessage({
        status: 400,
        message: "Unable to load zone shape for path editing.",
      });
      return false;
    }

    closeZoneDetailsPopover();
    setDrawnGeometry(null);
    setSelectedVersionId(versionId);
    setSelectedZoneId(zoneId, versionId);
    startPathEditSession({
      versionId,
      zoneId,
      originalGeometry: fullGeometry,
      draftGeometry: fullGeometry,
    });
    setIsZoneMode(true);
    return true;
  }, [
    closeZoneDetailsPopover,
    ensureZoneGeometry,
    setDrawnGeometry,
    setIsZoneMode,
    setSelectedVersionId,
    setSelectedZoneId,
    showMessage,
    startPathEditSession,
    versionId,
    workingVersion?.is_active,
    zone,
    zoneId,
  ]);

  const savePathEdit = useCallback(async () => {
    if (!pathEditSession || !zone || typeof zone.id !== "number") {
      return false;
    }

    setPathEditSaving(true);
    setPathEditError(null);

    const succeeded = await updateZoneGeometryAction(
      {
        versionId: pathEditSession.versionId,
        zone: zone as typeof zone & { id: number },
        geometry: pathEditSession.draftGeometry,
      },
      {
        upsertZone,
        showMessage,
      },
    );

    if (succeeded) {
      completePathEditSession(pathEditSession.draftGeometry);
      return true;
    }

    setPathEditError("Failed to update zone path. Please try again.");
    return false;
  }, [
    completePathEditSession,
    pathEditSession,
    setPathEditError,
    setPathEditSaving,
    showMessage,
    upsertZone,
    zone,
  ]);

  const cancelPathEdit = useCallback(() => {
    cancelPathEditSession();
    setDrawnGeometry(null);
    setHoveredZoneId(null);
    closeZoneDetailsPopover();
    setIsZoneMode(false);
  }, [
    cancelPathEditSession,
    closeZoneDetailsPopover,
    setDrawnGeometry,
    setHoveredZoneId,
    setIsZoneMode,
  ]);

  return {
    pathEditSession,
    beginPathEdit,
    updatePathEditDraft,
    savePathEdit,
    cancelPathEdit,
  };
};
