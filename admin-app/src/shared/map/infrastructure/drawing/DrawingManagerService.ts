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

export class DrawingManagerService {
  private drawingManager: any = null;
  private activeShape: any = null;
  private circleSelectionCallback: ((ids: string[]) => void) | null = null;
  private circleSelectionLayerId: string | null = null;
  private shapeListeners: any[] = [];
  private drawingCompleteListener: any = null;
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

    this.ensureDrawingManager();

    if (!this.drawingManager) return;

    this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
  }

  disableCircleSelection() {
    this.circleSelectionCallback = null;

    this.clearShapeListeners();
    if (this.activeShape) {
      this.activeShape.setMap(null);
      this.activeShape = null;
    }

    if (this.drawingManager) {
      this.drawingManager.setDrawingMode(null);
    }

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

    this.ensureDrawingManager();

    if (!this.drawingManager) return;

    this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
  }

  disableZoneCapture() {
    this.zoneCaptureCallback = null;
    this.isZoneCaptureMode = false;

    this.clearShapeListeners();
    if (this.activeShape) {
      this.activeShape.setMap(null);
      this.activeShape = null;
    }

    if (this.drawingManager) {
      this.drawingManager.setDrawingMode(null);
    }
  }

  enableZonePathEdit(
    geometry: GeoJSONPolygon,
    options: ZonePathEditOptions,
  ) {
    const map = this.mapInstanceManager.getMap();
    if (!map) return;

    if (this.circleSelectionLayerId) {
      this.disableCircleSelection();
    }

    this.disableZoneCapture();
    this.zonePathEditOptions = options;
    this.isZonePathEditMode = true;

    this.ensureDrawingManager();
    this.clearActiveShape();

    const polygon = this.createEditablePolygonOverlay(geometry);
    if (!polygon) {
      this.isZonePathEditMode = false;
      this.zonePathEditOptions = null;
      return;
    }

    this.activeShape = polygon;
    this.bindPathEditListeners(polygon, geometry.type);

    if (this.drawingManager) {
      this.drawingManager.setDrawingMode(null);
    }
  }

  disableZonePathEdit() {
    this.zonePathEditOptions = null;
    this.isZonePathEditMode = false;
    this.clearActiveShape();

    if (this.drawingManager) {
      this.drawingManager.setDrawingMode(null);
    }
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

    if (this.drawingCompleteListener) {
      this.drawingCompleteListener.remove?.();
      google.maps.event.removeListener(this.drawingCompleteListener);
      this.drawingCompleteListener = null;
    }

    if (this.drawingManager) {
      this.drawingManager.setMap(null);
      this.drawingManager = null;
    }

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

  private ensureDrawingManager() {
    const map = this.mapInstanceManager.getMap();
    if (!map) return;

    if (!google.maps.drawing?.DrawingManager) {
      console.error("Google Maps drawing library is not loaded");
      return;
    }

    if (!this.drawingManager) {
      const sharedOverlayStyle = {
        editable: true,
        fillColor: DEFAULT_ZONE_FILL_COLOR,
        fillOpacity: 0.12,
        strokeColor: DEFAULT_ZONE_STROKE_COLOR,
        strokeOpacity: 0.9,
        strokeWeight: 2,
      };

      this.drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        circleOptions: {
          ...sharedOverlayStyle,
          draggable: true,
        },
        rectangleOptions: sharedOverlayStyle,
        polygonOptions: sharedOverlayStyle,
      });
      this.drawingManager.setMap(map);
    }

    if (!this.drawingCompleteListener) {
      this.drawingCompleteListener = google.maps.event.addListener(
        this.drawingManager,
        "overlaycomplete",
        (event: any) => {
          this.handleOverlayComplete(event);
        },
      );
    }

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

  private handleOverlayComplete(event: any) {
    const overlay = event?.overlay;
    const overlayType = event?.type;

    this.clearShapeListeners();

    if (this.activeShape) {
      this.activeShape.setMap(null);
    }

    this.activeShape = overlay;

    if (this.isZoneCaptureMode) {
      this.handleZoneCaptureComplete(overlay, overlayType);
    } else {
      if (overlayType === google.maps.drawing.OverlayType.CIRCLE) {
        overlay?.setEditable?.(true);
        overlay?.setDraggable?.(true);
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
      } else if (overlayType === google.maps.drawing.OverlayType.RECTANGLE) {
        overlay?.setEditable?.(true);
        this.shapeListeners.push(
          google.maps.event.addListener(overlay, "bounds_changed", () =>
            this.computeRectangleSelection(overlay),
          ),
        );
        this.computeRectangleSelection(overlay);
      } else if (overlayType === google.maps.drawing.OverlayType.POLYGON) {
        overlay?.setEditable?.(true);
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
    }

    if (this.drawingManager) {
      this.drawingManager.setDrawingMode(null);
    }
  }

  private computeCircleSelection(circle: any) {
    this.shapeSelectionService.computeCircleSelection(circle, {
      activeLayerId: this.circleSelectionLayerId,
      callback: this.circleSelectionCallback,
    });
  }

  private computeRectangleSelection(rectangle: any) {
    this.shapeSelectionService.computeRectangleSelection(rectangle, {
      activeLayerId: this.circleSelectionLayerId,
      callback: this.circleSelectionCallback,
    });
  }

  private computePolygonSelection(polygon: any) {
    this.shapeSelectionService.computePolygonSelection(polygon, {
      activeLayerId: this.circleSelectionLayerId,
      callback: this.circleSelectionCallback,
    });
  }

  private handleDrawingModeSelection = (event: Event) => {
    if (!this.drawingManager) {
      return;
    }

    if (this.isZoneCaptureMode || this.isZonePathEditMode) {
      const detail = (event as CustomEvent<DrawingSelectionModeEventDetail>)
        .detail;
      const overlayType = this.resolveOverlayType(detail?.mode);

      if (!overlayType) {
        return;
      }

      this.clearActiveShape();
      this.drawingManager.setDrawingMode(overlayType);
      return;
    }

    if (!this.circleSelectionLayerId || !this.circleSelectionCallback) {
      return;
    }

    const detail = (event as CustomEvent<DrawingSelectionModeEventDetail>)
      .detail;
    const mode = detail?.mode;
    const overlayType = this.resolveOverlayType(mode);

    if (!overlayType) {
      return;
    }

    this.clearActiveShapeSelection();
    this.drawingManager.setDrawingMode(overlayType);
  };

  private handleDrawingSelectionClear = () => {
    if (!this.drawingManager) {
      return;
    }

    if (
      !this.isZoneCaptureMode &&
      (!this.circleSelectionLayerId || !this.circleSelectionCallback)
    ) {
      return;
    }

    if (this.isZoneCaptureMode) {
      this.clearActiveShape();
    } else if (this.isZonePathEditMode) {
      return;
    } else {
      this.clearActiveShapeSelection();
    }

    if (this.drawingManager) {
      this.drawingManager.setDrawingMode(null);
    }
  };

  private resolveOverlayType(mode: DrawingSelectionMode | undefined) {
    if (mode === "rectangle") {
      return google.maps.drawing.OverlayType.RECTANGLE;
    }
    if (mode === "polygon") {
      return google.maps.drawing.OverlayType.POLYGON;
    }
    if (mode === "circle") {
      return google.maps.drawing.OverlayType.CIRCLE;
    }
    return null;
  }

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

  private handleZoneCaptureComplete(overlay: any, overlayType: any) {
    if (!this.zoneCaptureCallback || !overlay) return;

    let geometry: GeoJSONPolygon | null = null;

    if (overlayType === google.maps.drawing.OverlayType.CIRCLE) {
      geometry = ZoneGeometryExtractor.fromCircle(overlay);
    } else if (overlayType === google.maps.drawing.OverlayType.RECTANGLE) {
      geometry = ZoneGeometryExtractor.fromRectangle(overlay);
    } else if (overlayType === google.maps.drawing.OverlayType.POLYGON) {
      geometry = ZoneGeometryExtractor.fromPolygon(overlay);
    }

    if (geometry) {
      this.zoneCaptureCallback(geometry);
    }
  }

  private clearShapeListeners() {
    this.shapeListeners.forEach((listener) => {
      listener?.remove?.();
      google.maps.event.removeListener(listener);
    });
    this.shapeListeners = [];
  }

  private createEditablePolygonOverlay(geometry: GeoJSONPolygon) {
    const map = this.mapInstanceManager.getMap();
    const PolygonCtor = (globalThis as any)?.google?.maps?.Polygon;
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
        (point): point is { lat: number; lng: number } =>
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

  private bindPathEditListeners(polygon: any, geometryType: GeoJSONPolygon["type"]) {
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
    polygon: any,
    geometryType: GeoJSONPolygon["type"],
  ): GeoJSONPolygon {
    const polygonGeometry = ZoneGeometryExtractor.fromPolygon(polygon);
    if (geometryType === "MultiPolygon") {
      return {
        type: "MultiPolygon",
        coordinates: [polygonGeometry.coordinates] as GeoJSONPolygon["coordinates"],
      };
    }

    return polygonGeometry;
  }
}
