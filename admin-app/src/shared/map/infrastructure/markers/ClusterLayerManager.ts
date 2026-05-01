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
  options: Required<SetClusteredMarkerLayerOptions>
  signature: string
  clusterRecordByMarkerId: Record<string, ClusterRecord>
  visibleMarkerIdByLeafId: Record<string, string>
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

const roundClusterCoordinate = (value: number) => value.toFixed(6)

const buildClusterMarkerId = ({
  lat,
  lng,
  pointCount,
}: {
  lat: number
  lng: number
  pointCount: number
}) => `cluster_${roundClusterCoordinate(lat)}_${roundClusterCoordinate(lng)}_${pointCount}`

const uniqueStrings = (values: string[]) => Array.from(new Set(values))

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
  ): string[] {
    const opts = { ...CLUSTER_DEFAULTS, ...options }
    const sortedOrders = sortOrdersForClusterIndex(orders)
    const nextSignature = buildLayerSignature(sortedOrders, {
      radius: opts.radius,
      minZoom: opts.minZoom,
      maxZoom: opts.maxZoom,
    })
    const existing = this.layers.get(layerId)

    if (existing?.signature === nextSignature) {
      return this.recomputeLayer(layerId)
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
      options: {
        radius: opts.radius,
        minZoom: opts.minZoom,
        maxZoom: opts.maxZoom,
      },
      signature: nextSignature,
      clusterRecordByMarkerId: {},
      visibleMarkerIdByLeafId: {},
    })
    return this.recomputeLayer(layerId)
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

  removeOrdersByIds(layerId: string, ids: string[]): string[] {
    const entry = this.layers.get(layerId)
    if (!entry) {
      return []
    }

    const idSet = new Set(ids.map(String).filter(Boolean))
    if (idSet.size === 0) {
      return []
    }

    const nextOrders = entry.rawOrders.filter(
      (order) => !idSet.has(String(order.id)),
    )
    if (nextOrders.length === entry.rawOrders.length) {
      return []
    }

    if (nextOrders.length === 0) {
      return this.clearLayer(layerId)
    }

    return this.setLayer(layerId, nextOrders, entry.options)
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

      const clusterId = entry.clusterRecordByMarkerId[markerId]?.clusterId ?? null
      if (!Number.isFinite(clusterId)) {
        return
      }

      entry.index.getLeaves(clusterId, Infinity).forEach((leaf) => {
        expanded.push(leaf.properties.originalId)
      })
    })

    return Array.from(new Set(expanded))
  }

  resolveVisibleMarkerId(markerId: string): string {
    const normalizedId = String(markerId)
    for (const entry of this.layers.values()) {
      const visibleMarkerId = entry.visibleMarkerIdByLeafId[normalizedId]
      if (visibleMarkerId) {
        return visibleMarkerId
      }
    }

    return normalizedId
  }

  private recomputeAll(): void {
    Array.from(this.layers.keys()).forEach((layerId) => {
      this.recomputeLayer(layerId)
    })
  }

  private recomputeLayer(layerId: string): string[] {
    const entry = this.layers.get(layerId)
    if (!entry || !this.mapInstance) {
      return []
    }

    const bounds = this.mapInstance.getBounds()
    const zoom = this.mapInstance.getZoom()
    if (!bounds || zoom == null) {
      return []
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
    const nextClusterRecordByMarkerId: Record<string, ClusterRecord> = {}
    const nextVisibleMarkerIdByLeafId: Record<string, string> = {}

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
        const markerId = buildClusterMarkerId({
          lat,
          lng,
          pointCount: clusterRecord.pointCount,
        })
        nextClusterRecordByMarkerId[markerId] = clusterRecord
        const leaves = entry.index.getLeaves(clusterRecord.clusterId, Infinity)
        const leafOrders = leaves.map((leaf) => leaf.properties.order)
        const hoverIds = uniqueStrings(
          leafOrders.flatMap((order) => order.hoverIds ?? [String(order.id)]),
        )
        const hoverIdsEnter = leafOrders.find((order) => order.onHoverIdsEnter)?.onHoverIdsEnter
        const hoverIdsLeave = leafOrders.find((order) => order.onHoverIdsLeave)?.onHoverIdsLeave

        leaves.forEach((leaf) => {
          nextVisibleMarkerIdByLeafId[leaf.properties.originalId] = markerId
        })

        return {
          id: markerId,
          coordinates: { lat, lng },
          label: '',
          onClick: (event: MouseEvent) => {
            event.stopPropagation()
            const expansionZoom = entry.index.getClusterExpansionZoom(clusterRecord.clusterId)
            const map = this.mapInstance
            map?.setZoom?.(expansionZoom)
            map?.panTo({ lat, lng })
          },
          hoverIds,
          onMouseEnter: hoverIdsEnter
            ? (event: MouseEvent) => hoverIdsEnter(event, hoverIds)
            : undefined,
          onMouseLeave: hoverIdsLeave
            ? (event: MouseEvent) => hoverIdsLeave(event, hoverIds)
            : undefined,
          _clusterRecord: clusterRecord,
        }
      }

      nextVisibleMarkerIdByLeafId[properties.originalId] = properties.originalId
      return properties.order
    })

    entry.clusterRecordByMarkerId = nextClusterRecordByMarkerId
    entry.visibleMarkerIdByLeafId = nextVisibleMarkerIdByLeafId
    const { removedIds } = this.markerLayerManager.setLayerMarkers(layerId, nextMarkers)
    this.onLayerRecomputed(layerId)
    return removedIds
  }
}
