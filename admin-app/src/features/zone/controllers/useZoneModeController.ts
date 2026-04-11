import { useCallback, useEffect } from "react";

import { useMessageHandler } from "@shared-message-handler";

import { sessionLocationService } from "@/app/services/sessionLocation.service";
import { zoneApi } from "@/features/zone/api/zone.api";
import {
  selectWorkingZoneVersion,
  selectWorkingZoneVersionId,
  useZoneVersionStore,
} from "@/features/zone/store/zoneVersion.store";
import {
  selectIsLoadingZonesForVersion,
  selectZoneLoadErrorForVersion,
  selectZoneLoadStatusForVersion,
  selectZonePathEditSession,
  selectZonesByVersion,
  useZoneStore,
} from "@/features/zone/store/zone.store";
import type { GeoJSONPolygon } from "@/features/zone/types";
import {
  useMapManager,
  usePopupManager,
} from "@/shared/resource-manager/useResourceManager";

export function useZoneModeController() {
  const mapManager = useMapManager();
  const popupManager = usePopupManager();
  const { showMessage } = useMessageHandler();

  const isZoneMode = useZoneStore((state) => state.isZoneMode);
  const versions = useZoneVersionStore((state) => state.versions);
  const drawnGeometry = useZoneStore((state) => state.drawnGeometry);
  const pathEditSession = useZoneStore(selectZonePathEditSession);
  const hoveredZoneId = useZoneStore((state) => state.hoveredZoneId);
  const isLoadingVersions = useZoneVersionStore((state) => state.isLoadingVersions);
  const ensureFirstVersionStatus = useZoneVersionStore(
    (state) => state.ensureFirstVersionStatus,
  );
  const ensureFirstVersionError = useZoneVersionStore(
    (state) => state.ensureFirstVersionError,
  );
  const setIsZoneMode = useZoneStore((state) => state.setIsZoneMode);
  const setDrawnGeometry = useZoneStore((state) => state.setDrawnGeometry);
  const updatePathEditDraft = useZoneStore((state) => state.updatePathEditDraft);
  const cancelPathEditSession = useZoneStore(
    (state) => state.cancelPathEditSession,
  );
  const setHoveredZoneId = useZoneStore((state) => state.setHoveredZoneId);
  const closeZoneDetailsPopover = useZoneStore(
    (state) => state.closeZoneDetailsPopover,
  );
  const replaceZonesForVersion = useZoneStore((state) => state.replaceZonesForVersion);
  const setLoadingZones = useZoneStore((state) => state.setLoadingZones);
  const setVersions = useZoneVersionStore((state) => state.setVersions);
  const setSelectedVersionId = useZoneVersionStore(
    (state) => state.setSelectedVersionId,
  );
  const setLoadingVersions = useZoneVersionStore((state) => state.setLoadingVersions);
  const setZoneLoadStatus = useZoneStore((state) => state.setZoneLoadStatus);
  const setEnsureFirstVersionStatus = useZoneVersionStore(
    (state) => state.setEnsureFirstVersionStatus,
  );
  const resetEnsureFirstVersionState = useZoneVersionStore(
    (state) => state.resetEnsureFirstVersionState,
  );
  const upsertZone = useZoneStore((state) => state.upsertZone);
  const removeZoneOptimistic = useZoneStore((state) => state.removeZoneOptimistic);
  const workingVersion = useZoneVersionStore(selectWorkingZoneVersion);
  const workingVersionId = useZoneVersionStore(selectWorkingZoneVersionId);
  const isLoadingZones = useZoneStore((state) =>
    selectIsLoadingZonesForVersion(state, workingVersion?.id),
  );
  const zoneLoadStatus = useZoneStore((state) =>
    selectZoneLoadStatusForVersion(state, workingVersion?.id),
  );
  const zoneLoadError = useZoneStore((state) =>
    selectZoneLoadErrorForVersion(state, workingVersion?.id),
  );
  const zonesForWorkingVersionCount = useZoneStore((state) =>
    selectZonesByVersion(state, workingVersion?.id).length,
  );

  // Bootstrap a working zone version directly for zone mode.
  // The map overlay only needs one editable version to work, so we use the
  // backend convenience endpoint instead of depending on the full version list.
  useEffect(() => {
    if (!isZoneMode) return;
    if (versions.length > 0) return;
    if (isLoadingVersions) return;
    if (ensureFirstVersionStatus === "retryable_failure") return;
    if (ensureFirstVersionStatus === "success") return;

    const zoneCityKey = sessionLocationService.getZoneCityKey();
    if (!zoneCityKey) {
      setEnsureFirstVersionStatus(
        "retryable_failure",
        "Missing session city. Complete your account city first.",
      );
      showMessage({
        status: 400,
        message: "Missing session city. Complete your account city first.",
      });
      return;
    }

    setLoadingVersions(true);
    setEnsureFirstVersionStatus("loading", null);

    zoneApi
      .ensureFirstZoneVersion({
        city_key: zoneCityKey,
      })
      .then((response) => {
        const ensuredVersion = response.data ?? null;

        setVersions(ensuredVersion ? [ensuredVersion] : []);
        setSelectedVersionId(
          typeof ensuredVersion?.id === "number" ? ensuredVersion.id : null,
        );
        setEnsureFirstVersionStatus("success", null);
      })
      .catch((error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load zone versions.";
        setEnsureFirstVersionStatus("retryable_failure", message);
        showMessage({ status: 500, message });
      })
      .finally(() => {
        setLoadingVersions(false);
      });
  }, [
    isZoneMode,
    isLoadingVersions,
    versions.length,
    ensureFirstVersionStatus,
    setSelectedVersionId,
    setEnsureFirstVersionStatus,
    setLoadingVersions,
    setVersions,
    showMessage,
  ]);

  useEffect(() => {
    if (!isZoneMode) return;
    if (typeof workingVersion?.id !== "number") return;
    const versionId = workingVersion.id;

    if (zonesForWorkingVersionCount > 0) return;
    if (isLoadingZones) return;
    if (zoneLoadStatus === "success") return;
    if (zoneLoadStatus === "retryable_failure") return;

    setLoadingZones(versionId, true);
    setZoneLoadStatus(versionId, "loading", null);

    zoneApi
      .fetchZonesForVersion(versionId)
      .then((response) => {
        replaceZonesForVersion(
          versionId,
          Array.isArray(response.data) ? response.data : [],
        );
        setZoneLoadStatus(versionId, "success", null);
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Failed to load zones.";
        setZoneLoadStatus(versionId, "retryable_failure", message);
        showMessage({ status: 500, message });
      })
      .finally(() => {
        setLoadingZones(versionId, false);
      });
  }, [
    isZoneMode,
    isLoadingZones,
    replaceZonesForVersion,
    setLoadingZones,
    setZoneLoadStatus,
    workingVersion?.id,
    showMessage,
    zoneLoadStatus,
    zonesForWorkingVersionCount,
  ]);

  useEffect(() => {
    if (!isZoneMode || typeof workingVersionId !== "number") {
      mapManager.disableZoneCapture();
      mapManager.disableZonePathEdit();
      setDrawnGeometry(null);
      return;
    }

    if (pathEditSession) {
      mapManager.disableZoneCapture();
      mapManager.enableZonePathEdit(pathEditSession.draftGeometry, {
        onGeometryChange: updatePathEditDraft,
      });

      return () => {
        mapManager.disableZonePathEdit();
      };
    }

    mapManager.enableZoneCapture((geometry: GeoJSONPolygon) => {
      setDrawnGeometry(geometry);
    });

    return () => {
      mapManager.disableZoneCapture();
      mapManager.disableZonePathEdit();
    };
  }, [
    isZoneMode,
    mapManager,
    pathEditSession,
    setDrawnGeometry,
    updatePathEditDraft,
    workingVersionId,
  ]);

  const enterZoneMode = useCallback(() => {
    resetEnsureFirstVersionState();
    setIsZoneMode(true);
  }, [resetEnsureFirstVersionState, setIsZoneMode]);

  const exitZoneMode = useCallback(() => {
    setIsZoneMode(false);
    setDrawnGeometry(null);
    cancelPathEditSession();
    setHoveredZoneId(null);
    closeZoneDetailsPopover();
  }, [
    cancelPathEditSession,
    closeZoneDetailsPopover,
    setDrawnGeometry,
    setHoveredZoneId,
    setIsZoneMode,
  ]);

  const discardShape = useCallback(() => {
    setDrawnGeometry(null);
  }, [setDrawnGeometry]);

  const openCreateForm = useCallback(() => {
    if (!drawnGeometry || typeof workingVersion?.id !== "number") return;

    popupManager.open({
      key: "zone.form",
      payload: {
        mode: "create",
        geometry: drawnGeometry,
        versionId: workingVersion.id,
      },
    });
  }, [drawnGeometry, popupManager, workingVersion?.id]);

  return {
    isZoneMode,
    drawnGeometry,
    pathEditSession,
    hoveredZoneId,
    isLoadingZones,
    zoneLoadStatus,
    zoneLoadError,
    ensureFirstVersionStatus,
    ensureFirstVersionError,
    activeVersion: workingVersion,
    activeVersionId: workingVersionId,
    enterZoneMode,
    exitZoneMode,
    discardShape,
    openCreateForm,
    retryEnsureFirstVersion: resetEnsureFirstVersionState,
    upsertZone,
    removeZoneOptimistic,
  };
}
