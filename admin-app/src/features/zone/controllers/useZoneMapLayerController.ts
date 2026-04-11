import { useEffect, useMemo, useState } from "react";

import { useShallow } from "zustand/react/shallow";
import { useMessageHandler } from "@shared-message-handler";

import { sessionLocationService } from "@/app/services/sessionLocation.service";
import { zoneApi } from "@/features/zone/api/zone.api";
import { mapZoneStateToRenderableDefinition } from "@/features/zone/domain/zoneState.mapper";
import {
  selectWorkingZoneVersionId,
  useZoneVersionStore,
} from "@/features/zone/store/zoneVersion.store";
import {
  selectIsLoadingZonesForVersion,
  selectIsZoneMode,
  selectZoneLoadStatusForVersion,
  selectZonePathEditSession,
  selectVisibleZones,
  selectZonesByVersion,
  useZoneStore,
} from "@/features/zone/store/zone.store";
import {
  selectZoneVisibility,
  useZoneVisibilityStore,
} from "@/features/zone/store/zoneVisibility.store";
import type { MapBounds } from "@/shared/map/domain/types";
import { useMapManager } from "@/shared/resource-manager/useResourceManager";

export const useZoneMapLayerController = () => {
  const mapManager = useMapManager();
  const { showMessage } = useMessageHandler();
  const [viewportBounds, setViewportBounds] = useState<MapBounds | null>(null);
  const [mapReadyTick, setMapReadyTick] = useState(0);

  const isZoneMode = useZoneStore(selectIsZoneMode);
  const pathEditSession = useZoneStore(selectZonePathEditSession);
  const versions = useZoneVersionStore((state) => state.versions);
  const isLoadingVersions = useZoneVersionStore((state) => state.isLoadingVersions);
  const ensureFirstVersionStatus = useZoneVersionStore(
    (state) => state.ensureFirstVersionStatus,
  );
  const setVersions = useZoneVersionStore((state) => state.setVersions);
  const setSelectedVersionId = useZoneVersionStore(
    (state) => state.setSelectedVersionId,
  );
  const setLoadingVersions = useZoneVersionStore((state) => state.setLoadingVersions);
  const setEnsureFirstVersionStatus = useZoneVersionStore(
    (state) => state.setEnsureFirstVersionStatus,
  );
  const workingVersionId = useZoneVersionStore(selectWorkingZoneVersionId);
  const closeZoneDetailsPopover = useZoneStore(
    (state) => state.closeZoneDetailsPopover,
  );
  const toggleZoneDetailsPopover = useZoneStore(
    (state) => state.toggleZoneDetailsPopover,
  );
  const replaceZonesForVersion = useZoneStore((state) => state.replaceZonesForVersion);
  const setLoadingZones = useZoneStore((state) => state.setLoadingZones);
  const setZoneLoadStatus = useZoneStore((state) => state.setZoneLoadStatus);
  const isZoneVisible = useZoneVisibilityStore(selectZoneVisibility);
  const zonesForWorkingVersionCount = useZoneStore((state) =>
    selectZonesByVersion(state, workingVersionId).length,
  );
  const isLoadingZones = useZoneStore((state) =>
    selectIsLoadingZonesForVersion(state, workingVersionId),
  );
  const zoneLoadStatus = useZoneStore((state) =>
    selectZoneLoadStatusForVersion(state, workingVersionId),
  );
  const visibleZones = useZoneStore(
    useShallow((state) =>
      selectVisibleZones(state, workingVersionId, viewportBounds),
    ),
  );

  const renderableZones = useMemo(
    () => visibleZones.map(mapZoneStateToRenderableDefinition),
    [visibleZones],
  );
  const shouldRenderZones = isZoneMode || isZoneVisible;

  useEffect(() => {
    if (!shouldRenderZones) {
      return;
    }

    if (versions.length > 0) {
      return;
    }

    if (isLoadingVersions) {
      return;
    }

    if (
      ensureFirstVersionStatus === "loading" ||
      ensureFirstVersionStatus === "success" ||
      ensureFirstVersionStatus === "retryable_failure"
    ) {
      return;
    }

    const zoneCityKey = sessionLocationService.getZoneCityKey();
    if (!zoneCityKey) {
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
          error instanceof Error ? error.message : "Failed to load zone versions.";
        setEnsureFirstVersionStatus("retryable_failure", message);
        showMessage({ status: 500, message });
      })
      .finally(() => {
        setLoadingVersions(false);
      });
  }, [
    ensureFirstVersionStatus,
    isLoadingVersions,
    setEnsureFirstVersionStatus,
    setLoadingVersions,
    setSelectedVersionId,
    setVersions,
    shouldRenderZones,
    showMessage,
    versions.length,
  ]);

  useEffect(() => {
    if (!shouldRenderZones) {
      return;
    }

    if (typeof workingVersionId !== "number") {
      return;
    }

    if (zonesForWorkingVersionCount > 0) {
      return;
    }

    if (isLoadingZones) {
      return;
    }

    if (zoneLoadStatus === "success" || zoneLoadStatus === "retryable_failure") {
      return;
    }

    setLoadingZones(workingVersionId, true);
    setZoneLoadStatus(workingVersionId, "loading", null);

    zoneApi
      .fetchZonesForVersion(workingVersionId)
      .then((response) => {
        replaceZonesForVersion(
          workingVersionId,
          Array.isArray(response.data) ? response.data : [],
        );
        setZoneLoadStatus(workingVersionId, "success", null);
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Failed to load zones.";
        setZoneLoadStatus(workingVersionId, "retryable_failure", message);
        showMessage({ status: 500, message });
      })
      .finally(() => {
        setLoadingZones(workingVersionId, false);
      });
  }, [
    isLoadingZones,
    replaceZonesForVersion,
    setLoadingZones,
    setZoneLoadStatus,
    shouldRenderZones,
    showMessage,
    workingVersionId,
    zoneLoadStatus,
    zonesForWorkingVersionCount,
  ]);

  useEffect(() => {
    return mapManager.subscribeBoundsChanged((bounds) => {
      setViewportBounds(bounds);
    });
  }, [mapManager]);

  useEffect(() => {
    return mapManager.subscribeReady(() => {
      setMapReadyTick((tick) => tick + 1);
    });
  }, [mapManager]);

  useEffect(() => {
    if (!pathEditSession) {
      return;
    }

    closeZoneDetailsPopover();
  }, [closeZoneDetailsPopover, pathEditSession]);

  useEffect(() => {
    if (!shouldRenderZones) {
      closeZoneDetailsPopover();
      mapManager.clearZoneLayer();
      return;
    }

    mapManager.setZoneLayer(renderableZones, {
      onClick: () => {
        if (pathEditSession) {
          return;
        }
        closeZoneDetailsPopover();
      },
      onLabelClick: (zoneId, anchorRect) => {
        if (pathEditSession) {
          return;
        }
        toggleZoneDetailsPopover({ zoneId, anchorRect });
      },
    });

    return () => {
      mapManager.clearZoneLayer();
    };
  }, [
    isZoneMode,
    mapManager,
    renderableZones,
    closeZoneDetailsPopover,
    pathEditSession,
    shouldRenderZones,
    toggleZoneDetailsPopover,
    mapReadyTick,
  ]);
};
