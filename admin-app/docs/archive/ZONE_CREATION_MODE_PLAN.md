# Zone Creation Mode — Implementation Plan

> **Status:** ARCHIVED — implementation completed 2026-03-27.
> **Archived on:** 2026-03-27.
> **Source of truth:** `docs/implemented/ZONE_ROUTEGROUP_ARCHITECTURE.md`
>
> This document is preserved for historical reference only. Do not use it to guide further changes.

---

> **Original status:** Ready for implementation — updated with backend endpoint handoff 2026-03-27.
> **Author:** Architecture session 2026-03-27.
> **Target:** GitHub Copilot (worker).
>
> Read this document fully before touching any file.
> Follow the task order. Do not skip ahead.
> When a task is complete, verify imports compile before moving to the next.
>
> **Architecture contracts to keep open while working:**
>
> - `Front_end/engineering-contracts/02.development.contract.md`
> - `Front_end/engineering-contracts/03.refinement.contract.md`
> - `Front_end/admin-app/docs/implemented/ZONE_ROUTEGROUP_ARCHITECTURE.md`

---

## PART 1 — CONTEXT

### What exists today

The `features/zone/` module has:

- Types (`ZoneDefinition`, `ZoneVersion`, `ZoneTemplate`, `ZoneTemplateConfig`, `GeoJSONPolygon`)
- API client (`zoneApi`) with endpoints for versions, zones, and templates
- Zustand store (`useZoneStore`) with versions, zones, selected IDs, and loading flags
- `ZoneManagementPage` — an admin page that is **not what we are building**. It is unused in the home flow.
- `ZonePolygonOverlay` in the plan/routeGroup feature — renders a **single** zone polygon snapshot for the selected route group. Unrelated to zone creation mode.

The `shared/map/` infrastructure has:

- `DrawingManagerService` — manages Google Maps Drawing Manager for circle, rectangle, and polygon drawing. Currently used exclusively for **marker selection** (captures which markers fall inside a drawn shape).
- `MapController` — facade for the adapter.
- `GoogleMapAdapter` — composes all map sub-services.
- `MapMultiSelectOverlay` — reusable UI component (button → panel pattern) used by both `OrderMapOverlay` and `RouteGroupMapOverlay`.
- `DRAWING_SELECTION_MODE_EVENT` / `DRAWING_SELECTION_CLEAR_EVENT` — window custom events for switching drawing modes.

The `OrderMapOverlay` renders `MapMultiSelectOverlay` at `absolute left-4 top-4`. The zone entry button must render at `absolute right-4 top-4` as a separate standalone component.

### What we are building

A **zone creation mode** accessible from the home map overlay. When active:

- The user draws shapes on the map (circle / rectangle / polygon) to define zone boundaries.
- After drawing, the user opens a form popup to name the zone and set template defaults.
- Existing zones are rendered as polygons on the map with labels.
- Hovering a zone shows a tooltip with its template defaults.
- Tapping a zone opens the same form in edit mode — name and template defaults are both editable (backend now supports PATCH for zone name and geometry).
- Zones can be deleted from the edit form (backend now supports DELETE).
- Zone creation and deletion use an optimistic pattern.

### Backend endpoint update (2026-03-27)

The backend has shipped two new endpoints and one response shape correction since this plan was first written. These are now included in scope:

| Method   | Path                                         | Purpose                                                            |
| -------- | -------------------------------------------- | ------------------------------------------------------------------ |
| `PATCH`  | `/api_v2/zones/{version_id}/zones/{zone_id}` | Update zone name, geometry, centroid, bounds — all fields optional |
| `DELETE` | `/api_v2/zones/{version_id}/zones/{zone_id}` | Delete zone — blocked if route groups derived from it exist        |

The `PUT /api_v2/zones/{version_id}/zones` (create) response now includes `template: null` for shape parity with the list endpoint. The `zoneApi.createZone` type mapping must account for this.

Backend constraint: **only zones in inactive versions are editable or deletable.** The UI must handle the resulting 410 error with a message explaining the constraint.

### What we are NOT building in this phase

- Geometry reshaping for existing zones (pre-seeding the drawing manager with an existing polygon path) — deferred to a future phase.
- Zone polygon visible outside zone mode (background layer in route operations map).
- Zone version management UI in the home flow.
- Zone polygon drawing in mobile.

---

## PART 2 — ARCHITECTURE DECISIONS

### Decision 1 — Zone capture mode lives in `DrawingManagerService`

The existing `DrawingManagerService` handles `overlaycomplete` and routes to marker selection. We extend it with a second exclusive mode: **zone capture**. In zone capture mode, `overlaycomplete` extracts the shape's geometry as a `GeoJSONPolygon` and calls a geometry callback. The shape stays on the map (so the user can see it) until explicitly cleared.

The two modes — marker selection and zone capture — are mutually exclusive. Only one can be active at a time.

A new utility `ZoneGeometryExtractor` (a pure class, no state) handles the shape → GeoJSON conversion for all three shape types.

### Decision 2 — Zone polygons on the map use a dedicated zone layer in `GoogleMapAdapter`

`setZonePolygonOverlay` already exists and renders a single polygon for route group zone snapshots. Zone creation mode needs to render **N polygons** with per-polygon hover and click events. This is a different capability. We add `setZoneLayer` / `clearZoneLayer` to `GoogleMapAdapter` and `MapController`. The zone layer creates one `google.maps.Polygon` per zone with listeners attached.

Zone labels are rendered as `google.maps.marker.AdvancedMarkerElement` text markers at each zone's centroid. They are managed alongside the polygon layer.

### Decision 3 — Zone hover tooltip is a fixed-position overlay card, not a floating map tooltip

Projecting map coordinates to screen pixels requires tracking pan/zoom events and recalculating position continuously. Instead, the hover tooltip renders as a fixed card in the overlay area (bottom-right corner of the map). When `hoveredZoneId` is non-null, the card shows that zone's name and template defaults. This is simpler, still communicates the right information, and stays within the React rendering model.

### Decision 4 — `isZoneMode` lives in `useZoneStore`, not local component state

The selection mode guard (`mapSelectionModeGuard.flow.ts`) observes order and route group selection stores to resolve conflicts. Zone mode must be observable by the same guard without prop drilling. Adding `isZoneMode` to `useZoneStore` gives the guard a clean subscription point.

### Decision 5 — Zone form popup handles both create and edit via a single popup key

The popup key `'zone.form'` accepts a typed payload: `{ mode: 'create'; geometry: GeoJSONPolygon; versionId: number } | { mode: 'edit'; zoneId: number; versionId: number }`. The form renders the same fields in both modes. In edit mode, the name field is read-only (no backend PATCH for zone name in this phase) and only `ZoneTemplateConfig` fields are submitted via `zoneApi.upsertZoneTemplate`.

### Decision 6 — Circle shapes are approximated as polygons in GeoJSON

GeoJSON has no native circle type. When the user draws a circle, `ZoneGeometryExtractor` approximates it as a 64-point polygon ring computed from the circle's center and radius. Rectangles and polygons convert directly.

### Decision 7 — `ZoneMapOverlay` is a standalone component rendered alongside `OrderMapOverlay`

The zone button must not live inside `OrderMapOverlay` — that component owns order selection concerns. `ZoneMapOverlay` is a separate component rendered in parallel. In `HomeDesktopView`, the `mapOverlay` composition becomes:

```tsx
mapOverlay={
  derivedState.isRouteOperationsOverlayActive
    ? <RouteGroupMapOverlay />
    : (
        <>
          <OrderMapOverlay />
          <ZoneMapOverlay />
        </>
      )
}
```

---

## PART 3 — FILE CHANGE MAP

### New files

| File                                                         | Purpose                                                                          |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `shared/map/infrastructure/drawing/ZoneGeometryExtractor.ts` | Pure utility — converts Google Maps circle/rectangle/polygon to `GeoJSONPolygon` |
| `features/zone/controllers/useZoneModeController.ts`         | Orchestrates zone mode: mode state, drawing capture, zone loading, form dispatch |
| `features/zone/actions/createZone.action.ts`                 | Optimistic zone create                                                           |
| `features/zone/actions/updateZone.action.ts`                 | Optimistic zone update — name, geometry, and template via PATCH                  |
| `features/zone/actions/deleteZone.action.ts`                 | Optimistic zone delete                                                           |
| `features/zone/components/ZoneMapOverlay.tsx`                | Entry button (top-right) + active drawing panel                                  |
| `features/zone/components/ZonePolygonLayer.tsx`              | Renders all store zones as map polygons with labels                              |
| `features/zone/components/ZoneHoverCard.tsx`                 | Fixed-position hover info card for hovered zone                                  |
| `features/zone/forms/zoneForm/ZoneForm.tsx`                  | Name + template defaults form fields                                             |
| `features/zone/forms/zoneForm/ZoneForm.popup.tsx`            | Popup wrapper — create and edit modes, with delete button in edit mode           |
| `features/zone/registry/zone.popups.registry.ts`             | `{ 'zone.form': ZoneFormPopup }`                                                 |

### Modified files

| File                                                                 | What changes                                                                                                                                                            |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/map/infrastructure/drawing/DrawingManagerService.ts`         | Add `enableZoneCapture`, `disableZoneCapture`, zone capture path in `handleOverlayComplete`                                                                             |
| `shared/map/infrastructure/GoogleMapAdapter.ts`                      | Add `setZoneLayer`, `clearZoneLayer`                                                                                                                                    |
| `shared/map/domain/services/MapController.ts`                        | Expose `enableZoneCapture`, `disableZoneCapture`, `setZoneLayer`, `clearZoneLayer`                                                                                      |
| `shared/map/domain/types.ts`                                         | Add `ZoneLayerOptions` interface                                                                                                                                        |
| `features/zone/store/zone.store.ts`                                  | Add `isZoneMode`, `drawnGeometry`, `hoveredZoneId`; add `upsertZone`, `removeZoneOptimistic`, `removeZoneById`, `setIsZoneMode`, `setDrawnGeometry`, `setHoveredZoneId` |
| `features/zone/api/zone.api.ts`                                      | Add `updateZone` (PATCH) and `deleteZone` (DELETE) methods                                                                                                              |
| `features/zone/index.ts`                                             | Export new components, controller, actions, registry                                                                                                                    |
| `features/home-route-operations/registry/homePopups.ts`              | Merge `zonePopupRegistry`                                                                                                                                               |
| `features/home-route-operations/views/HomeDesktopView.tsx`           | Render `ZoneMapOverlay` alongside `OrderMapOverlay`                                                                                                                     |
| `features/home-route-operations/flows/mapSelectionModeGuard.flow.ts` | Extend conflict resolution to include zone mode                                                                                                                         |

### Files that stay the same

| File                                                                  | Why unchanged                                      |
| --------------------------------------------------------------------- | -------------------------------------------------- |
| `features/zone/types/zone.ts`                                         | Types are already correct                          |
| `features/zone/pages/ZoneManagement.page.tsx`                         | Separate admin page — untouched                    |
| `features/plan/routeGroup/components/overlays/ZonePolygonOverlay.tsx` | Single-polygon route group overlay — untouched     |
| `shared/map/infrastructure/drawing/ShapeSelectionService.ts`          | Marker selection logic — untouched                 |
| `shared/map/components/MapMultiSelectOverlay.tsx`                     | Reusable component — not modified, just referenced |

---

## PART 4 — IMPLEMENTATION TASKS

Follow this order exactly. Each task depends on the previous.

---

### TASK 1 — Add `ZoneGeometryExtractor`

**File (new):** `src/shared/map/infrastructure/drawing/ZoneGeometryExtractor.ts`

Create a pure class with three static methods. No state, no side effects, no imports beyond the `GeoJSONPolygon` type from `features/zone/types`.

```ts
import type { GeoJSONPolygon } from "@/features/zone/types";

export class ZoneGeometryExtractor {
  static fromCircle(circle: google.maps.Circle): GeoJSONPolygon;
  static fromRectangle(rectangle: google.maps.Rectangle): GeoJSONPolygon;
  static fromPolygon(polygon: google.maps.Polygon): GeoJSONPolygon;
}
```

**`fromCircle`:** Approximate the circle as a 64-point polygon ring.

- Get `center: google.maps.LatLng` from `circle.getCenter()`
- Get `radius: number` from `circle.getRadius()` (meters)
- For `i = 0..63`: compute `angle = (i / 64) * 2 * Math.PI`, offset lat/lng using spherical math
- Close the ring by repeating the first coordinate at the end
- Return `{ type: 'Polygon', coordinates: [ring] }`

Spherical offset formula:

```
const earthRadius = 6378137
const dLat = (radius / earthRadius) * (180 / Math.PI)
const dLng = dLat / Math.cos((center.lat() * Math.PI) / 180)
lat = center.lat() + dLat * Math.sin(angle)
lng = center.lng() + dLng * Math.cos(angle)
```

**`fromRectangle`:** Extract bounds and produce a 5-point closed ring (sw → nw → ne → se → sw).

- `const bounds = rectangle.getBounds()`
- `const sw = bounds.getSouthWest()`, `const ne = bounds.getNorthEast()`
- Ring: `[[sw.lng, sw.lat], [sw.lng, ne.lat], [ne.lng, ne.lat], [ne.lng, sw.lat], [sw.lng, sw.lat]]`
- Return `{ type: 'Polygon', coordinates: [ring] }`

**`fromPolygon`:** Extract path as coordinate ring.

- `const path = polygon.getPath()`
- Map each `LatLng` to `[lng, lat]` (GeoJSON is [lng, lat] order)
- Close by appending the first coordinate
- Return `{ type: 'Polygon', coordinates: [ring] }`

**Constraints:**

- GeoJSON coordinate order is always `[longitude, latitude]` — do not reverse.
- Return type is always `{ type: 'Polygon' }`, never `MultiPolygon` (that is a server concern).

---

### TASK 2 — Extend `DrawingManagerService` with zone capture mode

**File (modify):** `src/shared/map/infrastructure/drawing/DrawingManagerService.ts`

Add the following to the class — do not touch any existing methods or properties:

**New private fields:**

```ts
private zoneCaptureCallback: ((geometry: GeoJSONPolygon) => void) | null = null
private isZoneCaptureMode = false
```

**New public methods:**

`enableZoneCapture(callback: (geometry: GeoJSONPolygon) => void): void`

- Sets `this.zoneCaptureCallback = callback` and `this.isZoneCaptureMode = true`
- Calls `this.ensureDrawingManager()`
- Sets drawing mode to `google.maps.drawing.OverlayType.POLYGON` as the default start mode
- Does **not** call `this.markerMultiSelectionManager.setActiveLayer` — zone capture does not interact with marker selection

`disableZoneCapture(): void`

- Sets `this.zoneCaptureCallback = null` and `this.isZoneCaptureMode = false`
- Removes the active shape from the map (`this.activeShape?.setMap(null); this.activeShape = null`)
- Clears shape listeners (`this.clearShapeListeners()`)
- Resets drawing manager mode to null

**Modify `handleOverlayComplete`:** After the existing null-safety guard, branch on `this.isZoneCaptureMode`:

```ts
private handleOverlayComplete(event: any) {
  const overlay = event?.overlay
  const overlayType = event?.type

  this.clearShapeListeners()
  if (this.activeShape) {
    this.activeShape.setMap(null)
  }
  this.activeShape = overlay

  if (this.isZoneCaptureMode) {
    this.handleZoneCaptureComplete(overlay, overlayType)
  } else {
    // existing marker selection logic — unchanged
    if (overlayType === google.maps.drawing.OverlayType.CIRCLE) { ... }
    ...
  }

  if (this.drawingManager) {
    this.drawingManager.setDrawingMode(null)
  }
}
```

**New private method `handleZoneCaptureComplete`:**

```ts
private handleZoneCaptureComplete(overlay: any, overlayType: any) {
  if (!this.zoneCaptureCallback || !overlay) return

  let geometry: GeoJSONPolygon | null = null

  if (overlayType === google.maps.drawing.OverlayType.CIRCLE) {
    geometry = ZoneGeometryExtractor.fromCircle(overlay)
  } else if (overlayType === google.maps.drawing.OverlayType.RECTANGLE) {
    geometry = ZoneGeometryExtractor.fromRectangle(overlay)
  } else if (overlayType === google.maps.drawing.OverlayType.POLYGON) {
    geometry = ZoneGeometryExtractor.fromPolygon(overlay)
  }

  if (geometry) {
    this.zoneCaptureCallback(geometry)
  }
}
```

Also modify `handleDrawingModeSelection` — it currently switches mode only when `circleSelectionLayerId` is set. Add a parallel guard for zone capture mode:

```ts
private handleDrawingModeSelection = (event: Event) => {
  if (!this.drawingManager) return

  // zone capture mode
  if (this.isZoneCaptureMode) {
    const detail = (event as CustomEvent<DrawingSelectionModeEventDetail>).detail
    const overlayType = this.resolveOverlayType(detail?.mode)
    if (!overlayType) return
    this.clearActiveShape()
    this.drawingManager.setDrawingMode(overlayType)
    return
  }

  // existing marker selection guard — unchanged
  if (!this.circleSelectionLayerId || !this.circleSelectionCallback) return
  ...
}
```

Add a helper `clearActiveShape` (used by both modes):

```ts
private clearActiveShape() {
  this.clearShapeListeners()
  if (this.activeShape) {
    this.activeShape.setMap(null)
    this.activeShape = null
  }
}
```

Import `ZoneGeometryExtractor` and `GeoJSONPolygon` at the top.

**Constraints:**

- Do not change any existing method signatures.
- Zone capture mode and marker selection mode are mutually exclusive — only one `is*` flag can be true at a time. `enableZoneCapture` must call `disableCircleSelection()` first if `circleSelectionLayerId` is non-null. `enableCircleSelection` must call `disableZoneCapture()` first if `isZoneCaptureMode` is true.

---

### TASK 3 — Extend `GoogleMapAdapter` with zone layer

**File (modify):** `src/shared/map/infrastructure/GoogleMapAdapter.ts`

Add two new fields:

```ts
private zonePolygons: google.maps.Polygon[] = []
private zoneLabelMarkers: google.maps.marker.AdvancedMarkerElement[] = []
```

Add these methods (do not touch existing methods):

```ts
setZoneLayer(
  zones: ZoneDefinition[],
  options: {
    onHover: (zoneId: number | null) => void
    onClick: (zoneId: number) => void
  }
): void
```

Implementation:

1. Call `this.clearZoneLayer()` to remove previous polygons.
2. For each zone in `zones`:
   - Skip zones without `geometry` or without `id`.
   - Normalize coordinates: `GeoJSONPolygon` uses `[lng, lat]` — Google Maps needs `{ lat, lng }`. The outer ring of `geometry.coordinates[0]` is the exterior ring.
   - Create `new google.maps.Polygon` with:
     ```ts
     {
       paths: exteriorRing,  // array of { lat, lng }
       map: this.mapInstance,
       fillColor: '#2563eb',
       fillOpacity: 0.08,
       strokeColor: '#3b82f6',
       strokeOpacity: 0.7,
       strokeWeight: 2,
     }
     ```
   - Add `mouseover` listener: calls `options.onHover(zone.id)`
   - Add `mouseout` listener: calls `options.onHover(null)`
   - Add `click` listener: calls `options.onClick(zone.id)`
   - Push to `this.zonePolygons`.
   - If `zone.centroid_lat` and `zone.centroid_lng` are numbers: create an `AdvancedMarkerElement` with a `div` element containing the zone name as text (small label, white, semi-transparent background). Push to `this.zoneLabelMarkers`.

```ts
clearZoneLayer(): void
```

Implementation:

1. For each polygon in `this.zonePolygons`: remove all listeners (`google.maps.event.clearInstanceListeners(p)`), call `p.setMap(null)`.
2. Set `this.zonePolygons = []`.
3. For each label marker in `this.zoneLabelMarkers`: call `marker.map = null`.
4. Set `this.zoneLabelMarkers = []`.

Also add these two methods to the `MapAdapter` interface in `shared/map/domain/types.ts`:

```ts
setZoneLayer(zones: ZoneDefinition[], options: ZoneLayerOptions): void
clearZoneLayer(): void
```

And add the `ZoneLayerOptions` type to `types.ts`:

```ts
import type { ZoneDefinition } from "@/features/zone/types";

export type ZoneLayerOptions = {
  onHover: (zoneId: number | null) => void;
  onClick: (zoneId: number) => void;
};
```

**Constraints:**

- Import `ZoneDefinition` from `@/features/zone/types` — not from a deep path.
- Do not call `clearZonePolygonOverlay` inside `clearZoneLayer` — they are separate layers.
- Call `clearZoneLayer` inside the existing `destroy` method.

---

### TASK 4 — Expose zone layer and zone capture on `MapController`

**File (modify):** `src/shared/map/domain/services/MapController.ts`

Add four methods (keep existing methods unchanged):

```ts
enableZoneCapture(callback: (geometry: GeoJSONPolygon) => void): void {
  this.adapter.enableZoneCapture(callback)
}

disableZoneCapture(): void {
  this.adapter.disableZoneCapture()
}

setZoneLayer(zones: ZoneDefinition[], options: ZoneLayerOptions): void {
  this.adapter.setZoneLayer(zones, options)
}

clearZoneLayer(): void {
  this.adapter.clearZoneLayer()
}
```

Also add these four method signatures to the `MapAdapter` interface in `types.ts`.

Note: `GoogleMapAdapter` delegates `enableZoneCapture` and `disableZoneCapture` to `this.drawingManagerService`. Add these two delegating methods to `GoogleMapAdapter`:

```ts
enableZoneCapture(callback: (geometry: GeoJSONPolygon) => void): void {
  this.drawingManagerService.enableZoneCapture(callback)
}

disableZoneCapture(): void {
  this.drawingManagerService.disableZoneCapture()
}
```

---

### TASK 5 — Extend `useZoneStore` with zone mode state

**File (modify):** `src/features/zone/store/zone.store.ts`

Add to `ZoneStoreState`:

```ts
// Zone mode
isZoneMode: boolean
drawnGeometry: GeoJSONPolygon | null
hoveredZoneId: number | null
setIsZoneMode: (isZoneMode: boolean) => void
setDrawnGeometry: (geometry: GeoJSONPolygon | null) => void
setHoveredZoneId: (zoneId: number | null) => void

// Optimistic zone mutations
upsertZone: (zone: ZoneDefinition) => void
removeZoneOptimistic: (zoneId: number) => void  // rollback: remove by temporary negative ID
removeZoneById: (zoneId: number) => void         // confirmed delete: remove by real server ID
```

Add to `initialState`:

```ts
isZoneMode: false,
drawnGeometry: null,
hoveredZoneId: null,
```

Add to `create` body:

```ts
setIsZoneMode: (isZoneMode) => set(() => ({ isZoneMode })),
setDrawnGeometry: (drawnGeometry) => set(() => ({ drawnGeometry })),
setHoveredZoneId: (hoveredZoneId) => set(() => ({ hoveredZoneId })),
upsertZone: (zone) =>
  set((state) => {
    const exists = state.zones.some((z) => z.id === zone.id)
    if (exists) {
      return { zones: state.zones.map((z) => (z.id === zone.id ? zone : z)) }
    }
    return { zones: [...state.zones, zone] }
  }),
removeZoneOptimistic: (zoneId) =>
  set((state) => ({
    zones: state.zones.filter((z) => z.id !== zoneId),
  })),
removeZoneById: (zoneId) =>
  set((state) => ({
    zones: state.zones.filter((z) => z.id !== zoneId),
  })),
```

Add a zone mode selector:

```ts
export const selectIsZoneMode = (state: ZoneStoreState) => state.isZoneMode;
```

Update `reset` to include new fields:

```ts
reset: () => set(() => ({ ...initialState })),
```

The `initialState` object already includes `isZoneMode: false`, `drawnGeometry: null`, `hoveredZoneId: null` so `reset` handles them automatically.

**Constraints:**

- `upsertZone` matches by `zone.id` — not by `clientId`. The optimistic flow uses a temporary negative ID (e.g., `Date.now() * -1`) as the optimistic `id`. The action replaces it with the server ID on success.
- `removeZoneOptimistic` is only called on action failure (rollback of a temp ID). Do not call it on success.
- `removeZoneById` is called on confirmed delete success (real server ID). These are two distinct operations and must not be conflated.

---

### TASK 6 — Add `updateZone` and `deleteZone` to `zoneApi`

**File (modify):** `src/features/zone/api/zone.api.ts`

Add the following types and methods. Do not touch existing methods.

```ts
type UpdateZonePayload = {
  name?: string;
  geometry?: GeoJSONPolygon | null;
  centroid_lat?: number | null;
  centroid_lng?: number | null;
  min_lat?: number | null;
  max_lat?: number | null;
  min_lng?: number | null;
  max_lng?: number | null;
};

type DeleteZoneResult = {
  deleted: boolean;
  zone_id: number;
};
```

Add to the `zoneApi` object:

```ts
updateZone: (
  versionId: number,
  zoneId: number,
  payload: UpdateZonePayload,
): Promise<ApiResult<ZoneDefinition>> =>
  apiClient.request<ZoneDefinition>({
    path: `/zones/${versionId}/zones/${zoneId}`,
    method: 'PATCH',
    data: payload,
  }),

deleteZone: (
  versionId: number,
  zoneId: number,
): Promise<ApiResult<DeleteZoneResult>> =>
  apiClient.request<DeleteZoneResult>({
    path: `/zones/${versionId}/zones/${zoneId}`,
    method: 'DELETE',
  }),
```

Import `GeoJSONPolygon` from `@/features/zone/types` — it is already imported via the type barrel.

**Backend constraint note:** Both endpoints return HTTP 410 if the zone's version is active. The `apiClient` will throw on non-2xx responses. The action layer handles this error and shows a specific message.

---

### TASK 7 — Create `createZone.action.ts`

**File (new):** `src/features/zone/actions/createZone.action.ts`

```ts
import type {
  ZoneDefinition,
  ZoneTemplateConfig,
  GeoJSONPolygon,
} from "@/features/zone/types";
import { zoneApi } from "@/features/zone/api/zone.api";

export type CreateZoneCommand = {
  versionId: number;
  name: string;
  geometry: GeoJSONPolygon;
  templateConfig: ZoneTemplateConfig | null;
};

export type CreateZoneDeps = {
  upsertZone: (zone: ZoneDefinition) => void;
  removeZoneOptimistic: (zoneId: number) => void;
  showMessage: (params: { status: number; message: string }) => void;
};

export async function createZoneAction(
  command: CreateZoneCommand,
  deps: CreateZoneDeps,
): Promise<ZoneDefinition | null> {
  const optimisticId = Date.now() * -1;

  const optimisticZone: ZoneDefinition = {
    id: optimisticId,
    name: command.name,
    geometry: command.geometry,
    zone_type: "manual",
  };

  deps.upsertZone(optimisticZone);

  try {
    const centroid = computeCentroid(command.geometry);

    const response = await zoneApi.createZone(command.versionId, {
      name: command.name,
      zone_type: "manual",
      geometry: command.geometry,
      centroid_lat: centroid?.lat ?? null,
      centroid_lng: centroid?.lng ?? null,
      min_lat: null,
      max_lat: null,
      min_lng: null,
      max_lng: null,
    });

    const createdZone = response.data;
    if (!createdZone) throw new Error("No zone returned from server");

    deps.removeZoneOptimistic(optimisticId);
    deps.upsertZone(createdZone);

    // If template config provided, upsert template after zone is created
    if (command.templateConfig && typeof createdZone.id === "number") {
      await zoneApi.upsertZoneTemplate(command.versionId, createdZone.id, {
        name: command.name,
        config_json: command.templateConfig,
      });
    }

    return createdZone;
  } catch {
    deps.removeZoneOptimistic(optimisticId);
    deps.showMessage({
      status: 500,
      message: "Failed to create zone. Please try again.",
    });
    return null;
  }
}

function computeCentroid(
  geometry: GeoJSONPolygon,
): { lat: number; lng: number } | null {
  const ring = geometry.coordinates[0];
  if (!Array.isArray(ring) || ring.length === 0) return null;

  let lngSum = 0;
  let latSum = 0;
  const n = ring.length;

  for (const point of ring) {
    if (Array.isArray(point) && point.length >= 2) {
      lngSum += point[0] as number;
      latSum += point[1] as number;
    }
  }

  return { lat: latSum / n, lng: lngSum / n };
}
```

---

### TASK 8 — Create `updateZone.action.ts`

**File (new):** `src/features/zone/actions/updateZone.action.ts`

Now covers both name and template defaults via two coordinated calls: `PATCH` for zone fields and `PUT` for the template. Both are optional — only send if the values changed.

```ts
import type { ZoneDefinition, ZoneTemplateConfig } from "@/features/zone/types";
import { zoneApi } from "@/features/zone/api/zone.api";

export type UpdateZoneCommand = {
  versionId: number;
  zone: ZoneDefinition & { id: number };
  name: string; // new name (may be same as current)
  templateConfig: ZoneTemplateConfig | null;
};

export type UpdateZoneDeps = {
  upsertZone: (zone: ZoneDefinition) => void;
  showMessage: (params: { status: number; message: string }) => void;
};

export async function updateZoneAction(
  command: UpdateZoneCommand,
  deps: UpdateZoneDeps,
): Promise<void> {
  const optimisticZone: ZoneDefinition = {
    ...command.zone,
    name: command.name,
    template: command.templateConfig
      ? { ...command.zone.template, config_json: command.templateConfig }
      : (command.zone.template ?? null),
  };

  deps.upsertZone(optimisticZone);

  try {
    // PATCH zone fields if name changed
    if (command.name !== command.zone.name) {
      const patchResponse = await zoneApi.updateZone(
        command.versionId,
        command.zone.id,
        { name: command.name },
      );
      if (patchResponse.data) {
        deps.upsertZone({ ...optimisticZone, ...patchResponse.data });
      }
    }

    // PUT template if config provided
    if (command.templateConfig) {
      const templateResponse = await zoneApi.upsertZoneTemplate(
        command.versionId,
        command.zone.id,
        { name: command.name, config_json: command.templateConfig },
      );
      if (templateResponse.data) {
        deps.upsertZone({ ...optimisticZone, template: templateResponse.data });
      }
    }
  } catch (error: unknown) {
    deps.upsertZone(command.zone); // rollback to pre-edit state
    const isVersionActiveError =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      (error as { status: number }).status === 410;

    deps.showMessage({
      status: isVersionActiveError ? 410 : 500,
      message: isVersionActiveError
        ? "This zone cannot be edited because its version is active."
        : "Failed to update zone. Please try again.",
    });
  }
}
```

---

### TASK 9 — Create `deleteZone.action.ts`

**File (new):** `src/features/zone/actions/deleteZone.action.ts`

```ts
import type { ZoneDefinition } from "@/features/zone/types";
import { zoneApi } from "@/features/zone/api/zone.api";

export type DeleteZoneCommand = {
  versionId: number;
  zone: ZoneDefinition & { id: number };
};

export type DeleteZoneDeps = {
  upsertZone: (zone: ZoneDefinition) => void; // for rollback
  removeZoneById: (zoneId: number) => void;
  showMessage: (params: { status: number; message: string }) => void;
};

export async function deleteZoneAction(
  command: DeleteZoneCommand,
  deps: DeleteZoneDeps,
): Promise<void> {
  // Optimistic: remove from store immediately
  deps.removeZoneById(command.zone.id);

  try {
    await zoneApi.deleteZone(command.versionId, command.zone.id);
    // confirmed — zone is already removed from store, nothing more needed
  } catch (error: unknown) {
    // Rollback: put the zone back
    deps.upsertZone(command.zone);

    const isVersionActiveError =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      (error as { status: number }).status === 410;

    const isDerivedError =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code: unknown }).code === "string" &&
      (error as { code: string }).code.includes("DERIVED");

    deps.showMessage({
      status: isVersionActiveError || isDerivedError ? 410 : 500,
      message: isVersionActiveError
        ? "This zone cannot be deleted because its version is active."
        : isDerivedError
          ? "This zone cannot be deleted because route groups derived from it still exist."
          : "Failed to delete zone. Please try again.",
    });
  }
}
```

---

### TASK 10 — Create `ZoneForm.tsx` and `ZoneForm.popup.tsx`

**File (new):** `src/features/zone/forms/zoneForm/ZoneForm.tsx`

The form renders two sections: identity and template defaults.

```ts
export type ZoneFormFields = {
  name: string;
  vehicle_type_id: string; // string for input, parsed to number on submit
  default_service_time_seconds: string;
  depot_id: string;
  max_stops: string;
};

type ZoneFormProps = {
  initialValues: Partial<ZoneFormFields>;
  isSubmitting: boolean;
  isDeleting?: boolean;
  onSubmit: (fields: ZoneFormFields) => void;
  onDelete?: () => void; // only provided in edit mode
  onCancel: () => void;
  submitLabel: string;
};
```

- `name` field: text input, required in both create and edit modes. The backend now supports PATCH for zone name so it is always editable.
- Template fields: all optional numeric inputs (vehicle_type_id, default_service_time_seconds, depot_id, max_stops). Display as labeled number inputs with empty string as blank state.
- Form uses uncontrolled `useState` for each field locally.
- `onSubmit` is called with the raw `ZoneFormFields` — the popup wrapper does the parsing.
- If `onDelete` is provided, render a destructive "Delete Zone" button below the main actions. This button calls `onDelete` and is disabled while `isDeleting` is true.

**File (new):** `src/features/zone/forms/zoneForm/ZoneForm.popup.tsx`

```ts
export type ZoneFormPayload =
  | { mode: "create"; geometry: GeoJSONPolygon; versionId: number }
  | { mode: "edit"; zoneId: number; versionId: number };
```

The popup wrapper:

- Reads its payload from the popup manager props (follow the same pattern as `PlanForm` popup — look at `src/features/plan/forms/planForm/` for reference).
- In `create` mode: renders `ZoneForm` with empty initial values, calls `createZoneAction` on submit, closes popup on success.
- In `edit` mode: reads the zone from `useZoneStore` by `zoneId`, pre-fills `ZoneFormFields` from `zone.name` and `zone.template?.config_json`, calls `updateZoneAction` on submit, closes popup on success. Passes `onDelete` which calls `deleteZoneAction` — on success, closes the popup.
- Uses `useMessageHandler` for error display.
- Uses `upsertZone`, `removeZoneOptimistic`, and `removeZoneById` from `useZoneStore` as action deps.
- Tracks separate `isSubmitting` and `isDeleting` states — they must not share the same boolean.

---

### TASK 11 — Create `zone.popups.registry.ts`

**File (new):** `src/features/zone/registry/zone.popups.registry.ts`

```ts
import { ZoneFormPopup } from "@/features/zone/forms/zoneForm/ZoneForm.popup";

export const zonePopupRegistry = {
  "zone.form": ZoneFormPopup,
} as const;
```

**File (modify):** `src/features/home-route-operations/registry/homePopups.ts`

Add the zone registry:

```ts
import { zonePopupRegistry } from "@/features/zone/registry/zone.popups.registry";

export const homePopupRegistry = {
  ...planPopupRegistry,
  ...orderPopupRegistry,
  ...costumerPopupRegistry,
  ...zonePopupRegistry,
};
```

---

### TASK 12 — Create `useZoneModeController`

**File (new):** `src/features/zone/controllers/useZoneModeController.ts`

This controller orchestrates zone mode. It is consumed by `ZoneMapOverlay` and `ZonePolygonLayer`.

```ts
import { useEffect, useCallback } from "react";
import {
  useMapManager,
  usePopupManager,
} from "@/shared/resource-manager/useResourceManager";
import { useMessageHandler } from "@shared-message-handler";
import {
  useZoneStore,
  selectActiveZoneVersion,
} from "@/features/zone/store/zone.store";
import { zoneApi } from "@/features/zone/api/zone.api";
import type { GeoJSONPolygon } from "@/features/zone/types";

export function useZoneModeController() {
  const mapManager = useMapManager();
  const popupManager = usePopupManager();
  const { showMessage } = useMessageHandler();

  const {
    isZoneMode,
    zones,
    drawnGeometry,
    hoveredZoneId,
    isLoadingZones,
    setIsZoneMode,
    setDrawnGeometry,
    setHoveredZoneId,
    setZones,
    setLoadingZones,
    upsertZone,
    removeZoneOptimistic,
  } = useZoneStore();

  const activeVersion = useZoneStore(selectActiveZoneVersion);

  // Load zones when entering zone mode if not already loaded
  useEffect(() => {
    if (!isZoneMode) return;
    if (typeof activeVersion?.id !== "number") return;
    if (zones.length > 0) return;

    let active = true;
    setLoadingZones(true);

    zoneApi
      .fetchZonesForVersion(activeVersion.id)
      .then((response) => {
        if (!active) return;
        setZones(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        if (!active) return;
        showMessage({ status: 500, message: "Failed to load zones." });
      })
      .finally(() => {
        if (active) setLoadingZones(false);
      });

    return () => {
      active = false;
    };
  }, [isZoneMode, activeVersion?.id]);

  // Sync zone layer on the map when zones change in zone mode
  useEffect(() => {
    if (!isZoneMode) {
      mapManager.clearZoneLayer();
      return;
    }

    mapManager.setZoneLayer(zones, {
      onHover: setHoveredZoneId,
      onClick: (zoneId) => {
        if (typeof activeVersion?.id !== "number") return;
        popupManager.open({
          key: "zone.form",
          payload: { mode: "edit", zoneId, versionId: activeVersion.id },
        });
      },
    });

    return () => {
      mapManager.clearZoneLayer();
    };
  }, [isZoneMode, zones, activeVersion?.id]);

  // Enable/disable drawing capture when zone mode changes
  useEffect(() => {
    if (!isZoneMode) {
      mapManager.disableZoneCapture();
      setDrawnGeometry(null);
      return;
    }

    mapManager.enableZoneCapture((geometry: GeoJSONPolygon) => {
      setDrawnGeometry(geometry);
    });

    return () => {
      mapManager.disableZoneCapture();
    };
  }, [isZoneMode]);

  const enterZoneMode = useCallback(() => {
    setIsZoneMode(true);
  }, [setIsZoneMode]);

  const exitZoneMode = useCallback(() => {
    setIsZoneMode(false);
    setDrawnGeometry(null);
    setHoveredZoneId(null);
  }, [setIsZoneMode, setDrawnGeometry, setHoveredZoneId]);

  const discardShape = useCallback(() => {
    mapManager.disableZoneCapture();
    setDrawnGeometry(null);
    // Re-enable after discarding so user can draw again
    mapManager.enableZoneCapture((geometry: GeoJSONPolygon) => {
      setDrawnGeometry(geometry);
    });
  }, [mapManager, setDrawnGeometry]);

  const openCreateForm = useCallback(() => {
    if (!drawnGeometry || typeof activeVersion?.id !== "number") return;
    popupManager.open({
      key: "zone.form",
      payload: {
        mode: "create",
        geometry: drawnGeometry,
        versionId: activeVersion.id,
      },
    });
  }, [drawnGeometry, activeVersion?.id, popupManager]);

  return {
    isZoneMode,
    drawnGeometry,
    hoveredZoneId,
    isLoadingZones,
    enterZoneMode,
    exitZoneMode,
    discardShape,
    openCreateForm,
    upsertZone,
    removeZoneOptimistic,
  };
}
```

**Constraints:**

- The `useEffect` for zone layer sync must return a cleanup that calls `clearZoneLayer`. Zone polygons must not persist on the map after exiting zone mode.
- Do not call `fetchZonesForVersion` if `zones.length > 0` — avoid re-fetching already loaded data.
- `mapManager` here is the result of `useMapManager()` which returns a `MapController` instance — confirm this is the case by checking `useResourceManager`.

---

### TASK 13 — Create `ZoneHoverCard`

**File (new):** `src/features/zone/components/ZoneHoverCard.tsx`

```ts
type ZoneHoverCardProps = {
  zoneId: number | null;
};
```

- Reads `zones` from `useZoneStore`.
- Finds zone by `zoneId`.
- If `zoneId` is null or zone not found: renders nothing (`return null`).
- Renders a fixed-position card at the bottom-right of the map overlay:

```tsx
<div className="pointer-events-none absolute bottom-4 right-4 z-10 w-56 rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-page)]/95 p-3 shadow-lg backdrop-blur-sm">
  <p className="mb-2 text-sm font-semibold text-[var(--color-muted)]">
    {zone.name}
  </p>
  <div className="space-y-1 text-xs text-[var(--color-muted)]/70">
    {/* Render template config fields if present */}
    {config?.vehicle_type_id != null && (
      <p>Vehicle type: {config.vehicle_type_id}</p>
    )}
    {config?.max_stops != null && <p>Max stops: {config.max_stops}</p>}
    {config?.depot_id != null && <p>Depot: {config.depot_id}</p>}
    {config?.default_service_time_seconds != null && (
      <p>Service time: {config.default_service_time_seconds}s</p>
    )}
    {!config && (
      <p className="text-[var(--color-muted)]/40">No defaults configured</p>
    )}
  </div>
</div>
```

Where `config = zone.template?.config_json ?? null`.

---

### TASK 14 — Create `ZonePolygonLayer`

**File (new):** `src/features/zone/components/ZonePolygonLayer.tsx`

This component is a React effect bridge — it has no visual output. It syncs zone store state to the map layer via the controller.

```tsx
import { useZoneModeController } from "@/features/zone/controllers/useZoneModeController";
import { useZoneStore } from "@/features/zone/store/zone.store";
import { ZoneHoverCard } from "./ZoneHoverCard";

export const ZonePolygonLayer = () => {
  const { hoveredZoneId } = useZoneStore();
  // Zone layer sync is handled inside useZoneModeController.
  // This component only renders the hover card.
  return <ZoneHoverCard zoneId={hoveredZoneId} />;
};
```

Note: the actual map layer sync (`setZoneLayer` / `clearZoneLayer`) lives in `useZoneModeController`. `ZonePolygonLayer` exists as a composition point that renders the hover card alongside the map layer effect. The controller is already mounted by `ZoneMapOverlay` — do not call it again here. Instead, pass `hoveredZoneId` directly from the store.

---

### TASK 15 — Create `ZoneMapOverlay`

**File (new):** `src/features/zone/components/ZoneMapOverlay.tsx`

This is the primary entry point for the zone creation mode UI.

Layout:

- **Inactive (zone mode off):** A single button at `absolute right-4 top-4` with a zones/layer icon and label "Zones".
- **Active (zone mode on):** A panel at `absolute right-4 top-4` with:
  - Close button (top-left of panel, calls `exitZoneMode`)
  - Title: "Zone Mode"
  - Shape picker row: three buttons — `polygon`, `rectangle`, `circle`. Each dispatches `DRAWING_SELECTION_MODE_EVENT`. Active shape is highlighted.
  - If `drawnGeometry` is null: instruction row "Draw a zone boundary on the map"
  - If `drawnGeometry` is not null:
    - "Discard shape" button (calls `discardShape`)
    - "Create Zone" primary button (calls `openCreateForm`)

```tsx
import { useState } from "react";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { CloseIcon } from "@/assets/icons";
import {
  DRAWING_SELECTION_MODE_EVENT,
  type DrawingSelectionMode,
} from "@/shared/map/domain/constants/drawingSelectionModes";
import { useZoneModeController } from "@/features/zone/controllers/useZoneModeController";
import { ZonePolygonLayer } from "./ZonePolygonLayer";

export const ZoneMapOverlay = () => {
  const {
    isZoneMode,
    drawnGeometry,
    enterZoneMode,
    exitZoneMode,
    discardShape,
    openCreateForm,
  } = useZoneModeController();

  const [activeShape, setActiveShape] =
    useState<DrawingSelectionMode>("polygon");

  const handleShapeSelect = (mode: DrawingSelectionMode) => {
    setActiveShape(mode);
    window.dispatchEvent(
      new CustomEvent(DRAWING_SELECTION_MODE_EVENT, { detail: { mode } }),
    );
  };

  if (!isZoneMode) {
    return (
      <div className="pointer-events-auto absolute right-4 top-4 z-0">
        <BasicButton
          params={{
            variant: "secondaryInvers",
            onClick: enterZoneMode,
            ariaLabel: "Enter zone creation mode",
          }}
        >
          Zones
        </BasicButton>
      </div>
    );
  }

  return (
    <>
      <div className="pointer-events-auto absolute right-4 top-4 z-0">
        <div className="relative w-52 rounded-xl border border-[var(--color-muted)]/30 bg-[var(--color-page)]/95 p-3 shadow-lg backdrop-blur-sm">
          <button
            aria-label="Exit zone mode"
            className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-muted)]/30 bg-[var(--color-page)] text-[var(--color-muted)] shadow-sm"
            onClick={exitZoneMode}
            type="button"
          >
            <CloseIcon className="h-3 w-3" />
          </button>

          <p className="mb-3 text-sm font-semibold text-[var(--color-muted)]">
            Zone Mode
          </p>

          <div className="mb-3 flex gap-1">
            {(["polygon", "rectangle", "circle"] as const).map((shape) => (
              <button
                key={shape}
                type="button"
                onClick={() => handleShapeSelect(shape)}
                className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium capitalize transition ${
                  activeShape === shape
                    ? "border-[var(--color-light-blue)] bg-[var(--color-page)] text-[var(--color-dark-blue)]"
                    : "border-[var(--color-muted)]/40 bg-[var(--color-page)] text-[var(--color-muted)]"
                }`}
              >
                {shape}
              </button>
            ))}
          </div>

          {drawnGeometry === null ? (
            <p className="text-xs text-[var(--color-muted)]/60">
              Draw a zone boundary on the map.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={discardShape}
                className="text-left text-xs text-[var(--color-muted)]/70 underline underline-offset-2"
              >
                Discard shape
              </button>
              <BasicButton
                params={{
                  variant: "primary",
                  onClick: openCreateForm,
                  ariaLabel: "Create zone from drawn shape",
                }}
              >
                Create Zone
              </BasicButton>
            </div>
          )}
        </div>
      </div>

      <ZonePolygonLayer />
    </>
  );
};
```

**Constraints:**

- `ZonePolygonLayer` must only render when `isZoneMode` is true — it is rendered inside the active branch, so this is guaranteed.
- Reset `activeShape` to `'polygon'` when `isZoneMode` becomes false. Add a `useEffect` for this.

---

### TASK 16 — Extend the selection mode guard

**File (modify):** `src/features/home-route-operations/flows/mapSelectionModeGuard.flow.ts`

Zone mode must be mutually exclusive with order and route group selection modes. When zone mode activates, both other modes must be disabled.

Add to the hook:

```ts
import {
  useZoneStore,
  selectIsZoneMode,
} from "@/features/zone/store/zone.store";

// inside useMapSelectionModeGuardFlow:
const isZoneMode = useZoneStore(selectIsZoneMode);
const { setIsZoneMode } = useZoneStore();
```

Extend `resolveSelectionConflict` to accept and return zone conflicts, or handle it as a separate effect:

```ts
useEffect(() => {
  if (!isZoneMode) return;
  // zone mode just activated — disable the others
  if (isOrderMode) disableOrderSelectionMode();
  if (isRouteGroupMode) disableRouteGroupSelectionMode();
}, [isZoneMode]);
```

Also disable zone mode when either other mode activates:

```ts
useEffect(() => {
  if (!isZoneMode) return;
  if (isOrderMode || isRouteGroupMode) {
    setIsZoneMode(false);
  }
}, [isOrderMode, isRouteGroupMode]);
```

---

### TASK 17 — Wire `ZoneMapOverlay` into `HomeDesktopView`

**File (modify):** `src/features/home-route-operations/views/HomeDesktopView.tsx`

Import `ZoneMapOverlay`:

```ts
import { ZoneMapOverlay } from "@/features/zone/components/ZoneMapOverlay";
```

Update the `mapOverlay` prop in `HomeDesktopLayout`:

```tsx
mapOverlay={
  derivedState.isRouteOperationsOverlayActive
    ? <RouteGroupMapOverlay />
    : (
        <>
          <OrderMapOverlay />
          <ZoneMapOverlay />
        </>
      )
}
```

---

### TASK 18 — Update `features/zone/index.ts`

**File (modify):** `src/features/zone/index.ts`

Export the new public surface:

```ts
export { useZoneModeController } from "./controllers/useZoneModeController";
export { createZoneAction } from "./actions/createZone.action";
export { updateZoneAction } from "./actions/updateZone.action";
export { deleteZoneAction } from "./actions/deleteZone.action";
export { ZoneMapOverlay } from "./components/ZoneMapOverlay";
export { ZonePolygonLayer } from "./components/ZonePolygonLayer";
export { ZoneHoverCard } from "./components/ZoneHoverCard";
export { zonePopupRegistry } from "./registry/zone.popups.registry";
```

Keep existing exports. Do not remove any.

---

## PART 5 — DO NOT BUILD IN THIS PHASE

The following are explicitly deferred. Do not implement them even if they seem adjacent:

| Feature                                                            | Reason deferred                                                                                                                                                   |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zone geometry reshape (editing polygon vertices of existing zones) | Requires pre-seeding drawing manager with an existing polygon path — non-trivial; backend PATCH for geometry exists but the drawing UX is out of scope this phase |
| Zone polygon visible in route group operations mode                | Separate concern — background layer in route group map                                                                                                            |
| Zone mode on mobile                                                | Mobile overlay is suppressed; consistent with `OrderMapOverlay` and `RouteGroupMapOverlay` behavior                                                               |
| Zone version selection in home flow                                | Version management stays in the separate `ZoneManagementPage`                                                                                                     |

---

## PART 6 — API REFERENCE

All contracts sourced from `admin-app/docs/handoff_from_backend/ZONES_ENDPOINT_HANDOFF_2026-03-27_13-07-56.md`.

| Method   | Path                                                | Used in                                   | Notes                                                             |
| -------- | --------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------- |
| `GET`    | `/api_v2/zones/`                                    | Load versions on zone mode enter          | Already in `zoneApi`                                              |
| `GET`    | `/api_v2/zones/<versionId>/zones`                   | Load zones for active version             | Already in `zoneApi`                                              |
| `PUT`    | `/api_v2/zones/<versionId>/zones`                   | Create zone (`createZone.action.ts`)      | Response now includes `template: null` — no mapping change needed |
| `PATCH`  | `/api_v2/zones/<versionId>/zones/<zoneId>`          | Update zone name (`updateZone.action.ts`) | **New** — all fields optional; 410 if version is active           |
| `DELETE` | `/api_v2/zones/<versionId>/zones/<zoneId>`          | Delete zone (`deleteZone.action.ts`)      | **New** — 410 if version active or derived route groups exist     |
| `PUT`    | `/api_v2/zones/<versionId>/zones/<zoneId>/template` | Upsert template (create + update flows)   | Already in `zoneApi`                                              |

**Active version constraint:** Both PATCH and DELETE return HTTP 410 if the zone's version `is_active === true`. Zones can only be edited or deleted when their version is inactive. The UI does not need to prevent the action upfront — handle the 410 in the catch block with a specific error message (see Task 8 and Task 9).

**Derived route groups constraint:** DELETE returns HTTP 410 with a domain error code containing `DERIVED` if route groups materialised from this zone still exist. The delete action checks for this code and shows a specific blocking message (see Task 9).

The active version is tracked in `useZoneStore` via `activeVersionId` / `selectActiveZoneVersion`. Zone mode always uses the **active** version. If no version is active, zone mode should show an empty state message: "No active zone version configured." and disable the draw and create actions.

---

## PART 7 — VERIFICATION CHECKLIST

After each task, verify:

- [ ] TypeScript compiles without errors: `tsc --noEmit`
- [ ] No `any` introduced without justification
- [ ] No raw imports across forbidden boundaries
- [ ] No `console.log` left in production code paths
- [ ] Cleanup effects (`clearZoneLayer`, `disableZoneCapture`) are registered in `useEffect` return functions
- [ ] Zone polygons do not persist on the map after exiting zone mode
- [ ] Zone mode disables when order or route group selection activates, and vice versa
- [ ] Optimistic zone appears on the map immediately after "Create Zone" is tapped
- [ ] On create API failure, optimistic zone is removed and error message shown
- [ ] Form popup opens in create mode with empty fields and in edit mode with pre-filled name + template fields
- [ ] Edit form submits name change via PATCH and template change via PUT independently
- [ ] On update API failure, store is rolled back to the pre-edit zone state
- [ ] Delete button is visible only in edit mode
- [ ] Optimistic delete removes zone from map immediately
- [ ] On delete failure, zone is restored to the map and a specific error message is shown
- [ ] 410 "version is active" errors produce the correct blocking message (not a generic error)
- [ ] 410 "derived route groups exist" errors produce the correct blocking message for delete
