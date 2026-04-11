# Map Marker Clustering

**Status:** Under development
**Created:** 2026-03-31
**Scope:** `admin-app` — `shared/map` infrastructure + `features/order` flow wiring

---

## Overview

The order map layer uses DOM-based `AdvancedMarkerElement` (Google Maps). Each marker is a real HTMLElement. At DHL-scale volumes (tens of thousands to hundreds of thousands of orders) rendering every marker as a live DOM node causes layout thrash, memory pressure, and browser paint cost that degrades the app to unusable.

The solution is **zoom-responsive spatial clustering**: at low zoom levels many markers are collapsed into a single cluster marker showing a count. As the user zooms in, clusters split into smaller groups and eventually individual markers. The user never loses the ability to see patterns — clusters show density visually — while the DOM marker count stays bounded (target: ≤ 500 rendered DOM nodes regardless of dataset size).

**Target capacity after this implementation:**
- 10 000 orders: instant render, smooth pan/zoom
- 100 000 orders: <200ms initial cluster compute, smooth interaction
- 1 000 000 orders: requires Phase 2 (server-side tile aggregation, documented at end)

---

## Technology Choice: `supercluster`

**Library:** [`supercluster`](https://github.com/mapbox/supercluster) by Mapbox  
**Install:** `npm install supercluster @types/supercluster`

**Why supercluster:**
- Industry standard — used by Mapbox GL, deck.gl, react-map-gl, AWS Location
- Pure JavaScript, no map library dependency (works with Google Maps)
- Spatial index built on a flat [kd-tree variant](https://en.wikipedia.org/wiki/K-d_tree) — O(n) load, O(log n + k) query
- 100 000 points load in ~80ms, subsequent queries in ~2ms
- Returns GeoJSON Feature output — straightforward to map to `MapOrder`
- `getClusterExpansionZoom(clusterId)` built in — enables click-to-expand
- `getLeaves(clusterId, Infinity)` built in — enables cluster-aware multi-select

---

## Current Architecture (Relevant Parts)

```
Order[]  (Zustand store)
  └─ orderMapMarkers.flow.ts
       ├─ buildOrderAddressGroups()    ← groups by exact lat/lng (same-address grouping)
       └─ buildOrderMarkers()          ← produces MapOrder[] + OrderMarkerGroupLookup
            └─ mapManager.setMarkerLayer(layerId, markers)
                 └─ GoogleMapAdapter
                       └─ MarkerLayerManager.setLayerMarkers()
                            └─ AdvancedMarkerElement (real DOM per marker)
```

**Key constraint:** `MarkerLayerManager` already diffs incoming markers by ID and reuses existing DOM nodes. The clustering layer can call `setLayerMarkers()` repeatedly on bounds change and it will only create/destroy the delta — this is efficient.

**Existing bounds subscription:** `GoogleMapAdapter.subscribeBoundsChanged()` is already wired in `orderMapData.flow.ts` for viewport-based order loading. The clustering layer subscribes to the same event independently through the map instance.

---

## Architecture After Implementation

```
Order[]  (Zustand store)
  └─ orderMapMarkers.flow.ts
       ├─ buildOrderAddressGroups()    ← unchanged, same-address grouping
       └─ buildOrderMarkers()          ← produces MapOrder[] + OrderMarkerGroupLookup
            └─ mapManager.setClusteredMarkerLayer(layerId, markers)   ← NEW call
                 └─ GoogleMapAdapter
                       └─ ClusterLayerManager  ← NEW
                            ├─ supercluster instance (one per layer)
                            ├─ stores raw MapOrder[] for the layer
                            ├─ subscribes to map bounds_changed
                            └─ on each bounds change:
                                 getClusters(bbox, zoom)
                                      └─ MarkerLayerManager.setLayerMarkers()
                                           └─ AdvancedMarkerElement (DOM)
```

**Two marker factories:**
- `mapMarkerElement.factory.ts` — unchanged, individual order markers
- `clusterMarkerElement.factory.ts` — NEW, cluster bubble markers

---

## Layer Map: All Files Touched

### New Files

| File | Purpose |
|---|---|
| `src/shared/map/infrastructure/markers/ClusterLayerManager.ts` | Owns supercluster instances per named layer. Subscribes to bounds changes. Translates cluster output into MarkerLayerManager calls. |
| `src/shared/map/presentation/clusterMarkerElement.factory.ts` | Builds the cluster DOM element (count bubble). Separate from the order marker factory. |
| `src/shared/map/domain/entities/ClusterRecord.ts` | Type: `ClusterRecord` = metadata stored per cluster for click-to-expand and leaf lookup. |

### Modified Files

| File | Change |
|---|---|
| `src/shared/map/infrastructure/GoogleMapAdapter.ts` | Instantiate `ClusterLayerManager`. Add `setClusteredMarkerLayer()` and `clearClusteredMarkerLayer()` methods to the adapter. Wire the internal bounds change listener. |
| `src/shared/map/domain/types.ts` | Add `setClusteredMarkerLayer(layerId, orders, options?)` and `clearClusteredMarkerLayer(layerId)` to `MapBridge` interface. |
| `src/features/order/flows/orderMapMarkers.flow.ts` | Change `mapManager.setMarkerLayer(...)` call to `mapManager.setClusteredMarkerLayer(...)`. No other logic changes. |
| `src/features/order/flows/orderMapData.flow.ts` | Add cluster threshold constant. At very high zoom levels (>= 16) clustering can be bypassed — already handled by supercluster `maxZoom`. No structural change needed. |
| `src/shared/map/map.css` | Add cluster marker styles. |
| `package.json` | Add `supercluster` and `@types/supercluster`. |

---

## Implementation Steps

### Step 1 — Install dependency

```bash
npm install supercluster @types/supercluster
```

---

### Step 2 — `ClusterRecord` type

**File:** `src/shared/map/domain/entities/ClusterRecord.ts`

```typescript
/**
 * Metadata stored per cluster for interaction handling.
 * Kept separate from MapOrder to avoid polluting the domain entity.
 */
export type ClusterRecord = {
  clusterId: number          // supercluster internal cluster_id
  pointCount: number         // number of original points in this cluster
  coordinates: { lat: number; lng: number }
}
```

---

### Step 3 — Cluster marker element factory

**File:** `src/shared/map/presentation/clusterMarkerElement.factory.ts`

Create a DOM element for cluster markers. This is a circular bubble, visually distinct from individual markers.

```typescript
import type { ClusterRecord } from '../domain/entities/ClusterRecord'

/**
 * Size tiers based on point count.
 * Gives visual weight to dense clusters.
 */
function clusterSize(count: number): number {
  if (count < 10) return 36
  if (count < 100) return 44
  if (count < 1000) return 52
  return 60
}

/**
 * Formats large counts: 1200 → "1.2k", 15000 → "15k"
 */
function formatCount(count: number): string {
  if (count < 1000) return String(count)
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`
  return `${Math.floor(count / 1000)}k`
}

export function createClusterMarkerElement(record: ClusterRecord): HTMLElement {
  const size = clusterSize(record.pointCount)

  const el = document.createElement('div')
  el.className = 'map-cluster-marker'
  el.style.setProperty('--cluster-size', `${size}px`)

  const inner = document.createElement('div')
  inner.className = 'map-cluster-marker__inner'

  const label = document.createElement('span')
  label.className = 'map-cluster-marker__label'
  label.textContent = formatCount(record.pointCount)

  inner.appendChild(label)
  el.appendChild(inner)
  return el
}
```

---

### Step 4 — CSS for cluster markers

**File:** `src/shared/map/map.css` — append to existing file

```css
/* ─── Cluster Markers ──────────────────────────────────────────────── */

.map-cluster-marker {
  width: var(--cluster-size, 44px);
  height: var(--cluster-size, 44px);
  cursor: pointer;
  /* Raise clusters above individual markers */
  z-index: 20;
}

.map-cluster-marker__inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 35%,
    rgba(86, 201, 181, 0.95),
    rgba(60, 140, 200, 0.90)
  );
  border: 2.5px solid rgba(255, 255, 255, 0.30);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.20);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.map-cluster-marker:hover .map-cluster-marker__inner {
  transform: scale(1.08);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.40),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.map-cluster-marker__label {
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
  user-select: none;
  pointer-events: none;
}
```

---

### Step 5 — `ClusterLayerManager`

**File:** `src/shared/map/infrastructure/markers/ClusterLayerManager.ts`

This is the core of the implementation. It owns one `supercluster` instance per layer, subscribes to bounds changes, and translates cluster output into `MarkerLayerManager` calls.

```typescript
import Supercluster from 'supercluster'
import type { BBox, Feature, Point } from 'geojson'
import type { MapOrder } from '../../domain/entities/MapOrder'
import type { MarkerLayerManager } from './MarkerLayerManager'
import type { ClusterRecord } from '../../domain/entities/ClusterRecord'
import { createClusterMarkerElement } from '../../presentation/clusterMarkerElement.factory'

type PointProperties = {
  originalId: string
  order: MapOrder
}

type ClusterLayerEntry = {
  index: Supercluster<PointProperties>
  rawOrders: MapOrder[]       // full dataset for this layer (never changes until caller updates)
  options?: SetClusteredLayerOptions
}

export type SetClusteredLayerOptions = {
  /**
   * Pixel radius used by supercluster to group points.
   * Default: 80. Increase for more aggressive clustering.
   */
  radius?: number
  /**
   * Minimum zoom at which clustering is active (supercluster minZoom).
   * Default: 0
   */
  minZoom?: number
  /**
   * Zoom level at which all points render individually.
   * Default: 16  (matches Google Maps max useful zoom)
   */
  maxZoom?: number
}

const CLUSTER_SUPERCLUSTER_DEFAULTS = {
  radius: 80,
  extent: 512,
  minZoom: 0,
  maxZoom: 16,
}

export class ClusterLayerManager {
  private layers = new Map<string, ClusterLayerEntry>()
  private mapInstance: google.maps.Map | null = null
  private boundsListener: google.maps.MapsEventListener | null = null
  private rafHandle: number | null = null

  constructor(private readonly markerLayerManager: MarkerLayerManager) {}

  /**
   * Must be called once the Google Maps instance is ready.
   * Subscribes to bounds_changed for all active clustered layers.
   */
  attachMap(map: google.maps.Map): void {
    this.mapInstance = map
    this.boundsListener?.remove()
    this.boundsListener = map.addListener('bounds_changed', () => {
      // Use rAF to batch multiple rapid bounds events into one render
      if (this.rafHandle !== null) cancelAnimationFrame(this.rafHandle)
      this.rafHandle = requestAnimationFrame(() => {
        this.rafHandle = null
        this.recomputeAll()
      })
    })
  }

  detachMap(): void {
    this.boundsListener?.remove()
    this.boundsListener = null
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle)
      this.rafHandle = null
    }
    this.mapInstance = null
  }

  /**
   * Set or replace the full dataset for a clustered layer.
   * Triggers an immediate recompute for this layer.
   */
  setLayer(layerId: string, orders: MapOrder[], options?: SetClusteredLayerOptions): void {
    const opts = { ...CLUSTER_SUPERCLUSTER_DEFAULTS, ...options }

    const index = new Supercluster<PointProperties>({
      radius: opts.radius,
      extent: opts.extent,
      minZoom: opts.minZoom,
      maxZoom: opts.maxZoom,
      map: (props) => props,
      reduce: undefined,
    })

    const features: Feature<Point, PointProperties>[] = orders.map((order) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [order.coordinates.lng, order.coordinates.lat],
      },
      properties: {
        originalId: order.id,
        order,
      },
    }))

    index.load(features)

    this.layers.set(layerId, { index, rawOrders: orders, options })
    this.recomputeLayer(layerId)
  }

  clearLayer(layerId: string): void {
    this.layers.delete(layerId)
    this.markerLayerManager.clearLayer(layerId)
  }

  hasLayer(layerId: string): boolean {
    return this.layers.has(layerId)
  }

  /**
   * Recomputes cluster output for ALL active clustered layers.
   * Called on every bounds_changed event.
   */
  private recomputeAll(): void {
    for (const layerId of this.layers.keys()) {
      this.recomputeLayer(layerId)
    }
  }

  private recomputeLayer(layerId: string): void {
    const entry = this.layers.get(layerId)
    if (!entry || !this.mapInstance) return

    const bounds = this.mapInstance.getBounds()
    const zoom = this.mapInstance.getZoom()
    if (!bounds || zoom === undefined) return

    const ne = bounds.getNorthEast()
    const sw = bounds.getSouthWest()
    const bbox: BBox = [sw.lng(), sw.lat(), ne.lng(), ne.lat()]
    const intZoom = Math.round(zoom)

    const rawClusters = entry.index.getClusters(bbox, intZoom)

    const mapOrders: MapOrder[] = rawClusters.map((feature) => {
      const [lng, lat] = feature.geometry.coordinates

      if (feature.properties.cluster) {
        // ── Cluster point ──────────────────────────────────────────────
        const clusterId = feature.properties.cluster_id as number
        const pointCount = feature.properties.point_count as number

        const record: ClusterRecord = {
          clusterId,
          pointCount,
          coordinates: { lat, lng },
        }

        return {
          id: `cluster_${clusterId}`,
          coordinates: { lat, lng },
          label: '',              // element factory handles label rendering
          _clusterRecord: record, // carry record for element factory lookup
          onClick: (e: MouseEvent) => {
            e.stopPropagation()
            const expansionZoom = entry.index.getClusterExpansionZoom(clusterId)
            this.mapInstance?.setZoom(expansionZoom)
            this.mapInstance?.panTo({ lat, lng })
          },
        } as unknown as MapOrder
        // NOTE: _clusterRecord is a non-standard field used only by the
        // element factory to distinguish cluster vs order markers.
        // It is intentionally invisible to the domain type.
      } else {
        // ── Individual order point ──────────────────────────────────────
        return feature.properties.order as MapOrder
      }
    })

    this.markerLayerManager.setLayerMarkers(layerId, mapOrders)
  }

  /**
   * For multi-select: given a set of marker IDs (which may include cluster IDs),
   * expand all clusters to their leaf order IDs.
   * Returns a flat list of original order IDs.
   */
  expandToLeafIds(layerId: string, markerIds: string[]): string[] {
    const entry = this.layers.get(layerId)
    if (!entry) return markerIds

    const result: string[] = []

    for (const id of markerIds) {
      if (id.startsWith('cluster_')) {
        const clusterId = parseInt(id.replace('cluster_', ''), 10)
        const leaves = entry.index.getLeaves(clusterId, Infinity)
        for (const leaf of leaves) {
          result.push(leaf.properties.originalId)
        }
      } else {
        result.push(id)
      }
    }

    return result
  }
}
```

---

### Step 6 — Patch `MarkerLayerManager` element factory call site

**File:** `src/shared/map/infrastructure/markers/MarkerLayerManager.ts`

Locate the line that calls `createMarkerElement(order)` (inside `setLayerMarkers`). Add a branch:

```typescript
// BEFORE (existing):
const el = createMarkerElement(order)

// AFTER:
const isCluster = typeof (order as any)._clusterRecord !== 'undefined'
const el = isCluster
  ? createClusterMarkerElement((order as any)._clusterRecord as ClusterRecord)
  : createMarkerElement(order)
```

Import `createClusterMarkerElement` from `../../presentation/clusterMarkerElement.factory`.
Import `ClusterRecord` from `../../domain/entities/ClusterRecord`.

This is the only change to `MarkerLayerManager` — it's minimal and backwards-compatible (non-cluster markers are unaffected).

---

### Step 7 — Patch `GoogleMapAdapter`

**File:** `src/shared/map/infrastructure/GoogleMapAdapter.ts`

**7a — Instantiate `ClusterLayerManager` in constructor:**

```typescript
import { ClusterLayerManager } from './markers/ClusterLayerManager'
import type { SetClusteredLayerOptions } from './markers/ClusterLayerManager'

// In class body:
private readonly clusterLayerManager: ClusterLayerManager

constructor(...) {
  // existing managers...
  this.clusterLayerManager = new ClusterLayerManager(this.markerLayerManager)
}
```

**7b — Attach the cluster manager when the map initializes:**

In the `initialize()` method, after the Google Maps instance is ready (look for the point where `MapInstanceManager` resolves):

```typescript
this.clusterLayerManager.attachMap(mapInstance)
```

**7c — Add two new public methods:**

```typescript
setClusteredMarkerLayer(
  layerId: string,
  orders: MapOrder[],
  options?: SetClusteredLayerOptions,
): void {
  this.clusterLayerManager.setLayer(layerId, orders, options)
}

clearClusteredMarkerLayer(layerId: string): void {
  this.clusterLayerManager.clearLayer(layerId)
}
```

**7d — In `replayLayerSnapshots()` (called after map re-init):**

After attaching the new map instance, re-trigger cluster computation:

```typescript
this.clusterLayerManager.attachMap(newMap)
// Existing layers re-compute automatically via the new bounds_changed listener
// once the map fires its first bounds_changed after reattach.
```

**7e — In `destroy()` / teardown if it exists:**

```typescript
this.clusterLayerManager.detachMap()
```

---

### Step 8 — Expose on `MapBridge` interface

**File:** `src/shared/map/domain/types.ts`

Add to the `MapBridge` interface:

```typescript
/**
 * Set a marker layer that auto-clusters based on zoom level and viewport.
 * Supersedes setMarkerLayer for datasets that may exceed ~500 markers.
 * On subsequent calls the dataset is replaced and clusters recomputed.
 */
setClusteredMarkerLayer(
  layerId: string,
  orders: MapOrder[],
  options?: {
    radius?: number
    minZoom?: number
    maxZoom?: number
  },
): void

/**
 * Removes all markers and disposes the cluster index for the given layer.
 */
clearClusteredMarkerLayer(layerId: string): void
```

---

### Step 9 — Wire the order feature to use clustering

**File:** `src/features/order/flows/orderMapMarkers.flow.ts`

Find the call to `mapManager.setMarkerLayer(MAP_MARKER_LAYERS.orders, markers)`.

Change it to:

```typescript
mapManager.setClusteredMarkerLayer(MAP_MARKER_LAYERS.orders, markers, {
  radius: 80,    // px — tune based on UX feedback
  maxZoom: 16,
})
```

No other logic changes. `buildOrderMarkers()` still runs as before: address grouping (same-address multi-order markers) is produced first, then clustering is applied on top of those grouped markers.

**Important:** The `OrderMarkerGroupLookup` (used by `OrderMarkerGroupOverlay`) is built from address-grouped markers. It is still valid — clicking an individual (non-cluster) marker that represents multiple orders still opens the group overlay. Cluster markers use their own click handler (zoom-to-expand) and never trigger the group overlay.

---

### Step 10 — Multi-select cluster awareness

**File:** `src/features/order/flows/orderMapMarkers.flow.ts` or wherever `multiSelectIds` is sent to the store after a circle/polygon selection.

When the selection geometry interaction resolves with a list of marker IDs, some of those IDs may be `cluster_*` IDs. Before writing to the multi-select store:

```typescript
import { useMapManager } from '@/shared/resource-manager/useResourceManager'

// Inside the selection handler:
const rawIds: string[] = /* IDs returned by circle/polygon selection */

// Expand any cluster IDs to their leaf order IDs.
// ClusterLayerManager.expandToLeafIds() must be exposed via MapBridge or
// accessed directly through a new MapBridge method (see note below).
const expandedIds = mapManager.expandClusterIds(MAP_MARKER_LAYERS.orders, rawIds)

// expandedIds now contains only original order marker IDs (from address-grouped markers).
// Pass these to the multi-select store as before.
```

**Add to `MapBridge` interface:**

```typescript
/**
 * Given a mixed list of marker IDs (may include cluster_* IDs),
 * expands clusters to their constituent leaf marker IDs.
 * Returns a flat deduplicated array of original marker IDs.
 */
expandClusterIds(layerId: string, markerIds: string[]): string[]
```

**Add to `GoogleMapAdapter`:**

```typescript
expandClusterIds(layerId: string, markerIds: string[]): string[] {
  return this.clusterLayerManager.expandToLeafIds(layerId, markerIds)
}
```

---

### Step 11 — `RouteGroupMapOverlay` (optional, same pattern)

The route group map overlay (`features/plan/routeGroup/flows/routeGroupMap.flow.ts`) follows the same pattern. If route group order volumes are also large, apply the same change:

```typescript
// Change from:
mapManager.setMarkerLayer(MAP_MARKER_LAYERS.routeGroup, markers)
// To:
mapManager.setClusteredMarkerLayer(MAP_MARKER_LAYERS.routeGroup, markers, { radius: 60 })
```

Use a smaller radius (60px) so route group stops cluster less aggressively — users editing routes benefit from seeing individual stops sooner.

---

## Supercluster Configuration Reference

| Parameter | Default | Effect |
|---|---|---|
| `radius` | `80` | Pixel radius for clustering neighbors. Higher = fewer, larger clusters. |
| `minZoom` | `0` | Lowest zoom level where clustering is computed. |
| `maxZoom` | `16` | Zoom at which all points render individually. Keep at 16 (Google Maps cap). |
| `extent` | `512` | Tile grid extent. `512` matches Google Maps tile size. Do not change. |

**Tuning guide:**
- `radius: 80` — good default for city-scale data
- `radius: 120` — better for sparse rural data or very high marker counts
- `radius: 40` — useful when routes are shown simultaneously (prevents clusters from overlapping route polylines)

---

## Visual Behavior by Zoom Level

| Zoom | Behavior |
|---|---|
| 1–5 (world/continent) | All orders → a handful of continent-level cluster bubbles |
| 6–10 (country/state) | Region-level clusters, density visible |
| 11–13 (city) | Neighborhood-level clusters + some individual stops in sparse areas |
| 14–15 (district) | Most stops visible individually; tight intersections still clustered |
| 16+ (street) | All stops render individually (supercluster `maxZoom` = 16) |

Click on any cluster at any zoom → map zooms to the expansion zoom for that cluster and re-renders.

---

## What Does NOT Change

- `MarkerLayerManager.setLayerMarkers()` — only one-line addition for cluster element factory
- `buildOrderMarkers()` and `buildOrderAddressGroups()` — unchanged; same-address grouping still works
- `OrderMarkerGroupLookup` and `OrderMarkerGroupOverlay` — unchanged; clicking an individual address-grouped marker still opens the group popover as before
- `ZoneMapOverlay` — zones are polygons, not markers; no change
- `MarkerSelectionManager` / `MarkerMultiSelectionManager` — unchanged; cluster markers do not participate in CSS selection states (they are never individually "selected")
- Route rendering — unaffected

---

## Phase 2 — DHL Scale (> 500 000 orders)

At million-order scale, loading all orders client-side is not viable. This phase is **not part of the current implementation** but should inform API design decisions now.

### Server-side cluster tiles

- Backend pre-aggregates orders into cluster tiles at each zoom level
- API endpoint: `GET /orders/clusters?bbox=...&zoom=...` returns pre-computed cluster centroids + counts
- Client does NOT call `supercluster.load()` on the full dataset — it queries the tile endpoint on bounds change
- `ClusterLayerManager` in Phase 2 calls the tile API instead of `entry.index.getClusters()`
- Individual orders within a cluster load on demand when user zooms past a threshold

### What to keep in mind now (design for Phase 2)

1. `ClusterLayerManager.setLayer()` signature stays the same — callers don't change
2. The internal strategy (local supercluster vs remote tile API) is swapped inside `ClusterLayerManager` without touching `GoogleMapAdapter` or any feature code
3. Order loading in `orderMapData.flow.ts` already paginates and filters by viewport — Phase 2 extends this, not replaces it

---

## File Reference Summary

```
NEW:
  src/shared/map/infrastructure/markers/ClusterLayerManager.ts
  src/shared/map/presentation/clusterMarkerElement.factory.ts
  src/shared/map/domain/entities/ClusterRecord.ts

MODIFIED:
  src/shared/map/infrastructure/GoogleMapAdapter.ts
  src/shared/map/infrastructure/markers/MarkerLayerManager.ts   (1 branch, element factory)
  src/shared/map/domain/types.ts                                 (2 new methods on MapBridge)
  src/shared/map/map.css                                         (cluster marker CSS)
  src/features/order/flows/orderMapMarkers.flow.ts               (1 line change)
  package.json                                                   (supercluster dependency)

OPTIONAL (same pattern):
  src/features/plan/routeGroup/flows/routeGroupMap.flow.ts       (1 line change)
```
