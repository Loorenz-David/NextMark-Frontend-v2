import type {
  ZoneLayerOptions,
  GeoJSONPolygonGeometry,
  ZonePolygonOverlayOptions,
  ZonePathEditOptions,
  MapAdapter,
  MapBounds,
  MapConfig,
  MapViewportInsets,
  SetMarkerLayerOptions,
  SetClusteredMarkerLayerOptions,
} from "../types";
import type { MapOrder } from "../entities/MapOrder";
import type { Route } from "../entities/Route";
import type { GeoJSONPolygon, ZoneDefinition } from "@/features/zone/types";
import { MAP_MARKER_LAYERS } from "../constants/markerLayers";

export class MapController {
  private adapter: MapAdapter;

  constructor(adapter: MapAdapter) {
    this.adapter = adapter;
  }

  async initialize(container: HTMLElement, options?: MapConfig) {
    await this.adapter.initialize(container, options);
  }

  selectMarker(id: string | number) {
    this.adapter.selectMarker(String(id));
  }

  setSelectedMarker(id: string | null) {
    this.adapter.setSelectedMarker(id);
  }

  setHoveredMarker(id: string | null) {
    this.adapter.setHoveredMarker(id);
  }

  setMultiSelectedMarkerIds(layerId: string, ids: string[]) {
    this.adapter.setMultiSelectedMarkerIds(layerId, ids);
  }

  showOrders(orders: MapOrder[]) {
    this.adapter.setLayerMarkers(MAP_MARKER_LAYERS.default, orders, {
      fitBounds: true,
    });
  }

  setMarkerLayer(
    layerId: string,
    orders: MapOrder[],
    options?: SetMarkerLayerOptions,
  ) {
    this.adapter.setLayerMarkers(layerId, orders, options);
  }

  setClusteredMarkerLayer(
    layerId: string,
    orders: MapOrder[],
    options?: SetClusteredMarkerLayerOptions,
  ) {
    this.adapter.setClusteredLayerMarkers(layerId, orders, options);
  }

  setMarkerLayerVisibility(layerId: string, visible: boolean) {
    this.adapter.setLayerVisibility(layerId, visible);
  }

  clearMarkerLayer(layerId: string) {
    this.adapter.clearLayer(layerId);
  }

  clearClusteredMarkerLayer(layerId: string) {
    this.adapter.clearClusteredLayer(layerId);
  }

  expandClusterIds(layerId: string, markerIds: string[]) {
    return this.adapter.expandClusterIds(layerId, markerIds);
  }

  enableCircleSelection(params: {
    layerId: string;
    callback: (ids: string[]) => void;
  }) {
    this.adapter.enableCircleSelection(params);
  }

  disableCircleSelection() {
    this.adapter.disableCircleSelection();
  }

  enableZoneCapture(callback: (geometry: GeoJSONPolygon) => void) {
    this.adapter.enableZoneCapture(callback);
  }

  disableZoneCapture() {
    this.adapter.disableZoneCapture();
  }

  enableZonePathEdit(
    geometry: GeoJSONPolygon,
    options: ZonePathEditOptions,
  ) {
    this.adapter.enableZonePathEdit(geometry, options);
  }

  disableZonePathEdit() {
    this.adapter.disableZonePathEdit();
  }

  showRoute(route: Route | null) {
    this.adapter.drawRoute(route);
  }

  fitTo(points?: MapOrder["coordinates"][]) {
    this.adapter.fitBounds(points);
  }

  setViewportInsets(insets: MapViewportInsets) {
    this.adapter.setViewportInsets(insets);
  }

  storeViewportInsets(insets: MapViewportInsets) {
    this.adapter.storeViewportInsets(insets);
  }

  reframeToVisibleArea() {
    this.adapter.reframeToVisibleArea();
  }

  setZonePolygonOverlay(
    geometry: GeoJSONPolygonGeometry | null,
    options?: ZonePolygonOverlayOptions,
  ) {
    this.adapter.setZonePolygonOverlay(geometry, options);
  }

  clearZonePolygonOverlay() {
    this.adapter.clearZonePolygonOverlay();
  }

  setZoneLayer(zones: ZoneDefinition[], options: ZoneLayerOptions) {
    this.adapter.setZoneLayer(zones, options);
  }

  clearZoneLayer() {
    this.adapter.clearZoneLayer();
  }

  subscribeBoundsChanged(callback: (bounds: MapBounds | null) => void) {
    return this.adapter.subscribeBoundsChanged(callback);
  }

  subscribeReady(callback: () => void) {
    return this.adapter.subscribeReady(callback);
  }

  resize() {
    this.adapter.resize();
  }

  clear() {
    this.adapter.clearMarkers();
    this.adapter.drawRoute(null);
  }

  destroy() {
    this.adapter.destroy();
  }
}
