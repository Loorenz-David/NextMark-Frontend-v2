import {
  DRAWING_SELECTION_CLEAR_EVENT,
  DRAWING_SELECTION_MODE_EVENT,
  type DrawingSelectionMode,
  type DrawingSelectionModeEventDetail,
} from "../../domain/constants/drawingSelectionModes";
import type { GeoJSONPolygon } from "@/features/zone/types";
import type { ZonePathEditOptions } from "../../domain/types";
import type { MapInstanceManager } from "../core/MapInstanceManager";
import type { MarkerMultiSelectionManager } from "../markers/MarkerMultiSelectionManager";
import type { ShapeSelectionService } from "./ShapeSelectionService";
import { ZoneGeometryExtractor } from "./ZoneGeometryExtractor";

const DEFAULT_ZONE_STROKE_COLOR = "#111111";
const DEFAULT_ZONE_FILL_COLOR = "#111111";

type LatLngLiteral = { lat: number; lng: number };

type LatLngValue =
  | LatLngLiteral
  | { lat: () => number; lng: () => number };

type DrawingMap = google.maps.Map & {
  get?: (property: string) => unknown;
  setOptions: (options: Record<string, unknown>) => void;
};

type DrawingBounds = {
  extend?: (point: LatLngLiteral) => void;
  getNorthEast?: () => LatLngValue;
  getSouthWest?: () => LatLngValue;
};

type DrawingOverlay = {
  getBounds?: () => DrawingBounds | null;
  getPath?: () => unknown;
  getRadius?: () => number;
  setBounds?: (bounds: unknown) => void;
  setDraggable?: (draggable: boolean) => void;
  setEditable?: (editable: boolean) => void;
  setMap: (map: google.maps.Map | null) => void;
  setOptions?: (options: Record<string, unknown>) => void;
  setPath?: (path: LatLngLiteral[]) => void;
  setRadius?: (radius: number) => void;
};

type DrawingConstructors = {
  Circle?: new (options: Record<string, unknown>) => DrawingOverlay;
  LatLngBounds?: new () => DrawingBounds;
  Polygon?: new (options: Record<string, unknown>) => DrawingOverlay;
  Rectangle?: new (options: Record<string, unknown>) => DrawingOverlay;
};

type DrawingMapMouseEvent = {
  domEvent?: Event;
  latLng?: LatLngValue;
};

type MapInteractionState = {
  disableDoubleClickZoom: unknown;
  draggable: unknown;
  draggableCursor: unknown;
};

export class DrawingManagerService {
  private activeShape: DrawingOverlay | null = null;
  private draftShape: DrawingOverlay | null = null;
  private drawingStart: LatLngLiteral | null = null;
  private polygonPoints: LatLngLiteral[] = [];
  private drawingListeners: google.maps.MapsEventListener[] = [];
  private mapInteractionState: MapInteractionState | null = null;
  private circleSelectionCallback: ((ids: string[]) => void) | null = null;
  private circleSelectionLayerId: string | null = null;
  private shapeListeners: google.maps.MapsEventListener[] = [];
  private hasDrawingModeListener = false;
  private hasDrawingClearListener = false;
  private zoneCaptureCallback: ((geometry: GeoJSONPolygon) => void) | null =
    null;
  private isZoneCaptureMode = false;
  private zonePathEditOptions: ZonePathEditOptions | null = null;
  private isZonePathEditMode = false;
  private mapInstanceManager: MapInstanceManager;
  private shapeSelectionService: ShapeSelectionService;
  private markerMultiSelectionManager: MarkerMultiSelectionManager;

  constructor(
    mapInstanceManager: MapInstanceManager,
    shapeSelectionService: ShapeSelectionService,
    markerMultiSelectionManager: MarkerMultiSelectionManager,
  ) {
    this.mapInstanceManager = mapInstanceManager;
    this.shapeSelectionService = shapeSelectionService;
    this.markerMultiSelectionManager = markerMultiSelectionManager;
  }

  enableCircleSelection(params: {
    layerId: string;
    callback: (ids: string[]) => void;
  }) {
    if (!this.mapInstanceManager.getMap()) return;

    if (this.isZoneCaptureMode) {
      this.disableZoneCapture();
    }

    this.circleSelectionCallback = params.callback;
    this.circleSelectionLayerId = params.layerId;
    this.markerMultiSelectionManager.setActiveLayer(params.layerId);

    this.ensureDrawingRuntime();
    this.setDrawingMode("circle");
  }

  disableCircleSelection() {
    this.circleSelectionCallback = null;
    this.setDrawingMode(null);
    this.clearActiveShape();

    this.markerMultiSelectionManager.clearMultiSelectionStyles(
      this.circleSelectionLayerId ?? undefined,
    );
    this.markerMultiSelectionManager.clearSelectedIds();
    this.circleSelectionLayerId = null;
    this.markerMultiSelectionManager.setActiveLayer(null);
  }

  enableZoneCapture(callback: (geometry: GeoJSONPolygon) => void) {
    if (!this.mapInstanceManager.getMap()) return;

    if (this.circleSelectionLayerId) {
      this.disableCircleSelection();
    }

    this.zoneCaptureCallback = callback;
    this.isZoneCaptureMode = true;

    this.ensureDrawingRuntime();
    this.setDrawingMode("polygon");
  }

  disableZoneCapture() {
    this.zoneCaptureCallback = null;
    this.isZoneCaptureMode = false;
    this.setDrawingMode(null);
    this.clearActiveShape();
  }

  enableZonePathEdit(
    geometry: GeoJSONPolygon,
    options: ZonePathEditOptions,
  ) {
    const map = this.getDrawingMap();
    if (!map) return;

    if (this.circleSelectionLayerId) {
      this.disableCircleSelection();
    }

    this.disableZoneCapture();
    this.zonePathEditOptions = options;
    this.isZonePathEditMode = true;

    this.ensureDrawingRuntime();
    this.setDrawingMode(null);
    this.clearActiveShape();

    const polygon = this.createEditablePolygonOverlay(geometry);
    if (!polygon) {
      this.isZonePathEditMode = false;
      this.zonePathEditOptions = null;
      return;
    }

    this.activeShape = polygon;
    this.bindPathEditListeners(polygon, geometry.type);
  }

  disableZonePathEdit() {
    this.zonePathEditOptions = null;
    this.isZonePathEditMode = false;
    this.setDrawingMode(null);
    this.clearActiveShape();
  }

  handleLayerCleared(layerId: string) {
    if (layerId !== this.circleSelectionLayerId) {
      return;
    }

    this.markerMultiSelectionManager.clearMultiSelectionStyles(layerId);
    this.markerMultiSelectionManager.clearSelectedIds();
  }

  destroy() {
    this.disableCircleSelection();
    this.disableZoneCapture();
    this.disableZonePathEdit();

    if (this.hasDrawingModeListener && typeof window !== "undefined") {
      window.removeEventListener(
        DRAWING_SELECTION_MODE_EVENT,
        this.handleDrawingModeSelection as EventListener,
      );
      this.hasDrawingModeListener = false;
    }

    if (this.hasDrawingClearListener && typeof window !== "undefined") {
      window.removeEventListener(
        DRAWING_SELECTION_CLEAR_EVENT,
        this.handleDrawingSelectionClear as EventListener,
      );
      this.hasDrawingClearListener = false;
    }
  }

  getActiveLayerId() {
    return this.circleSelectionLayerId;
  }

  private ensureDrawingRuntime() {
    if (!this.mapInstanceManager.getMap()) return;

    if (!this.hasDrawingModeListener && typeof window !== "undefined") {
      window.addEventListener(
        DRAWING_SELECTION_MODE_EVENT,
        this.handleDrawingModeSelection as EventListener,
      );
      this.hasDrawingModeListener = true;
    }

    if (!this.hasDrawingClearListener && typeof window !== "undefined") {
      window.addEventListener(
        DRAWING_SELECTION_CLEAR_EVENT,
        this.handleDrawingSelectionClear as EventListener,
      );
      this.hasDrawingClearListener = true;
    }
  }

  private setDrawingMode(mode: DrawingSelectionMode | null) {
    this.clearDrawingInteraction();

    if (!mode) {
      return;
    }

    const map = this.getDrawingMap();
    if (!map) {
      return;
    }

    this.captureMapInteractionState(map);
    const drawingOptions: Record<string, unknown> = {
      disableDoubleClickZoom: mode === "polygon",
      draggableCursor: "crosshair",
    };
    if (mode !== "polygon") {
      drawingOptions.draggable = false;
    }
    map.setOptions(drawingOptions);

    if (mode === "polygon") {
      this.bindPolygonDrawing(map);
      return;
    }

    this.bindDragDrawing(map, mode);
  }

  private bindDragDrawing(
    map: DrawingMap,
    mode: Extract<DrawingSelectionMode, "circle" | "rectangle">,
  ) {
    this.drawingListeners.push(
      google.maps.event.addListener(map, "mousedown", (event: DrawingMapMouseEvent) => {
        const start = this.toLatLngLiteral(event?.latLng);
        if (!start) return;

        this.removeDraftShape();
        this.drawingStart = start;
        this.draftShape = this.createDraftShape(mode, start);
      }),
    );
    this.drawingListeners.push(
      google.maps.event.addListener(map, "mousemove", (event: DrawingMapMouseEvent) => {
        const current = this.toLatLngLiteral(event?.latLng);
        if (!current || !this.drawingStart || !this.draftShape) return;

        this.updateDraftShape(mode, this.drawingStart, current);
      }),
    );
    this.drawingListeners.push(
      google.maps.event.addListener(map, "mouseup", (event: DrawingMapMouseEvent) => {
        const current = this.toLatLngLiteral(event?.latLng);
        if (!current || !this.drawingStart || !this.draftShape) return;

        this.updateDraftShape(mode, this.drawingStart, current);
        const overlay = this.draftShape;
        this.draftShape = null;
        this.drawingStart = null;

        if (!this.isValidCompletedShape(mode, overlay)) {
          overlay.setMap?.(null);
          return;
        }

        this.handleOverlayComplete(overlay, mode);
      }),
    );
  }

  private bindPolygonDrawing(map: DrawingMap) {
    this.polygonPoints = [];
    this.drawingListeners.push(
      google.maps.event.addListener(map, "click", (event: DrawingMapMouseEvent) => {
        const point = this.toLatLngLiteral(event?.latLng);
        if (!point) return;

        const previousPoint = this.polygonPoints.at(-1);
        if (previousPoint && this.areSamePoint(previousPoint, point)) {
          return;
        }

        this.polygonPoints.push(point);
        if (!this.draftShape) {
          this.draftShape = this.createPolygon(this.polygonPoints, false);
          return;
        }

        this.draftShape.setPath?.(this.polygonPoints);
      }),
    );
    this.drawingListeners.push(
      google.maps.event.addListener(map, "dblclick", (event: DrawingMapMouseEvent) => {
        event?.domEvent?.preventDefault?.();
        const point = this.toLatLngLiteral(event?.latLng);
        if (point) {
          const previousPoint = this.polygonPoints.at(-1);
          if (!previousPoint || !this.areSamePoint(previousPoint, point)) {
            this.polygonPoints.push(point);
          }
        }

        if (this.polygonPoints.length < 3) {
          return;
        }

        const overlay = this.draftShape;
        this.draftShape = null;
        if (!overlay) return;

        overlay.setPath?.(this.polygonPoints);
        this.polygonPoints = [];
        this.handleOverlayComplete(overlay, "polygon");
      }),
    );
  }

  private createDraftShape(
    mode: Extract<DrawingSelectionMode, "circle" | "rectangle">,
    start: LatLngLiteral,
  ) {
    const map = this.getDrawingMap();
    const maps = google.maps as unknown as DrawingConstructors;
    if (!map || !maps) return null;

    if (mode === "circle" && maps.Circle) {
      return new maps.Circle({
        ...this.getSharedOverlayStyle(),
        center: start,
        clickable: false,
        draggable: false,
        editable: false,
        map,
        radius: 0,
      });
    }

    if (mode === "rectangle" && maps.Rectangle) {
      return new maps.Rectangle({
        ...this.getSharedOverlayStyle(),
        bounds: this.createBounds(start, start),
        clickable: false,
        editable: false,
        map,
      });
    }

    return null;
  }

  private createPolygon(paths: LatLngLiteral[], editable: boolean) {
    const map = this.getDrawingMap();
    const PolygonCtor = (google.maps as unknown as DrawingConstructors).Polygon;
    if (!map || !PolygonCtor) return null;

    return new PolygonCtor({
      ...this.getSharedOverlayStyle(),
      clickable: false,
      editable,
      map,
      paths,
    });
  }

  private updateDraftShape(
    mode: Extract<DrawingSelectionMode, "circle" | "rectangle">,
    start: LatLngLiteral,
    current: LatLngLiteral,
  ) {
    if (mode === "circle") {
      this.draftShape?.setRadius?.(this.computeDistanceMeters(start, current));
      return;
    }

    this.draftShape?.setBounds?.(this.createBounds(start, current));
  }

  private handleOverlayComplete(
    overlay: DrawingOverlay,
    overlayType: DrawingSelectionMode,
  ) {
    this.clearShapeListeners();

    if (this.activeShape && this.activeShape !== overlay) {
      this.activeShape.setMap(null);
    }

    this.activeShape = overlay;
    overlay.setOptions?.({ clickable: true });
    overlay.setEditable?.(true);
    if (overlayType === "circle") {
      overlay.setDraggable?.(true);
    }

    if (this.isZoneCaptureMode) {
      this.handleZoneCaptureComplete(overlay, overlayType);
    } else if (overlayType === "circle") {
      this.shapeListeners.push(
        google.maps.event.addListener(overlay, "center_changed", () =>
          this.computeCircleSelection(overlay),
        ),
      );
      this.shapeListeners.push(
        google.maps.event.addListener(overlay, "radius_changed", () =>
          this.computeCircleSelection(overlay),
        ),
      );
      this.computeCircleSelection(overlay);
    } else if (overlayType === "rectangle") {
      this.shapeListeners.push(
        google.maps.event.addListener(overlay, "bounds_changed", () =>
          this.computeRectangleSelection(overlay),
        ),
      );
      this.computeRectangleSelection(overlay);
    } else {
      const path = overlay?.getPath?.();

      if (path) {
        this.shapeListeners.push(
          google.maps.event.addListener(path, "set_at", () =>
            this.computePolygonSelection(overlay),
          ),
        );
        this.shapeListeners.push(
          google.maps.event.addListener(path, "insert_at", () =>
            this.computePolygonSelection(overlay),
          ),
        );
        this.shapeListeners.push(
          google.maps.event.addListener(path, "remove_at", () =>
            this.computePolygonSelection(overlay),
          ),
        );
      }

      this.computePolygonSelection(overlay);
    }

    this.setDrawingMode(null);
  }

  private computeCircleSelection(circle: DrawingOverlay) {
    this.shapeSelectionService.computeCircleSelection(circle, {
      activeLayerId: this.circleSelectionLayerId,
      callback: this.circleSelectionCallback,
    });
  }

  private computeRectangleSelection(rectangle: DrawingOverlay) {
    this.shapeSelectionService.computeRectangleSelection(rectangle, {
      activeLayerId: this.circleSelectionLayerId,
      callback: this.circleSelectionCallback,
    });
  }

  private computePolygonSelection(polygon: DrawingOverlay) {
    this.shapeSelectionService.computePolygonSelection(polygon, {
      activeLayerId: this.circleSelectionLayerId,
      callback: this.circleSelectionCallback,
    });
  }

  private handleDrawingModeSelection = (event: Event) => {
    const detail = (event as CustomEvent<DrawingSelectionModeEventDetail>)
      .detail;
    const mode = detail?.mode;
    if (!mode) return;

    if (this.isZoneCaptureMode) {
      this.clearActiveShape();
      this.setDrawingMode(mode);
      return;
    }

    if (
      this.isZonePathEditMode ||
      !this.circleSelectionLayerId ||
      !this.circleSelectionCallback
    ) {
      return;
    }

    this.clearActiveShapeSelection();
    this.setDrawingMode(mode);
  };

  private handleDrawingSelectionClear = () => {
    if (this.isZonePathEditMode) {
      return;
    }

    if (this.isZoneCaptureMode) {
      this.clearActiveShape();
    } else if (this.circleSelectionLayerId && this.circleSelectionCallback) {
      this.clearActiveShapeSelection();
    } else {
      return;
    }

    this.setDrawingMode(null);
  };

  private clearActiveShapeSelection() {
    this.clearActiveShape();

    this.markerMultiSelectionManager.clearMultiSelectionStyles(
      this.circleSelectionLayerId ?? undefined,
    );
    this.markerMultiSelectionManager.clearSelectedIds();
    this.circleSelectionCallback?.([]);
  }

  private clearActiveShape() {
    this.clearShapeListeners();
    if (this.activeShape) {
      this.activeShape.setMap(null);
      this.activeShape = null;
    }
  }

  private handleZoneCaptureComplete(
    overlay: DrawingOverlay,
    overlayType: DrawingSelectionMode,
  ) {
    if (!this.zoneCaptureCallback || !overlay) return;

    let geometry: GeoJSONPolygon | null = null;

    if (overlayType === "circle") {
      geometry = ZoneGeometryExtractor.fromCircle(overlay);
    } else if (overlayType === "rectangle") {
      geometry = ZoneGeometryExtractor.fromRectangle(overlay);
    } else {
      geometry = ZoneGeometryExtractor.fromPolygon(overlay);
    }

    if (geometry) {
      this.zoneCaptureCallback(geometry);
    }
  }

  private clearDrawingInteraction() {
    this.drawingListeners.forEach((listener) => {
      listener?.remove?.();
      google.maps.event.removeListener(listener);
    });
    this.drawingListeners = [];
    this.drawingStart = null;
    this.polygonPoints = [];
    this.removeDraftShape();
    this.restoreMapInteractionState();
  }

  private removeDraftShape() {
    if (this.draftShape) {
      this.draftShape.setMap?.(null);
      this.draftShape = null;
    }
  }

  private clearShapeListeners() {
    this.shapeListeners.forEach((listener) => {
      listener?.remove?.();
      google.maps.event.removeListener(listener);
    });
    this.shapeListeners = [];
  }

  private captureMapInteractionState(map: DrawingMap) {
    this.mapInteractionState = {
      disableDoubleClickZoom: map.get?.("disableDoubleClickZoom"),
      draggable: map.get?.("draggable"),
      draggableCursor: map.get?.("draggableCursor"),
    };
  }

  private restoreMapInteractionState() {
    const map = this.getDrawingMap();
    if (!map || !this.mapInteractionState) return;

    map.setOptions(this.mapInteractionState);
    this.mapInteractionState = null;
  }

  private getSharedOverlayStyle() {
    return {
      fillColor: DEFAULT_ZONE_FILL_COLOR,
      fillOpacity: 0.12,
      strokeColor: DEFAULT_ZONE_STROKE_COLOR,
      strokeOpacity: 0.9,
      strokeWeight: 2,
    };
  }

  private getDrawingMap() {
    return this.mapInstanceManager.getMap() as DrawingMap | null;
  }

  private createBounds(first: LatLngLiteral, second: LatLngLiteral) {
    const LatLngBoundsCtor = (google.maps as unknown as DrawingConstructors)
      .LatLngBounds;
    if (LatLngBoundsCtor) {
      const bounds = new LatLngBoundsCtor();
      bounds.extend?.(first);
      bounds.extend?.(second);
      return bounds;
    }

    return {
      east: Math.max(first.lng, second.lng),
      north: Math.max(first.lat, second.lat),
      south: Math.min(first.lat, second.lat),
      west: Math.min(first.lng, second.lng),
    };
  }

  private computeDistanceMeters(
    first: LatLngLiteral,
    second: LatLngLiteral,
  ) {
    const spherical = google.maps.geometry?.spherical;
    if (spherical?.computeDistanceBetween) {
      return spherical.computeDistanceBetween(first, second);
    }

    const earthRadiusMeters = 6_371_000;
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const latitudeDelta = toRadians(second.lat - first.lat);
    const longitudeDelta = toRadians(second.lng - first.lng);
    const firstLatitude = toRadians(first.lat);
    const secondLatitude = toRadians(second.lat);
    const haversine =
      Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(firstLatitude) *
        Math.cos(secondLatitude) *
        Math.sin(longitudeDelta / 2) ** 2;

    return (
      earthRadiusMeters *
      2 *
      Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
    );
  }

  private isValidCompletedShape(
    mode: Extract<DrawingSelectionMode, "circle" | "rectangle">,
    overlay: DrawingOverlay,
  ) {
    if (mode === "circle") {
      return Number(overlay?.getRadius?.()) > 0;
    }

    const bounds = overlay?.getBounds?.();
    const northEast = this.toLatLngLiteral(bounds?.getNorthEast?.());
    const southWest = this.toLatLngLiteral(bounds?.getSouthWest?.());
    return (
      northEast &&
      southWest &&
      (northEast.lat !== southWest.lat || northEast.lng !== southWest.lng)
    );
  }

  private toLatLngLiteral(value: unknown): LatLngLiteral | null {
    if (!value || typeof value !== "object") return null;

    const candidate = value as {
      lat?: number | (() => number);
      lng?: number | (() => number);
    };
    const lat =
      typeof candidate.lat === "function" ? candidate.lat() : candidate.lat;
    const lng =
      typeof candidate.lng === "function" ? candidate.lng() : candidate.lng;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat: Number(lat), lng: Number(lng) };
  }

  private areSamePoint(first: LatLngLiteral, second: LatLngLiteral) {
    return first.lat === second.lat && first.lng === second.lng;
  }

  private createEditablePolygonOverlay(geometry: GeoJSONPolygon) {
    const map = this.getDrawingMap();
    const PolygonCtor = (google.maps as unknown as DrawingConstructors).Polygon;
    if (!map || !PolygonCtor) {
      return null;
    }

    const coordinates =
      geometry.type === "MultiPolygon"
        ? geometry.coordinates?.[0]
        : geometry.coordinates;
    const exteriorRing = Array.isArray(coordinates) ? coordinates[0] : null;
    if (!Array.isArray(exteriorRing)) {
      return null;
    }

    const paths = exteriorRing
      .map((point) => {
        if (!Array.isArray(point) || point.length < 2) {
          return null;
        }
        return { lat: Number(point[1]), lng: Number(point[0]) };
      })
      .filter(
        (point): point is LatLngLiteral =>
          point != null &&
          Number.isFinite(point.lat) &&
          Number.isFinite(point.lng),
      );

    if (paths.length < 3) {
      return null;
    }

    return new PolygonCtor({
      map,
      paths,
      editable: true,
      clickable: false,
      strokeColor: DEFAULT_ZONE_STROKE_COLOR,
      strokeOpacity: 0.9,
      strokeWeight: 2,
      fillColor: DEFAULT_ZONE_FILL_COLOR,
      fillOpacity: 0.12,
      zIndex: 3,
    });
  }

  private bindPathEditListeners(
    polygon: DrawingOverlay,
    geometryType: GeoJSONPolygon["type"],
  ) {
    const path = polygon?.getPath?.();
    if (!path || !this.zonePathEditOptions) {
      return;
    }

    const notifyGeometryChange = () => {
      if (!this.zonePathEditOptions) {
        return;
      }

      this.zonePathEditOptions.onGeometryChange(
        this.extractPathEditGeometry(polygon, geometryType),
      );
    };

    this.shapeListeners.push(
      google.maps.event.addListener(path, "set_at", notifyGeometryChange),
    );
    this.shapeListeners.push(
      google.maps.event.addListener(path, "insert_at", notifyGeometryChange),
    );
    this.shapeListeners.push(
      google.maps.event.addListener(path, "remove_at", notifyGeometryChange),
    );
  }

  private extractPathEditGeometry(
    polygon: DrawingOverlay,
    geometryType: GeoJSONPolygon["type"],
  ): GeoJSONPolygon {
    const polygonGeometry = ZoneGeometryExtractor.fromPolygon(polygon);
    if (geometryType === "MultiPolygon") {
      return {
        type: "MultiPolygon",
        coordinates: [
          polygonGeometry.coordinates,
        ] as GeoJSONPolygon["coordinates"],
      };
    }

    return polygonGeometry;
  }
}
