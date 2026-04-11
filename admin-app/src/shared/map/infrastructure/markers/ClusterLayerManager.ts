import Supercluster from 'supercluster'
import type { BBox, Feature, Point } from 'geojson'

import type { ClusterRecord } from '../../domain/entities/ClusterRecord'
import type { MapOrder } from '../../domain/entities/MapOrder'
import type { SetClusteredMarkerLayerOptions } from '../../domain/types'
import type { MarkerLayerManager } from './MarkerLayerManager'

type PointProperties = {
  originalId: string
  order: MapOrder
}

type ClusterLayerEntry = {
  index: Supercluster<PointProperties, PointProperties>
  rawOrders: MapOrder[]
  signature: string
}

type ClusterLayerRecomputeListener = (layerId: string) => void

type ClusteredMapOrder = MapOrder & {
  _clusterRecord?: ClusterRecord
}

const CLUSTER_DEFAULTS = {
  radius: 80,
  extent: 512,
  minZoom: 0,
  maxZoom: 16,
} satisfies Required<SetClusteredMarkerLayerOptions> & { extent: number }

const sortOrdersForClusterIndex = (orders: MapOrder[]) =>
  [...orders].sort((left, right) => {
    const leftId = String(left.id)
    const rightId = String(right.id)
    if (leftId !== rightId) {
      return leftId.localeCompare(rightId)
    }

    if (left.coordinates.lat !== right.coordinates.lat) {
      return left.coordinates.lat - right.coordinates.lat
    }

    if (left.coordinates.lng !== right.coordinates.lng) {
      return left.coordinates.lng - right.coordinates.lng
    }

    return String(left.label ?? '').localeCompare(String(right.label ?? ''))
  })

const buildLayerSignature = (
  orders: MapOrder[],
  options: Required<SetClusteredMarkerLayerOptions>,
) => JSON.stringify({
  options,
  orders: orders.map((order) => ({
    id: String(order.id),
    lat: order.coordinates.lat,
    lng: order.coordinates.lng,
    label: order.label ?? null,
  })),
})

export class ClusterLayerManager {
  private layers = new Map<string, ClusterLayerEntry>()
  private mapInstance: google.maps.Map | null = null
  private idleListener: google.maps.MapsEventListener | null = null
  private zoomChangedListener: google.maps.MapsEventListener | null = null
  private rafHandle: number | null = null
  private readonly markerLayerManager: MarkerLayerManager
  private readonly onLayerRecomputed: ClusterLayerRecomputeListener

  constructor(
    markerLayerManager: MarkerLayerManager,
    onLayerRecomputed: ClusterLayerRecomputeListener = () => undefined,
  ) {
    this.markerLayerManager = markerLayerManager
    this.onLayerRecomputed = onLayerRecomputed
  }

  attachMap(map: google.maps.Map): void {
    this.mapInstance = map
    this.idleListener?.remove()
    this.zoomChangedListener?.remove()

    const scheduleRecompute = () => {
      if (this.rafHandle !== null) {
        cancelAnimationFrame(this.rafHandle)
      }

      this.rafHandle = requestAnimationFrame(() => {
        this.rafHandle = null
        this.recomputeAll()
      })
    }

    this.zoomChangedListener = map.addListener('zoom_changed', scheduleRecompute)
    this.idleListener = map.addListener('idle', scheduleRecompute)

    this.recomputeAll()
  }

  detachMap(): void {
    this.idleListener?.remove()
    this.idleListener = null
    this.zoomChangedListener?.remove()
    this.zoomChangedListener = null

    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle)
      this.rafHandle = null
    }

    this.mapInstance = null
  }

  setLayer(
    layerId: string,
    orders: MapOrder[],
    options?: SetClusteredMarkerLayerOptions,
  ): void {
    const opts = { ...CLUSTER_DEFAULTS, ...options }
    const sortedOrders = sortOrdersForClusterIndex(orders)
    const nextSignature = buildLayerSignature(sortedOrders, {
      radius: opts.radius,
      minZoom: opts.minZoom,
      maxZoom: opts.maxZoom,
    })
    const existing = this.layers.get(layerId)

    if (existing?.signature === nextSignature) {
      this.recomputeLayer(layerId)
      return
    }

    const index = new Supercluster<PointProperties, PointProperties>({
      radius: opts.radius,
      extent: CLUSTER_DEFAULTS.extent,
      minZoom: opts.minZoom,
      maxZoom: opts.maxZoom,
    })

    const features: Feature<Point, PointProperties>[] = sortedOrders.map((order) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [order.coordinates.lng, order.coordinates.lat],
      },
      properties: {
        originalId: String(order.id),
        order,
      },
    }))

    index.load(features)
    this.layers.set(layerId, {
      index,
      rawOrders: sortedOrders,
      signature: nextSignature,
    })
    this.recomputeLayer(layerId)
  }

  clearLayer(layerId: string): string[] {
    this.layers.delete(layerId)
    return this.markerLayerManager.clearLayer(layerId)
  }

  clearLayers(): string[] {
    const removedIds: string[] = []
    Array.from(this.layers.keys()).forEach((layerId) => {
      removedIds.push(...this.clearLayer(layerId))
    })
    return removedIds
  }

  hasLayer(layerId: string): boolean {
    return this.layers.has(layerId)
  }

  expandToLeafIds(layerId: string, markerIds: string[]): string[] {
    const entry = this.layers.get(layerId)
    if (!entry) {
      return Array.from(new Set(markerIds))
    }

    const expanded: string[] = []
    markerIds.forEach((markerId) => {
      if (!markerId.startsWith('cluster_')) {
        expanded.push(markerId)
        return
      }

      const clusterId = Number(markerId.replace('cluster_', ''))
      if (!Number.isFinite(clusterId)) {
        return
      }

      entry.index.getLeaves(clusterId, Infinity).forEach((leaf) => {
        expanded.push(leaf.properties.originalId)
      })
    })

    return Array.from(new Set(expanded))
  }

  private recomputeAll(): void {
    Array.from(this.layers.keys()).forEach((layerId) => {
      this.recomputeLayer(layerId)
    })
  }

  private recomputeLayer(layerId: string): void {
    const entry = this.layers.get(layerId)
    if (!entry || !this.mapInstance) {
      return
    }

    const bounds = this.mapInstance.getBounds()
    const zoom = this.mapInstance.getZoom()
    if (!bounds || zoom == null) {
      return
    }

    const northEast = bounds.getNorthEast()
    const southWest = bounds.getSouthWest()
    const bbox: BBox = [
      southWest.lng(),
      southWest.lat(),
      northEast.lng(),
      northEast.lat(),
    ]
    const clusters = entry.index.getClusters(bbox, Math.round(zoom))

    const nextMarkers: ClusteredMapOrder[] = clusters.map((feature) => {
      const [lng, lat] = feature.geometry.coordinates
      const properties = feature.properties as
        | (PointProperties & { cluster?: false })
        | (Partial<PointProperties> & {
            cluster: true
            cluster_id: number
            point_count: number
          })

      if (properties.cluster) {
        const clusterRecord: ClusterRecord = {
          clusterId: properties.cluster_id,
          pointCount: properties.point_count,
          coordinates: { lat, lng },
        }

        return {
          id: `cluster_${clusterRecord.clusterId}`,
          coordinates: { lat, lng },
          label: '',
          onClick: (event: MouseEvent) => {
            event.stopPropagation()
            const expansionZoom = entry.index.getClusterExpansionZoom(clusterRecord.clusterId)
            const map = this.mapInstance
            map?.setZoom?.(expansionZoom)
            map?.panTo({ lat, lng })
          },
          _clusterRecord: clusterRecord,
        }
      }

      return properties.order
    })

    this.markerLayerManager.setLayerMarkers(layerId, nextMarkers)
    this.onLayerRecomputed(layerId)
  }
}
