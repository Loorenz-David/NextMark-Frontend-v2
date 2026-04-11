import type { MarkerLayerManager } from './MarkerLayerManager'

export class MarkerMultiSelectionManager {
  private activeLayerId: string | null = null
  private multiSelectedIds = new Set<string>()
  private markerLayerManager: MarkerLayerManager

  constructor(markerLayerManager: MarkerLayerManager) {
    this.markerLayerManager = markerLayerManager
  }

  setActiveLayer(layerId: string | null) {
    this.activeLayerId = layerId
  }

  getActiveLayerId() {
    return this.activeLayerId
  }

  isActiveLayer(layerId: string) {
    return this.activeLayerId === layerId
  }

  hasMultiSelectedId(id: string) {
    return this.multiSelectedIds.has(id)
  }

  applyMultiSelection(layerId: string, ids: string[]) {
    const nextIds = new Set(ids)
    const selectedLayer = this.markerLayerManager.getLayer(layerId)

    if (!selectedLayer) {
      this.multiSelectedIds = nextIds
      return
    }

    this.multiSelectedIds.forEach((id) => {
      if (!nextIds.has(id)) {
        const marker = selectedLayer.markers.get(id)
        marker?.el.classList.remove('map-marker--multi-selected')
      }
    })

    nextIds.forEach((id) => {
      const marker = selectedLayer.markers.get(id)
      marker?.el.classList.add('map-marker--multi-selected')
    })

    this.multiSelectedIds = nextIds
  }

  syncLayerStyles(layerId: string) {
    const layer = this.markerLayerManager.getLayer(layerId)
    if (!layer) return

    const isLayerActive = this.activeLayerId === layerId
    layer.markers.forEach(({ el }, id) => {
      if (!isLayerActive) {
        el.classList.remove('map-marker--multi-selected')
        return
      }

      if (this.multiSelectedIds.has(id)) {
        el.classList.add('map-marker--multi-selected')
      } else {
        el.classList.remove('map-marker--multi-selected')
      }
    })
  }

  clearMultiSelectionStyles(layerId?: string) {
    const selectedLayer = layerId ? this.markerLayerManager.getLayer(layerId) : null
    if (!selectedLayer) return

    selectedLayer.markers.forEach(({ el }) => {
      el.classList.remove('map-marker--multi-selected')
    })
  }

  removeIds(ids: string[]) {
    ids.forEach((id) => {
      this.multiSelectedIds.delete(id)
    })
  }

  clearSelectedIds() {
    this.multiSelectedIds.clear()
  }

  clearAll() {
    this.clearMultiSelectionStyles(this.activeLayerId ?? undefined)
    this.multiSelectedIds.clear()
    this.activeLayerId = null
  }
}
