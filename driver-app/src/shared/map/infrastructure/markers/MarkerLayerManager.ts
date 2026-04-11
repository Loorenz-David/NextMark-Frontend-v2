import {
  applyMarkerContent,
  createMarkerElement,
} from '../../presentation/mapMarkerElement.factory'
import type { MapMarker } from '../../domain/entities/MapMarker'
import type { Coordinates, SetMarkerLayerOptions } from '../../domain/types'
import type { MapInstanceManager } from '../core/MapInstanceManager'

export type LayerMarkerRecord = {
  marker: {
    map: unknown
    position: unknown
  }
  el: HTMLElement
  mapMarker: MapMarker
}

type MarkerLayer = {
  visible: boolean
  markers: Map<string, LayerMarkerRecord>
}

const getInteractionVariant = (mapMarker: MapMarker) => mapMarker.interactionVariant ?? 'default'

const applyMarkerClasses = (el: HTMLElement, className?: string) => {
    if (!className) {
        return
    }

    const classNames = className
        .split(/\s+/)
        .map((value) => value.trim())
        .filter(Boolean)

    if (classNames.length > 0) {
        el.classList.add(...classNames)
    }
}

const applyBaseMarkerAppearance = (el: HTMLElement, mapMarker: MapMarker) => {
  const interactionVariant = getInteractionVariant(mapMarker)
  el.className = 'map-marker'

  if (mapMarker.markerColor) {
    el.style.setProperty('--marker-bg', mapMarker.markerColor)
  } else {
    el.style.removeProperty('--marker-bg')
  }

  el.dataset.markerVariant = interactionVariant
  el.classList.add(`map-marker--variant-${interactionVariant}`)

  if (mapMarker.status) {
    el.classList.add(`${mapMarker.status}-marker`)
  }

  applyMarkerClasses(el, mapMarker.className)

  applyMarkerContent(el, mapMarker)
}

export class MarkerLayerManager {
  private layers = new Map<string, MarkerLayer>()
  private layerSnapshots = new Map<string, MapMarker[]>()
  private mapInstanceManager: MapInstanceManager

  constructor(mapInstanceManager: MapInstanceManager) {
    this.mapInstanceManager = mapInstanceManager
  }

  setLayerMarkers(layerId: string, mapMarkers: MapMarker[], options?: SetMarkerLayerOptions) {
    const map = this.mapInstanceManager.getMap()
    const AdvancedMarkerCtor = this.mapInstanceManager.getAdvancedMarkerCtor()
    const layer = this.getOrCreateLayer(layerId)

    this.layerSnapshots.set(layerId, mapMarkers)

    if (!AdvancedMarkerCtor) {
      return { shouldFitBounds: false }
    }

    const nextIds = new Set(mapMarkers.map((marker) => String(marker.id)))

    Array.from(layer.markers.entries()).forEach(([id, entry]) => {
      if (!nextIds.has(id)) {
        entry.marker.map = null
        entry.el.onclick = null
        entry.el.onmouseenter = null
        entry.el.onmouseleave = null
        layer.markers.delete(id)
      }
    })

    mapMarkers.forEach((mapMarker) => {
      const id = String(mapMarker.id)
      const existing = layer.markers.get(id)

      if (existing) {
        existing.mapMarker = mapMarker
        existing.marker.position = mapMarker.coordinates
        applyBaseMarkerAppearance(existing.el, mapMarker)
        existing.el.onclick = (event: MouseEvent) => mapMarker.onClick?.(event)
        existing.el.onmouseenter = (event: MouseEvent) => mapMarker.onMouseEnter?.(event)
        existing.el.onmouseleave = (event: MouseEvent) => mapMarker.onMouseLeave?.(event)
        existing.marker.map = layer.visible ? map : null
        return
      }

      const content = createMarkerElement(mapMarker)
      content.onclick = (event: MouseEvent) => mapMarker.onClick?.(event)
      content.onmouseenter = (event: MouseEvent) => mapMarker.onMouseEnter?.(event)
      content.onmouseleave = (event: MouseEvent) => mapMarker.onMouseLeave?.(event)

      const marker = new AdvancedMarkerCtor({
        map: layer.visible ? map : null,
        position: mapMarker.coordinates,
        content,
      })

      layer.markers.set(id, {
        marker,
        el: content,
        mapMarker,
      })
    })

    return {
      shouldFitBounds: Boolean(options?.fitBounds) && layer.visible && mapMarkers.length > 0,
    }
  }

  setLayerVisibility(layerId: string, visible: boolean) {
    const map = this.mapInstanceManager.getMap()
    const layer = this.layers.get(layerId)
    if (!layer) {
      return
    }

    layer.visible = visible
    layer.markers.forEach(({ marker }) => {
      marker.map = visible ? map : null
    })
  }

  clearLayer(layerId: string) {
    const layer = this.layers.get(layerId)
    if (!layer) {
      return
    }

    layer.markers.forEach(({ marker, el }) => {
      marker.map = null
      el.onclick = null
      el.onmouseenter = null
      el.onmouseleave = null
    })

    layer.markers.clear()
    this.layers.delete(layerId)
    this.layerSnapshots.delete(layerId)
  }

  clearMarkers() {
    Array.from(this.layers.keys()).forEach((layerId) => {
      this.clearLayer(layerId)
    })
  }

  replayLayerSnapshots(onVisibleMarkers: (points: Coordinates[]) => void) {
    if (!this.mapInstanceManager.getAdvancedMarkerCtor()) {
      return
    }

    this.layerSnapshots.forEach((markers, layerId) => {
      this.setLayerMarkers(layerId, markers)
      const layer = this.layers.get(layerId)
      if (layer) {
        this.setLayerVisibility(layerId, layer.visible)
      }
      if (layer?.visible && markers.length) {
        onVisibleMarkers(markers.map((marker) => marker.coordinates))
      }
    })
  }

  findMarkerEntryById(id: string) {
    for (const [layerId, layer] of this.layers.entries()) {
      const entry = layer.markers.get(id)
      if (entry) {
        return { layerId, entry }
      }
    }

    return null
  }

  getVisibleMarkerPoints() {
    const points: Coordinates[] = []

    this.layers.forEach((layer) => {
      if (!layer.visible) {
        return
      }

      layer.markers.forEach(({ marker }) => {
        const position = marker.position
        if (!position) {
          return
        }

        const functionPosition = position as { lat?: () => number; lng?: () => number }
        if (typeof functionPosition.lat === 'function' && typeof functionPosition.lng === 'function') {
          points.push({
            lat: functionPosition.lat(),
            lng: functionPosition.lng(),
          })
          return
        }

        const coordinates = position as Coordinates
        if (typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number') {
          points.push(coordinates)
        }
      })
    })

    return points
  }

  private getOrCreateLayer(layerId: string) {
    const existing = this.layers.get(layerId)
    if (existing) {
      return existing
    }

    const created: MarkerLayer = {
      visible: true,
      markers: new Map(),
    }
    this.layers.set(layerId, created)
    return created
  }
}
