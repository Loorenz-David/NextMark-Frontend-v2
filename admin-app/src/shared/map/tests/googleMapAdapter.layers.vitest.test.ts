// @vitest-environment jsdom
import { it } from 'vitest'

import type { MapOrder } from '../domain/entities/MapOrder'
import { MAP_MARKER_LAYERS } from '../domain/constants/markerLayers'
import { GoogleMapAdapter } from '../infrastructure/GoogleMapAdapter'
import { MapInstanceManager } from '../infrastructure/core/MapInstanceManager'
import type { MarkerLayer } from '../infrastructure/markers/MarkerLayerManager'
import type { RouteRenderer } from '../infrastructure/route/RouteRenderer'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

class MockAdvancedMarker {
  map: unknown
  position: unknown
  content: HTMLElement
  zIndex: number

  constructor(options: { map: unknown; position: unknown; content: HTMLElement; zIndex: number }) {
    this.map = options.map
    this.position = options.position
    this.content = options.content
    this.zIndex = options.zIndex
  }
}

const createOrder = (id: string, lat = 10, lng = 20): MapOrder => ({
  id,
  coordinates: { lat, lng },
  onClick: () => undefined,
})

const createAdapter = () => {
  const adapter = new GoogleMapAdapter()
  const setOptionsCalls: object[] = []
  const fitBoundsCalls: Array<{ bounds: { points: Array<{ lat: number; lng: number }> }; padding: { top: number; right: number; bottom: number; left: number } }> = []
  const panByCalls: Array<{ x: number; y: number }> = []

  const map = {
    id: 'mock-map',
    setOptions: (options: object) => {
      setOptionsCalls.push(options)
    },
    fitBounds: (bounds: { points: Array<{ lat: number; lng: number }> }, padding: { top: number; right: number; bottom: number; left: number }) => {
      fitBoundsCalls.push({ bounds, padding })
    },
    getZoom: () => 8,
    setZoom: () => undefined,
    panBy: (x: number, y: number) => {
      panByCalls.push({ x, y })
    },
  }
  const LatLngBoundsCtor = class {
    points: unknown[] = []
    extend(point: unknown) {
      this.points.push(point)
    }
  }
  const mapInstanceManager = Reflect.get(adapter, 'mapInstanceManager') as MapInstanceManager
  Object.assign(mapInstanceManager, {
    getMap: () => map,
    getAdvancedMarkerCtor: () => MockAdvancedMarker,
    getLatLngBoundsCtor: () => LatLngBoundsCtor,
  })
  return Object.assign(adapter, { __calls: {
    setOptionsCalls,
    fitBoundsCalls,
    panByCalls,
  } })
}

const getLayers = (adapter: GoogleMapAdapter): Map<string, MarkerLayer> => {
  const manager = Reflect.get(adapter, 'markerLayerManager')
  return Reflect.get(manager, 'layers') as Map<string, MarkerLayer>
}

it('keeps marker layers separate and fits the visible viewport', () => {
  Object.assign(globalThis, { google: { maps: { LatLng: class {} } } })
  {
    const adapter = createAdapter()
    adapter.setLayerMarkers(MAP_MARKER_LAYERS.orders, [createOrder('order-1')])
    adapter.setLayerMarkers(MAP_MARKER_LAYERS.routeGroup, [createOrder('plan-1')])

    const layers = getLayers(adapter)

    assert(layers.get(MAP_MARKER_LAYERS.orders)?.markers.size === 1, 'orders layer should hold its own marker')
    assert(
      layers.get(MAP_MARKER_LAYERS.routeGroup)?.markers.size === 1,
      'routeGroup layer should hold its own marker',
    )
  }

  {
    const adapter = createAdapter()
    adapter.setLayerMarkers(MAP_MARKER_LAYERS.orders, [createOrder('order-1')])
    adapter.setLayerMarkers(MAP_MARKER_LAYERS.routeGroup, [createOrder('plan-1')])
    adapter.setLayerVisibility(MAP_MARKER_LAYERS.orders, false)

    const layers = getLayers(adapter)
    const orderMarker = layers.get(MAP_MARKER_LAYERS.orders)?.markers.get('order-1')
    const planMarker = layers.get(MAP_MARKER_LAYERS.routeGroup)?.markers.get('plan-1')

    assert(orderMarker?.marker.map === null, 'hidden layer marker should detach from map')
    assert(planMarker?.marker.map !== null, 'other layer marker should remain visible')
  }

  {
    const adapter = createAdapter()
    adapter.setLayerMarkers(MAP_MARKER_LAYERS.orders, [createOrder('order-1')])
    adapter.setLayerVisibility(MAP_MARKER_LAYERS.orders, false)
    adapter.setLayerVisibility(MAP_MARKER_LAYERS.orders, true)

    const layers = getLayers(adapter)
    const orderMarker = layers.get(MAP_MARKER_LAYERS.orders)?.markers.get('order-1')

    assert(orderMarker?.marker.map !== null, 'showing layer should reattach existing marker to map')
  }

  {
    const adapter = createAdapter()
    adapter.setLayerMarkers(MAP_MARKER_LAYERS.orders, [createOrder('order-1')])
    adapter.setLayerMarkers(MAP_MARKER_LAYERS.routeGroup, [createOrder('plan-1')])
    adapter.clearLayer(MAP_MARKER_LAYERS.routeGroup)

    const layers = getLayers(adapter)

    assert(!layers.has(MAP_MARKER_LAYERS.routeGroup), 'clearing one layer should remove only that layer')
    assert(layers.has(MAP_MARKER_LAYERS.orders), 'clearing one layer should keep other layers')
  }

  {
    const adapter = createAdapter()
    adapter.setMarkers([createOrder('default-1')])

    const layers = getLayers(adapter)
    assert(
      layers.get(MAP_MARKER_LAYERS.default)?.markers.has('default-1') === true,
      'setMarkers should map to default layer',
    )
  }

  {
    const adapter = createAdapter()
    adapter.setViewportInsets({ top: 40, right: 300, bottom: 30, left: 20 })
    adapter.fitBounds([
      { lat: 10, lng: 20 },
      { lat: 11, lng: 21 },
    ])

    const { fitBoundsCalls } = adapter.__calls
    assert(fitBoundsCalls.length === 1, 'fitBounds should be invoked for multi-point bounds')
    assert(
      fitBoundsCalls[0].padding?.right === 300 &&
        fitBoundsCalls[0].padding?.top === 40 &&
        fitBoundsCalls[0].padding?.bottom === 30 &&
        fitBoundsCalls[0].padding?.left === 20,
      'fitBounds should use viewport insets padding',
    )
  }

  {
    const adapter = createAdapter()
    adapter.setViewportInsets({ top: 24, right: 224, bottom: 24, left: 24 })
    adapter.fitBounds([{ lat: 10, lng: 20 }])

    const { panByCalls } = adapter.__calls
    assert(panByCalls.length === 1, 'single-point fit should pan to visible center')
    assert(panByCalls[0].x === -100 && panByCalls[0].y === 0, 'single-point offset should respect inset bias')
  }

  {
    const adapter = createAdapter()
    const routeRenderer = Reflect.get(adapter, 'routeRenderer') as RouteRenderer
    Object.assign(routeRenderer, { routePolylines: [
      {
        setMap: () => undefined,
        getPath: () => ({
          getArray: () => [
            { lat: () => 1, lng: () => 1 },
            { lat: () => 2, lng: () => 2 },
          ],
        }),
      },
    ] })
    adapter.setLayerMarkers(MAP_MARKER_LAYERS.orders, [createOrder('order-1', 10, 20), createOrder('order-2', 11, 21)])
    adapter.__calls.fitBoundsCalls.length = 0

    adapter.reframeToVisibleArea()

    const { fitBoundsCalls } = adapter.__calls
    assert(fitBoundsCalls.length === 1, 'reframe should call fitBounds when route points exist')
    assert(fitBoundsCalls[0].bounds.points[0].lat === 1, 'reframe should prioritize route points over marker points')
  }

  {
    const adapter = createAdapter()
    adapter.setLayerMarkers(MAP_MARKER_LAYERS.orders, [createOrder('order-1', 10, 20), createOrder('order-2', 11, 21)])
    adapter.__calls.fitBoundsCalls.length = 0

    adapter.reframeToVisibleArea()

    const { fitBoundsCalls } = adapter.__calls
    assert(fitBoundsCalls.length === 1, 'reframe should fit visible marker points when route points are absent')
    assert(fitBoundsCalls[0].bounds.points[0].lat === 10, 'reframe should fallback to marker points')
  }

  {
    const adapter = createAdapter()
    adapter.reframeToVisibleArea()
    assert(adapter.__calls.fitBoundsCalls.length === 0, 'reframe should no-op when there are no points to frame')
  }
})
