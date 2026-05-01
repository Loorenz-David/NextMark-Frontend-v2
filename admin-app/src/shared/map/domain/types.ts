import type { MapOrder } from "./entities/MapOrder";
import type { Route } from "./entities/Route";
import type { GeoJSONPolygon, ZoneDefinition } from "@/features/zone/types";

export type Coordinates = {
  lat: number;
  lng: number;
};

export type MapViewportInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type GeoJSONPolygonGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: unknown;
};

export type SetMarkerLayerOptions = {
  fitBounds?: boolean;
};

export type SetClusteredMarkerLayerOptions = {
  radius?: number;
  minZoom?: number;
  maxZoom?: number;
};

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type MapConfig = {
  center?: Coordinates;
  zoom?: number;
  mapId?: string;
  disableDefaultUI?: boolean;
};

export type ZoneLayerOptions = {
  onClick: (zoneId: number) => void;
  onLabelClick: (
    zoneId: number,
    anchorRect: { top: number; left: number; width: number; height: number },
  ) => void;
};

export type ZonePolygonOverlayOptions = {
  label?: string | null;
};

export type ZonePathEditOptions = {
  label?: string | null;
  onGeometryChange: (geometry: GeoJSONPolygon) => void;
};

export type MapBridge = {
  initialize: (
    container: HTMLElement | null,
    options?: MapConfig,
  ) => Promise<void>;
  showOrders: (orders: MapOrder[]) => void;
  setMarkerLayer: (
    layerId: string,
    orders: MapOrder[],
    options?: SetMarkerLayerOptions,
  ) => void;
  setClusteredMarkerLayer: (
    layerId: string,
    orders: MapOrder[],
    options?: SetClusteredMarkerLayerOptions,
  ) => void;
  setMarkerLayerVisibility: (layerId: string, visible: boolean) => void;
  clearMarkerLayer: (layerId: string) => void;
  clearClusteredMarkerLayer: (layerId: string) => void;
  expandClusterIds: (layerId: string, markerIds: string[]) => string[];
  enableCircleSelection: (params: {
    layerId: string;
    callback: (ids: string[]) => void;
  }) => void;
  disableCircleSelection: () => void;
  enableZoneCapture: (callback: (geometry: GeoJSONPolygon) => void) => void;
  disableZoneCapture: () => void;
  enableZonePathEdit: (
    geometry: GeoJSONPolygon,
    options: ZonePathEditOptions,
  ) => void;
  disableZonePathEdit: () => void;
  showRoute: (route: Route | null) => void;
  selectOrder: (id: number | string) => void;
  setSelectedMarker: (id: string | null) => void;
  setHoveredMarker: (id: string | null) => void;
  setMultiSelectedMarkerIds: (layerId: string, ids: string[]) => void;
  setViewportInsets: (insets: MapViewportInsets) => void;
  storeViewportInsets: (insets: MapViewportInsets) => void;
  reframeToVisibleArea: () => void;
  setZonePolygonOverlay: (
    geometry: GeoJSONPolygonGeometry | null,
    options?: ZonePolygonOverlayOptions,
  ) => void;
  clearZonePolygonOverlay: () => void;
  setZoneLayer: (zones: ZoneDefinition[], options: ZoneLayerOptions) => void;
  clearZoneLayer: () => void;
  subscribeBoundsChanged: (
    callback: (bounds: MapBounds | null) => void,
  ) => () => void;
  subscribeReady: (callback: () => void) => () => void;
  resize: () => void;
};

export interface MapAdapter {
  initialize: (container: HTMLElement, options?: MapConfig) => Promise<void>;
  setMarkers: (orders: MapOrder[]) => void;
  setLayerMarkers: (
    layerId: string,
    orders: MapOrder[],
    options?: SetMarkerLayerOptions,
  ) => void;
  setClusteredLayerMarkers: (
    layerId: string,
    orders: MapOrder[],
    options?: SetClusteredMarkerLayerOptions,
  ) => void;
  setLayerVisibility: (layerId: string, visible: boolean) => void;
  clearLayer: (layerId: string) => void;
  clearClusteredLayer: (layerId: string) => void;
  expandClusterIds: (layerId: string, markerIds: string[]) => string[];
  enableCircleSelection: (params: {
    layerId: string;
    callback: (ids: string[]) => void;
  }) => void;
  disableCircleSelection: () => void;
  enableZoneCapture: (callback: (geometry: GeoJSONPolygon) => void) => void;
  disableZoneCapture: () => void;
  enableZonePathEdit: (
    geometry: GeoJSONPolygon,
    options: ZonePathEditOptions,
  ) => void;
  disableZonePathEdit: () => void;
  clearMarkers: () => void;
  drawRoute: (route: Route | null) => void;
  fitBounds: (points?: Coordinates[]) => void;
  selectMarker: (id: string) => void;
  setSelectedMarker: (id: string | null) => void;
  setHoveredMarker: (id: string | null) => void;
  setMultiSelectedMarkerIds: (layerId: string, ids: string[]) => void;
  setViewportInsets: (insets: MapViewportInsets) => void;
  storeViewportInsets: (insets: MapViewportInsets) => void;
  reframeToVisibleArea: () => void;
  setZonePolygonOverlay: (
    geometry: GeoJSONPolygonGeometry | null,
    options?: ZonePolygonOverlayOptions,
  ) => void;
  clearZonePolygonOverlay: () => void;
  setZoneLayer: (zones: ZoneDefinition[], options: ZoneLayerOptions) => void;
  clearZoneLayer: () => void;
  subscribeBoundsChanged: (
    callback: (bounds: MapBounds | null) => void,
  ) => () => void;
  subscribeReady: (callback: () => void) => () => void;
  destroy: () => void;
  resize: () => void;
}
