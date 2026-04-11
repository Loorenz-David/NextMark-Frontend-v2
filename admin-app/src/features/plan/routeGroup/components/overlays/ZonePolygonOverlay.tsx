import { useEffect, useMemo } from "react";

import {
  selectZoneVisibility,
  useZoneVisibilityStore,
} from "@/features/zone/store/zoneVisibility.store";
import type { GeoJSONPolygon, ZoneDefinition } from "@/features/zone/types";
import { useMapManager } from "@/shared/resource-manager/useResourceManager";
import {
  useActiveRouteGroupActions,
  useActiveRouteGroupId,
} from "../../store/useActiveRouteGroup.selector";
import {
  useRouteGroupByServerId,
  useRouteGroupsByPlanId,
} from "../../store/useRouteGroup.selector";
import {
  selectRouteGroupZonePreviewMode,
  useRouteGroupZonePreviewStore,
} from "../../store/routeGroupZonePreview.store";

export const ZonePolygonOverlay = () => {
  const mapManager = useMapManager();
  const activeRouteGroupId = useActiveRouteGroupId();
  const activeRouteGroup = useRouteGroupByServerId(activeRouteGroupId);
  const routePlanId = activeRouteGroup?.route_plan_id ?? null;
  const routeGroups = useRouteGroupsByPlanId(routePlanId);
  const previewMode = useRouteGroupZonePreviewStore(
    selectRouteGroupZonePreviewMode,
  );
  const { setActiveRouteGroupId, rememberRouteGroupForPlan } =
    useActiveRouteGroupActions();
  const isZoneVisible = useZoneVisibilityStore(selectZoneVisibility);

  const activeRouteGroupZone = useMemo<ZoneDefinition | null>(() => {
    if (
      typeof activeRouteGroup?.id !== "number" ||
      activeRouteGroup.zone_snapshot?.geometry == null
    ) {
      return null;
    }

    return {
      id: activeRouteGroup.id,
      name:
        activeRouteGroup.zone_snapshot?.name?.trim() ||
        (typeof activeRouteGroup.zone_id === "number"
          ? `Zone ${activeRouteGroup.zone_id}`
          : `Route group ${activeRouteGroup.id}`),
      geometry: activeRouteGroup.zone_snapshot.geometry,
    } satisfies ZoneDefinition;
  }, [activeRouteGroup]);

  const routeGroupZones = useMemo(
    () =>
      routeGroups
        .map((routeGroup) => {
          if (
            typeof routeGroup.id !== "number" ||
            routeGroup.zone_snapshot?.geometry == null
          ) {
            return null;
          }

          return {
            id: routeGroup.id,
            name:
              routeGroup.zone_snapshot?.name?.trim() ||
              (typeof routeGroup.zone_id === "number"
                ? `Zone ${routeGroup.zone_id}`
                : `Route group ${routeGroup.id}`),
            geometry: routeGroup.zone_snapshot.geometry,
          } satisfies ZoneDefinition;
        })
        .filter(
          (
            zone,
          ): zone is ZoneDefinition & { id: number; geometry: GeoJSONPolygon } =>
            zone != null &&
            typeof zone.id === "number" &&
            zone.geometry != null,
        ),
    [routeGroups],
  );

  useEffect(() => {
    if (!isZoneVisible) {
      mapManager.clearZoneLayer();
      mapManager.clearZonePolygonOverlay();
      return;
    }

    if (previewMode === "all") {
      if (routeGroupZones.length === 0) {
        mapManager.clearZoneLayer();
        mapManager.clearZonePolygonOverlay();
        return;
      }

      mapManager.setZoneLayer(routeGroupZones, {
        onClick: (routeGroupId) => {
          setActiveRouteGroupId(routeGroupId);
          if (routePlanId != null) {
            rememberRouteGroupForPlan(routePlanId, routeGroupId);
          }
        },
        onLabelClick: (routeGroupId) => {
          setActiveRouteGroupId(routeGroupId);
          if (routePlanId != null) {
            rememberRouteGroupForPlan(routePlanId, routeGroupId);
          }
        },
      });
      mapManager.clearZonePolygonOverlay();
    } else {
      mapManager.clearZoneLayer();

      if (!activeRouteGroupZone?.geometry) {
        mapManager.clearZonePolygonOverlay();
        return;
      }

      mapManager.setZonePolygonOverlay(activeRouteGroupZone.geometry, {
        label: activeRouteGroupZone.name,
      });
    }

    return () => {
      mapManager.clearZoneLayer();
      mapManager.clearZonePolygonOverlay();
    };
  }, [
    isZoneVisible,
    mapManager,
    activeRouteGroupZone,
    previewMode,
    rememberRouteGroupForPlan,
    routePlanId,
    routeGroupZones,
    setActiveRouteGroupId,
  ]);

  return null;
};
