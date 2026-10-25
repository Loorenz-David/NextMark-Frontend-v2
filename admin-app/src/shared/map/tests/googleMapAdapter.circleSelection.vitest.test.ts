// @vitest-environment jsdom
import { it } from 'vitest'

import { MAP_MARKER_LAYERS } from '../domain/constants/markerLayers'
import type { MapOrder } from '../domain/entities/MapOrder'
import { MapInstanceManager } from '../infrastructure/core/MapInstanceManager'
import { ShapeSelectionService } from '../infrastructure/drawing/ShapeSelectionService'
import { MarkerLayerManager } from '../infrastructure/markers/MarkerLayerManager'
import { MarkerMultiSelectionManager } from '../infrastructure/markers/MarkerMultiSelectionManager'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

class MockAdvancedMarker {
  map: object | null
  position: { lat: number; lng: number }
  content: HTMLElement

  constructor(options: { map: object | null; position: { lat: number; lng: number }; content: HTMLElement }) {
    this.map = options.map
    this.position = options.position
    this.content = options.content
  }
}

const order = (id: string, lat: number, lng: number): MapOrder => ({
  id,
  coordinates: { lat, lng },
  onClick: () => undefined,
})

it('selects only markers inside the circle in the active layer', () => {
  Object.assign(globalThis, {
    google: {
      maps: {
        geometry: {
          spherical: {
            computeDistanceBetween: (
              left: { lat: number; lng: number },
              right: { lat: number; lng: number },
            ) => Math.hypot(left.lat - right.lat, left.lng - right.lng),
          },
        },
      },
    },
  })

  const mapInstanceManager = new MapInstanceManager()
  Object.assign(mapInstanceManager, {
    getMap: () => ({ id: 'mock-map' }),
    getAdvancedMarkerCtor: () => MockAdvancedMarker,
  })
  const layers = new MarkerLayerManager(mapInstanceManager)
  const selection = new MarkerMultiSelectionManager(layers)
  const shapes = new ShapeSelectionService(layers, selection)
  layers.setLayerMarkers(MAP_MARKER_LAYERS.orders, [order('order-near', 0, 0), order('order-far', 10, 10)])
  layers.setLayerMarkers(MAP_MARKER_LAYERS.routeGroup, [order('route-group-1', 0, 0)])

  const circle = { getCenter: () => ({ lat: 0, lng: 0 }), getRadius: () => 1 }
  let callbackIds: string[] = []
  shapes.computeCircleSelection(circle, {
    activeLayerId: MAP_MARKER_LAYERS.orders,
    callback: (ids) => { callbackIds = ids },
  })

  const near = layers.getLayer(MAP_MARKER_LAYERS.orders)?.markers.get('order-near')?.el
  const far = layers.getLayer(MAP_MARKER_LAYERS.orders)?.markers.get('order-far')?.el
  const routeGroup = layers.getLayer(MAP_MARKER_LAYERS.routeGroup)?.markers.get('route-group-1')?.el
  assert(callbackIds.length === 1 && callbackIds[0] === 'order-near', 'circle should select only near orders')
  assert(near?.classList.contains('map-marker--multi-selected') === true, 'near order should be styled')
  assert(far?.classList.contains('map-marker--multi-selected') === false, 'far order should not be styled')
  assert(routeGroup?.classList.contains('map-marker--multi-selected') === false, 'other layer should not be styled')

  shapes.computeCircleSelection(circle, {
    activeLayerId: MAP_MARKER_LAYERS.routeGroup,
    callback: (ids) => { callbackIds = ids },
  })
  assert(callbackIds.length === 1 && callbackIds[0] === 'route-group-1', 'route-group layer should select its own marker')
  assert(routeGroup?.classList.contains('map-marker--multi-selected') === true, 'selected route group should be styled')

  selection.clearMultiSelectionStyles(MAP_MARKER_LAYERS.routeGroup)
  selection.clearSelectedIds()
  assert(routeGroup?.classList.contains('map-marker--multi-selected') === false, 'clearing selection should remove style')
})
