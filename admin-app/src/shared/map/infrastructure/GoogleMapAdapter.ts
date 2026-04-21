import { loadGoogleMaps } from "@shared-google-maps";
import type { DrawingManagerService } from "./drawing/DrawingManagerService";
import type { ClusterLayerManager } from "./markers/ClusterLayerManager";

import { MAP_MARKER_LAYERS } from "../domain/constants/markerLayers";
import type { MapOrder } from "../domain/entities/MapOrder";
import type { Route } from "../domain/entities/Route";
import type {
  Coordinates,
  GeoJSONPolygonGeometry,
  MapAdapter,
  MapBounds,
  MapConfig,
  MapViewportInsets,
  SetMarkerLayerOptions,
  SetClusteredMarkerLayerOptions,
  ZoneLayerOptions,
  ZonePathEditOptions,
  ZonePolygonOverlayOptions,
} from "../domain/types";
import type { GeoJSONPolygon, ZoneDefinition } from "@/features/zone/types";
import { LocateControlManager } from "./controls/LocateControlManager";
import { MapInstanceManager } from "./core/MapInstanceManager";
import { ViewportManager } from "./core/ViewportManager";
import {
  createClusterLayerManager,
  createDrawingServices,
} from "./mapExtrasLoader";
import { UserLocationManager } from "./location/UserLocationManager";
import { MarkerLayerManager } from "./markers/MarkerLayerManager";
import { MarkerMultiSelectionManager } from "./markers/MarkerMultiSelectionManager";
import { MarkerSelectionManager } from "./markers/MarkerSelectionManager";
import { RouteRenderer } from "./route/RouteRenderer";

const DEFAULT_ZONE_STROKE_COLOR = "#111111";
const DEFAULT_ZONE_FILL_COLOR = "#111111";
const DEFAULT_ZONE_FILL_OPACITY = 0.12;
const DEFAULT_ZONE_STROKE_OPACITY = 0.72;
const ZONE_HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const resolveZoneColor = (zoneColor?: string | null) =>
  typeof zoneColor === "string" && ZONE_HEX_COLOR_PATTERN.test(zoneColor.trim())
    ? zoneColor
    : DEFAULT_ZONE_FILL_COLOR;
const normalizeHexColor = (zoneColor?: string | null) =>
  typeof zoneColor === "string" && ZONE_HEX_COLOR_PATTERN.test(zoneColor.trim())
    ? zoneColor.trim()
    : DEFAULT_ZONE_FILL_COLOR;

const darkenHexColor = (hexColor: string, factor = 0.45) => {
  const normalized = normalizeHexColor(hexColor).slice(1);
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;

  const red = Math.max(
    0,
    Math.min(255, Math.round(parseInt(expanded.slice(0, 2), 16) * factor)),
  );
  const green = Math.max(
    0,
    Math.min(255, Math.round(parseInt(expanded.slice(2, 4), 16) * factor)),
  );
  const blue = Math.max(
    0,
    Math.min(255, Math.round(parseInt(expanded.slice(4, 6), 16) * factor)),
  );

  return `rgb(${red}, ${green}, ${blue})`;
};

export class GoogleMapAdapter implements MapAdapter {
  private readonly mapInstanceManager: MapInstanceManager;
  private readonly markerLayerManager: MarkerLayerManager;
  private readonly markerSelectionManager: MarkerSelectionManager;
  private readonly markerMultiSelectionManager: MarkerMultiSelectionManager;
  private readonly routeRenderer: RouteRenderer;
  private readonly viewportManager: ViewportManager;
  private readonly userLocationManager: UserLocationManager;
  private readonly locateControlManager: LocateControlManager;
  private clusterLayerManager: ClusterLayerManager | null = null;
  private clusterLayerManagerPromise: Promise<ClusterLayerManager> | null = null;
  private drawingManagerService: DrawingManagerService | null = null;
  private drawingManagerServicePromise: Promise<DrawingManagerService> | null =
    null;
  private pendingClusterLayers = new Map<
    string,
    {
      orders: MapOrder[];
      options?: SetClusteredMarkerLayerOptions;
    }
  >();
  private drawingOperationQueue: Array<
    (service: DrawingManagerService) => void
  > = [];
  private boundsChangedListeners = new Set<
    (bounds: MapBounds | null) => void
  >();
  private readyListeners = new Set<() => void>();
  private boundsSubscription: google.maps.MapsEventListener | null = null;
  private boundsEmitRafHandle: number | null = null;
  private zoneOverlayPolygons: google.maps.Polygon[] = [];
  private zoneOverlayLabelMarkers: google.maps.marker.AdvancedMarkerElement[] =
    [];
  private zoneLayerPolygons = new Map<number, google.maps.Polygon>();
  private zoneLabelMarkers = new Map<
    number,
    google.maps.marker.AdvancedMarkerElement
  >();

  constructor() {
    let routeFitBoundsCallback: (points: Coordinates[]) => void = () =>
      undefined;

    this.mapInstanceManager = new MapInstanceManager(loadGoogleMaps);
    this.markerLayerManager = new MarkerLayerManager(this.mapInstanceManager);
    this.markerSelectionManager = new MarkerSelectionManager(
      this.markerLayerManager,
    );
    this.markerMultiSelectionManager = new MarkerMultiSelectionManager(
      this.markerLayerManager,
    );
    this.routeRenderer = new RouteRenderer(
      this.mapInstanceManager,
      (points) => {
        routeFitBoundsCallback(points);
      },
    );
    this.viewportManager = new ViewportManager(
      this.mapInstanceManager,
      this.markerLayerManager,
      this.routeRenderer,
    );
    routeFitBoundsCallback = (points) => this.viewportManager.fitBounds(points);
    this.userLocationManager = new UserLocationManager(this.mapInstanceManager);
    this.locateControlManager = new LocateControlManager(
      this.mapInstanceManager,
      this.userLocationManager,
    );
  }

  async initialize(container: HTMLElement, options?: MapConfig) {
    await this.mapInstanceManager.initialize(container, options);
    const map = this.mapInstanceManager.getMap();
    if (map && this.clusterLayerManager) {
      this.clusterLayerManager.attachMap(map);
    }
    this.bindBoundsChangedListener();

    this.userLocationManager.clearUserLocationMarker();
    this.locateControlManager.unmountLocateControl();
    this.viewportManager.applyViewportInsets();

    this.userLocationManager.mountUserLocationMarker();
    this.locateControlManager.mountLocateControl();

    this.markerLayerManager.replayLayerSnapshots((points) => {
      this.viewportManager.fitBounds(points);
    });

    this.markerSelectionManager.reconcileSelectionState();
    this.markerSelectionManager.reapplySelectionStyles();

    const activeLayerId = this.drawingManagerService?.getActiveLayerId();
    if (activeLayerId) {
      this.markerMultiSelectionManager.syncLayerStyles(activeLayerId);
    }

    this.readyListeners.forEach((listener) => listener());
    this.emitBoundsChanged();
  }

  setMarkers(orders: MapOrder[]) {
    this.setLayerMarkers(MAP_MARKER_LAYERS.default, orders, {
      fitBounds: true,
    });
  }

  setLayerMarkers(
    layerId: string,
    orders: MapOrder[],
    options?: SetMarkerLayerOptions,
  ) {
    this.pendingClusterLayers.delete(layerId);

    if (this.clusterLayerManager?.hasLayer(layerId)) {
      this.clusterLayerManager.clearLayer(layerId);
    }

    const { shouldFitBounds, removedIds } =
      this.markerLayerManager.setLayerMarkers(layerId, orders, options);

    if (removedIds.length) {
      this.markerMultiSelectionManager.removeIds(removedIds);
    }

    this.markerSelectionManager.reconcileSelectionState();
    this.markerSelectionManager.reapplySelectionStyles();
    this.markerMultiSelectionManager.syncLayerStyles(layerId);

    if (shouldFitBounds) {
      this.viewportManager.fitBounds(orders.map((order) => order.coordinates));
    }
  }

  setClusteredLayerMarkers(
    layerId: string,
    orders: MapOrder[],
    options?: SetClusteredMarkerLayerOptions,
  ) {
    this.pendingClusterLayers.set(layerId, { orders, options });

    if (this.clusterLayerManager?.hasLayer(layerId)) {
      this.applyPendingClusterLayer(layerId);
      return;
    }

    void this.ensureClustering().then(() => {
      this.applyPendingClusterLayer(layerId);
    });
  }

  setLayerVisibility(layerId: string, visible: boolean) {
    this.markerLayerManager.setLayerVisibility(layerId, visible);
    this.markerMultiSelectionManager.syncLayerStyles(layerId);
  }

  clearLayer(layerId: string) {
    this.pendingClusterLayers.delete(layerId);

    const removedIds = this.clusterLayerManager?.hasLayer(layerId)
      ? this.clusterLayerManager.clearLayer(layerId)
      : this.markerLayerManager.clearLayer(layerId);

    if (removedIds.length) {
      this.markerMultiSelectionManager.removeIds(removedIds);
    }

    this.drawingManagerService?.handleLayerCleared(layerId);
    this.markerSelectionManager.reconcileSelectionState();
    this.markerSelectionManager.reapplySelectionStyles();
  }

  clearClusteredLayer(layerId: string) {
    this.pendingClusterLayers.delete(layerId);
    const removedIds = this.clusterLayerManager
      ? this.clusterLayerManager.clearLayer(layerId)
      : this.markerLayerManager.clearLayer(layerId);

    if (removedIds.length) {
      this.markerMultiSelectionManager.removeIds(removedIds);
    }

    this.drawingManagerService?.handleLayerCleared(layerId);
    this.markerSelectionManager.reconcileSelectionState();
    this.markerSelectionManager.reapplySelectionStyles();
  }

  expandClusterIds(layerId: string, markerIds: string[]) {
    if (!this.clusterLayerManager) {
      return Array.from(new Set(markerIds));
    }

    return this.clusterLayerManager.expandToLeafIds(layerId, markerIds);
  }

  clearMarkers() {
    this.pendingClusterLayers.clear();
    const removedIds = [
      ...(this.clusterLayerManager?.clearLayers() ?? []),
      ...this.markerLayerManager.clearMarkers(),
    ];

    if (removedIds.length) {
      this.markerMultiSelectionManager.removeIds(removedIds);
    }

    this.markerSelectionManager.reset();
    this.drawingManagerService?.disableCircleSelection();
  }

  enableCircleSelection(params: {
    layerId: string;
    callback: (ids: string[]) => void;
  }) {
    this.queueDrawingOperation((service) => {
      service.enableCircleSelection(params);
    });
  }

  disableCircleSelection() {
    this.queueDrawingOperation((service) => {
      service.disableCircleSelection();
    });
  }

  enableZoneCapture(callback: (geometry: GeoJSONPolygon) => void) {
    this.queueDrawingOperation((service) => {
      service.enableZoneCapture(callback);
    });
  }

  disableZoneCapture() {
    this.queueDrawingOperation((service) => {
      service.disableZoneCapture();
    });
  }

  enableZonePathEdit(geometry: GeoJSONPolygon, options: ZonePathEditOptions) {
    this.queueDrawingOperation((service) => {
      service.enableZonePathEdit(geometry, options);
    });
  }

  disableZonePathEdit() {
    this.queueDrawingOperation((service) => {
      service.disableZonePathEdit();
    });
  }

  selectMarker(id: string) {
    this.markerSelectionManager.selectMarker(id);
  }

  setSelectedMarker(id: string | null) {
    this.markerSelectionManager.setSelectedMarker(id);
  }

  setHoveredMarker(id: string | null) {
    this.markerSelectionManager.setHoveredMarker(id);
  }

  setMultiSelectedMarkerIds(layerId: string, ids: string[]) {
    const resolvedIds = this.resolveVisibleMultiSelectedMarkerIds(layerId, ids);
    this.markerMultiSelectionManager.setActiveLayer(layerId);
    this.markerMultiSelectionManager.applyMultiSelection(layerId, resolvedIds);
    this.markerMultiSelectionManager.syncLayerStyles(layerId);
  }

  drawRoute(route: Route | null) {
    this.routeRenderer.drawRoute(route);
  }

  fitBounds(points?: Coordinates[]) {
    this.viewportManager.fitBounds(points);
  }

  setViewportInsets(insets: MapViewportInsets) {
    this.viewportManager.setViewportInsets(insets);
  }

  private resolveVisibleMultiSelectedMarkerIds(layerId: string, ids: string[]) {
    const selectedLeafIds = new Set(ids);
    const layer = this.markerLayerManager.getLayer(layerId);

    if (!layer || selectedLeafIds.size === 0) {
      return ids;
    }

    const resolvedIds: string[] = [];

    layer.markers.forEach((_entry, markerId) => {
      if (selectedLeafIds.has(markerId)) {
        resolvedIds.push(markerId);
        return;
      }

      if (!markerId.startsWith("cluster_")) {
        return;
      }

      if (!this.clusterLayerManager) {
        return;
      }

      const leafIds = this.clusterLayerManager.expandToLeafIds(layerId, [
        markerId,
      ]);
      if (leafIds.length === 0) {
        return;
      }

      if (leafIds.every((leafId) => selectedLeafIds.has(leafId))) {
        resolvedIds.push(markerId);
      }
    });

    return resolvedIds;
  }

  reframeToVisibleArea() {
    this.viewportManager.reframeToVisibleArea();
  }

  setZonePolygonOverlay(
    geometry: GeoJSONPolygonGeometry | null,
    options?: ZonePolygonOverlayOptions,
  ) {
    this.clearZonePolygonOverlay();

    const map = this.mapInstanceManager.getMap();
    const googleMaps = globalThis.google?.maps;
    const PolygonCtor = googleMaps?.Polygon;
    const MarkerCtor = googleMaps?.marker?.AdvancedMarkerElement;

    if (!map || !geometry || !PolygonCtor) {
      return;
    }

    const polygonGroups = this.normalizePolygonGroups(geometry);
    polygonGroups.forEach((polygonCoordinates) => {
      const paths = polygonCoordinates
        .map((ring) => this.normalizeRing(ring))
        .filter((ring) => ring.length >= 3);

      if (paths.length === 0) {
        return;
      }

      const polygon = new PolygonCtor({
        map,
        paths,
        clickable: false,
        strokeColor: DEFAULT_ZONE_STROKE_COLOR,
        strokeOpacity: DEFAULT_ZONE_STROKE_OPACITY,
        strokeWeight: 2,
        fillColor: DEFAULT_ZONE_FILL_COLOR,
        fillOpacity: DEFAULT_ZONE_FILL_OPACITY,
        zIndex: 1,
      });

      this.zoneOverlayPolygons.push(polygon);
    });

    const label = options?.label?.trim();
    const labelPosition = label ? this.resolveGeometryCenter(geometry) : null;
    if (!label || !labelPosition || !MarkerCtor) {
      return;
    }

    const labelContent = document.createElement("div");
    labelContent.className =
      "rounded-md border border-white/25 bg-black/50 px-2 py-1 text-xs font-semibold text-white";
    labelContent.textContent = label;

    const marker = new MarkerCtor({
      map,
      position: labelPosition,
      content: labelContent,
    });

    this.zoneOverlayLabelMarkers.push(marker);
  }

  clearZonePolygonOverlay() {
    this.zoneOverlayPolygons.forEach((polygon) => {
      polygon?.setMap?.(null);
    });
    this.zoneOverlayPolygons = [];
    this.zoneOverlayLabelMarkers.forEach((marker) => {
      marker.map = null;
    });
    this.zoneOverlayLabelMarkers = [];
  }

  setZoneLayer(zones: ZoneDefinition[], options: ZoneLayerOptions) {
    const map = this.mapInstanceManager.getMap();
    const googleMaps = globalThis.google?.maps;
    const PolygonCtor = googleMaps?.Polygon;
    const MarkerCtor = googleMaps?.marker?.AdvancedMarkerElement;

    if (!map || !PolygonCtor) {
      return;
    }

    const nextZoneIds = new Set<number>();

    zones.forEach((zone) => {
      const zoneId = typeof zone.id === "number" ? zone.id : null;
      const geometry = zone.geometry;

      if (!zoneId || !geometry || !Array.isArray(geometry.coordinates)) {
        return;
      }
      nextZoneIds.add(zoneId);

      const exteriorRing = this.resolveExteriorRing(geometry);
      const paths = exteriorRing
        .map((point) => {
          if (!Array.isArray(point) || point.length < 2) return null;
          const lng = Number(point[0]);
          const lat = Number(point[1]);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
          return { lat, lng };
        })
        .filter((point): point is { lat: number; lng: number } =>
          Boolean(point),
        );

      if (paths.length < 3) {
        return;
      }

      const resolvedZoneColor = resolveZoneColor(zone.zone_color);
      const existingPolygon = this.zoneLayerPolygons.get(zoneId);
      const polygon =
        existingPolygon ??
        new PolygonCtor({
          paths,
          map,
          clickable: false,
          strokeColor: DEFAULT_ZONE_STROKE_COLOR,
          strokeOpacity: DEFAULT_ZONE_STROKE_OPACITY,
          strokeWeight: 2,
          fillColor: DEFAULT_ZONE_FILL_COLOR,
          fillOpacity: DEFAULT_ZONE_FILL_OPACITY,
          zIndex: 1,
        });

      (
        polygon as unknown as {
          setOptions: (options: {
            paths: Array<{ lat: number; lng: number }>;
            map: google.maps.Map;
            fillColor: string;
            fillOpacity: number;
            strokeColor: string;
            strokeOpacity: number;
            strokeWeight: number;
          }) => void;
        }
      ).setOptions({
        paths,
        map,
        fillColor: resolvedZoneColor,
        fillOpacity: 0.08,
        strokeColor: resolvedZoneColor,
        strokeOpacity: 0.7,
        strokeWeight: 2,
      });

      const addListener = googleMaps?.event?.addListener;
      googleMaps?.event?.clearInstanceListeners?.(polygon);
      if (addListener) {
        addListener(polygon, "click", () => options.onClick(zoneId));
      }

      this.zoneLayerPolygons.set(zoneId, polygon);

      if (
        MarkerCtor &&
        Number.isFinite(zone.centroid_lat) &&
        Number.isFinite(zone.centroid_lng)
      ) {
        const zoneColor = normalizeHexColor(zone.zone_color);
        const existingMarker = this.zoneLabelMarkers.get(zoneId);
        const label =
          (existingMarker?.content as HTMLDivElement | null) ??
          document.createElement("div");
        label.className =
          "rounded-md border px-2 py-1 text-xs font-semibold text-white shadow-[0_8px_22px_rgba(0,0,0,0.24)] backdrop-blur-sm";
        label.textContent = zone.name || `Zone ${zoneId}`;
        label.style.cursor = "pointer";
        label.style.backgroundColor = darkenHexColor(zoneColor, 0.8);
        label.style.borderColor = darkenHexColor(zoneColor, 0.65);
        label.onclick = (event: MouseEvent) => {
          event.stopPropagation();
          const rect = label.getBoundingClientRect();
          options.onLabelClick(zoneId, {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
        };

        const marker =
          existingMarker ??
          new MarkerCtor({
            map,
            position: {
              lat: Number(zone.centroid_lat),
              lng: Number(zone.centroid_lng),
            },
            content: label,
          });

        marker.position = {
          lat: Number(zone.centroid_lat),
          lng: Number(zone.centroid_lng),
        };
        marker.content = label;
        marker.map = map;

        this.zoneLabelMarkers.set(zoneId, marker);
      } else {
        const existingMarker = this.zoneLabelMarkers.get(zoneId);
        const content = existingMarker?.content as HTMLElement | undefined;
        if (content) {
          content.onclick = null;
        }
        if (existingMarker) {
          existingMarker.map = null;
          this.zoneLabelMarkers.delete(zoneId);
        }
      }
    });

    Array.from(this.zoneLayerPolygons.entries()).forEach(
      ([zoneId, polygon]) => {
        if (nextZoneIds.has(zoneId)) {
          return;
        }

        googleMaps?.event?.clearInstanceListeners?.(polygon);
        polygon.setMap(null);
        this.zoneLayerPolygons.delete(zoneId);
      },
    );

    Array.from(this.zoneLabelMarkers.entries()).forEach(([zoneId, marker]) => {
      if (nextZoneIds.has(zoneId)) {
        return;
      }

      const content = marker.content as HTMLElement | undefined;
      if (content) {
        content.onclick = null;
      }
      marker.map = null;
      this.zoneLabelMarkers.delete(zoneId);
    });
  }

  clearZoneLayer() {
    const googleMaps = globalThis.google?.maps;
    const mapEvents = googleMaps?.event;
    this.zoneLayerPolygons.forEach((polygon) => {
      mapEvents?.clearInstanceListeners?.(polygon);
      polygon?.setMap?.(null);
    });
    this.zoneLayerPolygons.clear();

    this.zoneLabelMarkers.forEach((marker) => {
      const content = marker?.content as HTMLElement | undefined;
      if (content) {
        content.onclick = null;
      }
      marker.map = null;
    });
    this.zoneLabelMarkers.clear();
  }

  subscribeBoundsChanged(callback: (bounds: MapBounds | null) => void) {
    this.boundsChangedListeners.add(callback);
    callback(this.resolveBounds());

    return () => {
      this.boundsChangedListeners.delete(callback);
    };
  }

  subscribeReady(callback: () => void) {
    this.readyListeners.add(callback);

    if (this.mapInstanceManager.getMap()) {
      callback();
    }

    return () => {
      this.readyListeners.delete(callback);
    };
  }

  destroy() {
    this.boundsSubscription?.remove?.();
    this.boundsSubscription = null;
    if (this.boundsEmitRafHandle !== null) {
      cancelAnimationFrame(this.boundsEmitRafHandle);
      this.boundsEmitRafHandle = null;
    }
    this.boundsChangedListeners.clear();
    this.readyListeners.clear();
    this.clusterLayerManager?.detachMap();
    this.clearMarkers();
    this.userLocationManager.clearUserLocationMarker();
    this.locateControlManager.unmountLocateControl();
    this.drawingManagerService?.destroy();
    this.routeRenderer.destroy();
    this.clearZonePolygonOverlay();
    this.clearZoneLayer();
    this.mapInstanceManager.destroy();
  }

  private resolveExteriorRing(geometry: GeoJSONPolygon): unknown[] {
    const coordinates = geometry.coordinates;
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return [];
    }

    if (geometry.type === "MultiPolygon") {
      const firstPolygon = coordinates[0];
      if (Array.isArray(firstPolygon) && Array.isArray(firstPolygon[0])) {
        return firstPolygon[0] as unknown[];
      }
      return [];
    }

    const firstRing = coordinates[0];
    if (Array.isArray(firstRing)) {
      return firstRing as unknown[];
    }

    return [];
  }

  private resolveGeometryCenter(
    geometry: GeoJSONPolygonGeometry,
  ): { lat: number; lng: number } | null {
    const exteriorRing = this.resolveExteriorRing(geometry as GeoJSONPolygon);
    if (!Array.isArray(exteriorRing) || exteriorRing.length === 0) {
      return null;
    }

    let minLat = Number.POSITIVE_INFINITY;
    let maxLat = Number.NEGATIVE_INFINITY;
    let minLng = Number.POSITIVE_INFINITY;
    let maxLng = Number.NEGATIVE_INFINITY;

    exteriorRing.forEach((point) => {
      if (!Array.isArray(point) || point.length < 2) {
        return;
      }

      const lng = Number(point[0]);
      const lat = Number(point[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return;
      }

      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });

    if (
      !Number.isFinite(minLat) ||
      !Number.isFinite(maxLat) ||
      !Number.isFinite(minLng) ||
      !Number.isFinite(maxLng)
    ) {
      return null;
    }

    return {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
    };
  }

  private normalizeRing(ring: unknown): Array<{ lat: number; lng: number }> {
    if (!Array.isArray(ring)) {
      return [];
    }

    return ring
      .map((point) => {
        if (!Array.isArray(point) || point.length < 2) return null;
        const lng = Number(point[0]);
        const lat = Number(point[1]);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return { lat, lng };
      })
      .filter((point): point is { lat: number; lng: number } => Boolean(point));
  }

  private normalizePolygonGroups(
    geometry: GeoJSONPolygonGeometry,
  ): unknown[][][] {
    const coordinates = geometry.coordinates;

    if (!Array.isArray(coordinates)) {
      return [];
    }

    if (geometry.type === "MultiPolygon") {
      if (
        Array.isArray(coordinates[0]) &&
        Array.isArray((coordinates[0] as unknown[])[0]) &&
        Array.isArray(((coordinates[0] as unknown[])[0] as unknown[])[0])
      ) {
        return coordinates as unknown[][][];
      }
      return [coordinates as unknown[][]];
    }

    return [coordinates as unknown[][]];
  }

  private async ensureClustering() {
    if (this.clusterLayerManager) {
      return this.clusterLayerManager;
    }

    if (!this.clusterLayerManagerPromise) {
      this.clusterLayerManagerPromise = createClusterLayerManager(
        this.markerLayerManager,
        (layerId) => {
          this.markerSelectionManager.reconcileSelectionState();
          this.markerSelectionManager.reapplySelectionStyles();
          this.markerMultiSelectionManager.syncLayerStyles(layerId);
        },
      ).then((manager) => {
        this.clusterLayerManager = manager;
        const map = this.mapInstanceManager.getMap();
        if (map) {
          manager.attachMap(map);
        }
        return manager;
      });
    }

    return this.clusterLayerManagerPromise;
  }

  private async ensureDrawing() {
    if (this.drawingManagerService) {
      return this.drawingManagerService;
    }

    if (!this.drawingManagerServicePromise) {
      this.drawingManagerServicePromise = createDrawingServices(
        this.mapInstanceManager,
        this.markerLayerManager,
        this.markerMultiSelectionManager,
      ).then(({ drawingManagerService }) => {
        this.drawingManagerService = drawingManagerService;
        const queuedOperations = [...this.drawingOperationQueue];
        this.drawingOperationQueue = [];
        queuedOperations.forEach((operation) => {
          operation(drawingManagerService);
        });
        return drawingManagerService;
      });
    }

    return this.drawingManagerServicePromise;
  }

  private queueDrawingOperation(operation: (service: DrawingManagerService) => void) {
    if (this.drawingManagerService) {
      operation(this.drawingManagerService);
      return;
    }

    this.drawingOperationQueue.push(operation);
    void this.ensureDrawing();
  }

  private applyPendingClusterLayer(layerId: string) {
    const pending = this.pendingClusterLayers.get(layerId);
    if (!pending || !this.clusterLayerManager) {
      return;
    }

    this.clusterLayerManager.setLayer(layerId, pending.orders, pending.options);
    this.markerSelectionManager.reconcileSelectionState();
    this.markerSelectionManager.reapplySelectionStyles();
    this.markerMultiSelectionManager.syncLayerStyles(layerId);
  }

  resize() {
    this.mapInstanceManager.resize(() => {
      this.viewportManager.applyViewportInsets();
    });
  }

  private bindBoundsChangedListener() {
    this.boundsSubscription?.remove?.();
    const map = this.mapInstanceManager.getMap();
    if (!map || !google?.maps?.event?.addListener) {
      return;
    }

    this.boundsSubscription = google.maps.event.addListener(
      map,
      "bounds_changed",
      () => {
        if (this.boundsEmitRafHandle !== null) {
          cancelAnimationFrame(this.boundsEmitRafHandle);
        }

        this.boundsEmitRafHandle = requestAnimationFrame(() => {
          this.boundsEmitRafHandle = null;
          this.emitBoundsChanged();
        });
      },
    );
  }

  private emitBoundsChanged() {
    const bounds = this.resolveBounds();
    this.boundsChangedListeners.forEach((listener) => listener(bounds));
  }

  private resolveBounds(): MapBounds | null {
    const map = this.mapInstanceManager.getMap();
    const bounds = map?.getBounds?.();
    if (!bounds) {
      return null;
    }

    const northEast = bounds.getNorthEast?.();
    const southWest = bounds.getSouthWest?.();
    if (!northEast || !southWest) {
      return null;
    }

    return {
      north: northEast.lat(),
      east: northEast.lng(),
      south: southWest.lat(),
      west: southWest.lng(),
    };
  }
}
