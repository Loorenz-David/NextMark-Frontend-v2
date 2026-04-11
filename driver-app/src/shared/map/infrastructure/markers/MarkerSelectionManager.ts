import type { MarkerLayerManager } from './MarkerLayerManager'

const getInteractionVariant = (mapMarker: { interactionVariant?: string }) => mapMarker.interactionVariant ?? 'default'

export class MarkerSelectionManager {
  private selectedMarkerId: string | null = null
  private hoveredMarkerId: string | null = null
  private markerLayerManager: MarkerLayerManager

  constructor(markerLayerManager: MarkerLayerManager) {
    this.markerLayerManager = markerLayerManager
  }

  selectMarker(id: string) {
    this.setSelectedMarker(id)
  }

  setSelectedMarker(id: string | null) {
    const normalizedId = id == null ? null : String(id)
    if (this.selectedMarkerId === normalizedId) {
      return
    }

    if (this.selectedMarkerId) {
      const previous = this.markerLayerManager.findMarkerEntryById(this.selectedMarkerId)
      if (previous) {
        const previousVariant = getInteractionVariant(previous.entry.mapMarker)
        previous.entry.el.classList.remove('map-marker--selected')
        previous.entry.el.classList.remove(`map-marker--selected-${previousVariant}`)
      }
    }

    this.selectedMarkerId = normalizedId
    if (!this.selectedMarkerId) {
      return
    }

    const current = this.markerLayerManager.findMarkerEntryById(this.selectedMarkerId)
    if (!current) {
      return
    }

    const currentVariant = getInteractionVariant(current.entry.mapMarker)
    current.entry.el.classList.add('map-marker--selected')
    current.entry.el.classList.add(`map-marker--selected-${currentVariant}`)
  }

  setHoveredMarker(id: string | null) {
    const normalizedId = id == null ? null : String(id)
    if (this.hoveredMarkerId === normalizedId) {
      return
    }

    if (this.hoveredMarkerId) {
      const previous = this.markerLayerManager.findMarkerEntryById(this.hoveredMarkerId)
      previous?.entry.el.classList.remove('map-marker--hovered')
    }

    this.hoveredMarkerId = normalizedId
    if (!this.hoveredMarkerId) {
      return
    }

    const current = this.markerLayerManager.findMarkerEntryById(this.hoveredMarkerId)
    current?.entry.el.classList.add('map-marker--hovered')
  }

  reconcileSelectionState() {
    if (this.selectedMarkerId && !this.markerLayerManager.findMarkerEntryById(this.selectedMarkerId)) {
      this.selectedMarkerId = null
    }

    if (this.hoveredMarkerId && !this.markerLayerManager.findMarkerEntryById(this.hoveredMarkerId)) {
      this.hoveredMarkerId = null
    }
  }

  reapplySelectionStyles() {
    if (this.selectedMarkerId) {
      const selected = this.markerLayerManager.findMarkerEntryById(this.selectedMarkerId)
      if (selected) {
        const variant = getInteractionVariant(selected.entry.mapMarker)
        selected.entry.el.classList.add('map-marker--selected')
        selected.entry.el.classList.add(`map-marker--selected-${variant}`)
      }
    }

    if (this.hoveredMarkerId) {
      const hovered = this.markerLayerManager.findMarkerEntryById(this.hoveredMarkerId)
      hovered?.entry.el.classList.add('map-marker--hovered')
    }
  }

  reset() {
    this.setSelectedMarker(null)
    this.setHoveredMarker(null)
    this.selectedMarkerId = null
    this.hoveredMarkerId = null
  }
}
