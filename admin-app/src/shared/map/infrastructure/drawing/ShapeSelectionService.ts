import { MAP_MARKER_LAYERS } from '../../domain/constants/markerLayers'
import type { Coordinates } from '../../domain/types'
import type { MarkerLayerManager } from '../markers/MarkerLayerManager'
import type { MarkerMultiSelectionManager } from '../markers/MarkerMultiSelectionManager'

type SelectionContext = {
  activeLayerId: string | null
  callback: ((ids: string[]) => void) | null
}

export class ShapeSelectionService {
  private markerLayerManager: MarkerLayerManager
  private markerMultiSelectionManager: MarkerMultiSelectionManager

  constructor(markerLayerManager: MarkerLayerManager, markerMultiSelectionManager: MarkerMultiSelectionManager) {
    this.markerLayerManager = markerLayerManager
    this.markerMultiSelectionManager = markerMultiSelectionManager
  }

  computeCircleSelection(circle: any, context: SelectionContext) {
    const { activeLayerId, callback } = context
    const selectedLayer = activeLayerId ? this.markerLayerManager.getLayer(activeLayerId) : null

    if (!selectedLayer?.visible || !callback || !activeLayerId) {
      this.markerMultiSelectionManager.applyMultiSelection(activeLayerId ?? MAP_MARKER_LAYERS.default, [])
      callback?.([])
      return
    }

    const center = circle?.getCenter?.()
    const radius = circle?.getRadius?.()

    if (!center || typeof radius !== 'number' || !google.maps.geometry?.spherical) {
      this.markerMultiSelectionManager.applyMultiSelection(activeLayerId, [])
      callback([])
      return
    }

    const selectedIds: string[] = []

    selectedLayer.markers.forEach((entry, id) => {
      if (!entry.marker?.map) {
        return
      }

      const markerPosition = this.resolveMarkerPosition(entry.marker.position)
      if (!markerPosition) {
        return
      }

      const distance = google.maps.geometry.spherical.computeDistanceBetween(center, markerPosition)
      if (distance <= radius) {
        selectedIds.push(id)
      }
    })

    this.markerMultiSelectionManager.applyMultiSelection(activeLayerId, selectedIds)
    callback(selectedIds)
  }

  computeRectangleSelection(rectangle: any, context: SelectionContext) {
    const { activeLayerId, callback } = context
    const selectedLayer = activeLayerId ? this.markerLayerManager.getLayer(activeLayerId) : null

    if (!selectedLayer?.visible || !callback || !activeLayerId) {
      this.markerMultiSelectionManager.applyMultiSelection(activeLayerId ?? MAP_MARKER_LAYERS.default, [])
      callback?.([])
      return
    }

    const bounds = rectangle?.getBounds?.()
    if (!bounds || typeof bounds.contains !== 'function') {
      this.markerMultiSelectionManager.applyMultiSelection(activeLayerId, [])
      callback([])
      return
    }

    const selectedIds: string[] = []

    selectedLayer.markers.forEach((entry, id) => {
      if (!entry.marker?.map) {
        return
      }

      const markerPosition = this.resolveMarkerPosition(entry.marker.position)
      if (!markerPosition) {
        return
      }

      if (bounds.contains(markerPosition)) {
        selectedIds.push(id)
      }
    })

    this.markerMultiSelectionManager.applyMultiSelection(activeLayerId, selectedIds)
    callback(selectedIds)
  }

  computePolygonSelection(polygon: any, context: SelectionContext) {
    const { activeLayerId, callback } = context
    const selectedLayer = activeLayerId ? this.markerLayerManager.getLayer(activeLayerId) : null

    if (!selectedLayer?.visible || !callback || !activeLayerId) {
      this.markerMultiSelectionManager.applyMultiSelection(activeLayerId ?? MAP_MARKER_LAYERS.default, [])
      callback?.([])
      return
    }

    const pathArray = polygon?.getPath?.()?.getArray?.() ?? []
    if (!pathArray.length) {
      this.markerMultiSelectionManager.applyMultiSelection(activeLayerId, [])
      callback([])
      return
    }

    const selectedIds: string[] = []

    selectedLayer.markers.forEach((entry, id) => {
      if (!entry.marker?.map) {
        return
      }

      const markerPosition = this.resolveMarkerPosition(entry.marker.position)
      if (!markerPosition) {
        return
      }

      if (this.isPointInPolygon(markerPosition, polygon, pathArray)) {
        selectedIds.push(id)
      }
    })

    this.markerMultiSelectionManager.applyMultiSelection(activeLayerId, selectedIds)
    callback(selectedIds)
  }

  resolveMarkerPosition(position: any): Coordinates | null {
    if (!position) return null

    if (typeof position.lat === 'function' && typeof position.lng === 'function') {
      return {
        lat: position.lat(),
        lng: position.lng(),
      }
    }

    if (typeof position.lat === 'number' && typeof position.lng === 'number') {
      return {
        lat: position.lat,
        lng: position.lng,
      }
    }

    return null
  }

  private isPointInPolygon(point: Coordinates, polygon: any, pathArray: any[]) {
    if (google.maps.geometry?.poly?.containsLocation && google.maps.LatLng) {
      const latLng = new google.maps.LatLng(point.lat, point.lng)
      return google.maps.geometry.poly.containsLocation(latLng, polygon)
    }

    const polygonPoints = pathArray.map((pathPoint: any) => ({
      lat: pathPoint.lat(),
      lng: pathPoint.lng(),
    }))

    let inside = false
    for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
      const xi = polygonPoints[i].lat
      const yi = polygonPoints[i].lng
      const xj = polygonPoints[j].lat
      const yj = polygonPoints[j].lng

      const intersects = yi > point.lng !== yj > point.lng &&
        point.lat < ((xj - xi) * (point.lng - yi)) / ((yj - yi) || Number.EPSILON) + xi

      if (intersects) inside = !inside
    }

    return inside
  }
}
