import { useCallback, useEffect, useMemo, useRef } from "react";

import type {
  GeoJSONPolygonGeometry,
  MapBounds,
  MapBridge,
  MapConfig,
  MapViewportInsets,
  SetMarkerLayerOptions,
  SetClusteredMarkerLayerOptions,
  ZonePathEditOptions,
} from "../domain/types";
import type { MapOrder } from "../domain/entities/MapOrder";
import type { Route } from "../domain/entities/Route";
import type { GeoJSONPolygon, ZoneDefinition } from "@/features/zone/types";
import type { ZoneLayerOptions } from "../domain/types";
import type { ZonePolygonOverlayOptions } from "../domain/types";
import { MapController } from "../domain/services/MapController";
import { GoogleMapAdapter } from "../infrastructure/GoogleMapAdapter";
import { preloadMapExtras } from "../infrastructure/mapExtrasLoader";
import { resolveBrowserCurrentCoordinates } from "@/shared/utils/browserGeolocation";

export { preloadMapExtras }

export const useMap = (options?: MapConfig): MapBridge => {
  const controllerRef = useRef<MapController | null>(null);

  const controller = useMemo(() => {
    if (!controllerRef.current) {
      controllerRef.current = new MapController(new GoogleMapAdapter());
    }
    return controllerRef.current;
  }, []);

  const initialize = useCallback(
    async (container: HTMLElement | null, overrideOptions?: MapConfig) => {
      if (!container) return;

      const baseOptions = overrideOptions ?? options;

      const userCoords = await getUserCoordinates();
      const finalOptions: MapConfig = {
        ...baseOptions,
        mapId:
          baseOptions?.mapId ?? import.meta.env.VITE_GOOGLE_MAPS_MAP_ID_LIGHT,
        zoom: baseOptions?.zoom ?? 11,
        center: baseOptions?.center ?? userCoords ?? baseOptions?.center,
      };

      await controller.initialize(container, finalOptions);
    },
    [controller, options],
  );

  const selectOrder = useCallback(
    (id: string | number) => {
      controller.selectMarker(id);
    },
    [controller],
  );

  const setSelectedMarker = useCallback(
    (id: string | null) => {
      controller.setSelectedMarker(id);
    },
    [controller],
  );

  const setHoveredMarker = useCallback(
    (id: string | null) => {
      controller.setHoveredMarker(id);
    },
    [controller],
  );

  const setMultiSelectedMarkerIds = useCallback(
    (layerId: string, ids: string[]) => {
      controller.setMultiSelectedMarkerIds(layerId, ids);
    },
    [controller],
  );

  const showOrders = useCallback(
    (orders: MapOrder[]) => {
      controller.showOrders(orders);
    },
    [controller],
  );

  const setMarkerLayer = useCallback(
    (layerId: string, orders: MapOrder[], options?: SetMarkerLayerOptions) => {
      controller.setMarkerLayer(layerId, orders, options);
    },
    [controller],
  );

  const setClusteredMarkerLayer = useCallback(
    (
      layerId: string,
      orders: MapOrder[],
      options?: SetClusteredMarkerLayerOptions,
    ) => {
      controller.setClusteredMarkerLayer(layerId, orders, options);
    },
    [controller],
  );

  const setMarkerLayerVisibility = useCallback(
    (layerId: string, visible: boolean) => {
      controller.setMarkerLayerVisibility(layerId, visible);
    },
    [controller],
  );

  const clearMarkerLayer = useCallback(
    (layerId: string) => {
      controller.clearMarkerLayer(layerId);
    },
    [controller],
  );

  const clearClusteredMarkerLayer = useCallback(
    (layerId: string) => {
      controller.clearClusteredMarkerLayer(layerId);
    },
    [controller],
  );

  const expandClusterIds = useCallback(
    (layerId: string, markerIds: string[]) =>
      controller.expandClusterIds(layerId, markerIds),
    [controller],
  );

  const enableCircleSelection = useCallback(
    (params: { layerId: string; callback: (ids: string[]) => void }) => {
      controller.enableCircleSelection(params);
    },
    [controller],
  );

  const disableCircleSelection = useCallback(() => {
    controller.disableCircleSelection();
  }, [controller]);

  const enableZoneCapture = useCallback(
    (callback: (geometry: GeoJSONPolygon) => void) => {
      controller.enableZoneCapture(callback);
    },
    [controller],
  );

  const disableZoneCapture = useCallback(() => {
    controller.disableZoneCapture();
  }, [controller]);

  const enableZonePathEdit = useCallback(
    (geometry: GeoJSONPolygon, options: ZonePathEditOptions) => {
      controller.enableZonePathEdit(geometry, options);
    },
    [controller],
  );

  const disableZonePathEdit = useCallback(() => {
    controller.disableZonePathEdit();
  }, [controller]);

  const showRoute = useCallback(
    (route: Route | null) => {
      controller.showRoute(route);
    },
    [controller],
  );

  const setViewportInsets = useCallback(
    (insets: MapViewportInsets) => {
      controller.setViewportInsets(insets);
    },
    [controller],
  );

  const storeViewportInsets = useCallback(
    (insets: MapViewportInsets) => {
      controller.storeViewportInsets(insets);
    },
    [controller],
  );

  const reframeToVisibleArea = useCallback(() => {
    controller.reframeToVisibleArea();
  }, [controller]);

  const setZonePolygonOverlay = useCallback(
    (
      geometry: GeoJSONPolygonGeometry | null,
      options?: ZonePolygonOverlayOptions,
    ) => {
      controller.setZonePolygonOverlay(geometry, options);
    },
    [controller],
  );

  const clearZonePolygonOverlay = useCallback(() => {
    controller.clearZonePolygonOverlay();
  }, [controller]);

  const setZoneLayer = useCallback(
    (zones: ZoneDefinition[], options: ZoneLayerOptions) => {
      controller.setZoneLayer(zones, options);
    },
    [controller],
  );

  const clearZoneLayer = useCallback(() => {
    controller.clearZoneLayer();
  }, [controller]);

  const subscribeBoundsChanged = useCallback(
    (callback: (bounds: MapBounds | null) => void) =>
      controller.subscribeBoundsChanged(callback),
    [controller],
  );

  const subscribeReady = useCallback(
    (callback: () => void) => controller.subscribeReady(callback),
    [controller],
  );

  const getUserCoordinates = (): Promise<{
    lat: number;
    lng: number;
  } | null> => {
    return resolveBrowserCurrentCoordinates();
  };

  useEffect(() => {
    return () => {
      controller.destroy();
    };
  }, [controller]);

  const resize = useCallback(() => {
    controller.resize();
  }, [controller]);

  return useMemo(
    () => ({
      initialize,
      showOrders,
      setMarkerLayer,
      setClusteredMarkerLayer,
      setMarkerLayerVisibility,
      clearMarkerLayer,
      clearClusteredMarkerLayer,
      expandClusterIds,
      enableCircleSelection,
      disableCircleSelection,
      enableZoneCapture,
      disableZoneCapture,
      enableZonePathEdit,
      disableZonePathEdit,
      showRoute,
      selectOrder,
      setSelectedMarker,
      setHoveredMarker,
      setMultiSelectedMarkerIds,
      setViewportInsets,
      storeViewportInsets,
      reframeToVisibleArea,
      setZonePolygonOverlay,
      clearZonePolygonOverlay,
      setZoneLayer,
      clearZoneLayer,
      subscribeBoundsChanged,
      subscribeReady,
      resize,
    }),
    [
      clearMarkerLayer,
      clearClusteredMarkerLayer,
      clearZoneLayer,
      clearZonePolygonOverlay,
      disableCircleSelection,
      disableZoneCapture,
      disableZonePathEdit,
      enableZoneCapture,
      enableZonePathEdit,
      enableCircleSelection,
      expandClusterIds,
      initialize,
      reframeToVisibleArea,
      resize,
      selectOrder,
      setHoveredMarker,
      setMultiSelectedMarkerIds,
      setMarkerLayer,
      setClusteredMarkerLayer,
      setMarkerLayerVisibility,
      setSelectedMarker,
      setZoneLayer,
      setViewportInsets,
      storeViewportInsets,
      setZonePolygonOverlay,
      showOrders,
      showRoute,
      subscribeBoundsChanged,
      subscribeReady,
    ],
  );
};
