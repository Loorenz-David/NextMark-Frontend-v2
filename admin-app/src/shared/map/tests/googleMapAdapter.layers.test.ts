import type { MapOrder } from '../domain/entities/MapOrder'
import { MAP_MARKER_LAYERS } from '../domain/constants/markerLayers'
import { GoogleMapAdapter } from '../infrastructure/GoogleMapAdapter'

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
  const adapter = new GoogleMapAdapter() as any
  const setOptionsCalls: any[] = []
  const fitBoundsCalls: any[] = []
  const panByCalls: Array<{ x: number; y: number }> = []

  adapter.map = {
    id: 'mock-map',
    setOptions: (options: any) => {
      setOptionsCalls.push(options)
    },
    fitBounds: (bounds: any, padding: any) => {
      fitBoundsCalls.push({ bounds, padding })
    },
    getZoom: () => 8,
    setZoom: () => undefined,
    panBy: (x: number, y: number) => {
      panByCalls.push({ x, y })
    },
  }
  adapter.AdvancedMarkerCtor = MockAdvancedMarker
  adapter.LatLngBoundsCtor = class {
    points: unknown[] = []
    extend(point: unknown) {
      this.points.push(point)
    }
  }
  adapter.__calls = {
    setOptionsCalls,
    fitBoundsCalls,
    panByCalls,
  }
  return adapter as GoogleMapAdapter
}

export const runGoogleMapAdapterLayerTests = () => {
  {
    const adapter = createAdapter()
    adapter.setLayerMarkers(MAP_MARKER_LAYERS.orders, [createOrder('order-1')])
    adapter.setLayerMarkers(MAP_MARKER_LAYERS.routeGroup, [createOrder('plan-1')])

    const layers = (adapter as any).layers as Map<string, { markers: Map<string, unknown> }>

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

    const layers = (adapter as any).layers as Map<
      string,
      { markers: Map<string, { marker: { map: unknown } }> }
    >
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

    const layers = (adapter as any).layers as Map<
      string,
      { markers: Map<string, { marker: { map: unknown } }> }
    >
    const orderMarker = layers.get(MAP_MARKER_LAYERS.orders)?.markers.get('order-1')

    assert(orderMarker?.marker.map !== null, 'showing layer should reattach existing marker to map')
  }

  {
    const adapter = createAdapter()
    adapter.setLayerMarkers(MAP_MARKER_LAYERS.orders, [createOrder('order-1')])
    adapter.setLayerMarkers(MAP_MARKER_LAYERS.routeGroup, [createOrder('plan-1')])
    adapter.clearLayer(MAP_MARKER_LAYERS.routeGroup)

    const layers = (adapter as any).layers as Map<string, { markers: Map<string, unknown> }>

    assert(!layers.has(MAP_MARKER_LAYERS.routeGroup), 'clearing one layer should remove only that layer')
    assert(layers.has(MAP_MARKER_LAYERS.orders), 'clearing one layer should keep other layers')
  }

  {
    const adapter = createAdapter()
    adapter.setMarkers([createOrder('default-1')])

    const layers = (adapter as any).layers as Map<string, { markers: Map<string, unknown> }>
    assert(
      layers.get(MAP_MARKER_LAYERS.default)?.markers.has('default-1') === true,
      'setMarkers should map to default layer',
    )
  }

  {
    const adapter = createAdapter() as any
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
    const adapter = createAdapter() as any
    adapter.setViewportInsets({ top: 24, right: 224, bottom: 24, left: 24 })
    adapter.fitBounds([{ lat: 10, lng: 20 }])

    const { panByCalls } = adapter.__calls
    assert(panByCalls.length === 1, 'single-point fit should pan to visible center')
    assert(panByCalls[0].x === -100 && panByCalls[0].y === 0, 'single-point offset should respect inset bias')
  }

  {
    const adapter = createAdapter() as any
    adapter.routePolylines = [
      {
        getPath: () => ({
          getArray: () => [
            { lat: () => 1, lng: () => 1 },
            { lat: () => 2, lng: () => 2 },
          ],
        }),
      },
    ]
    adapter.setLayerMarkers(MAP_MARKER_LAYERS.orders, [createOrder('order-1', 10, 20), createOrder('order-2', 11, 21)])
    adapter.__calls.fitBoundsCalls.length = 0

    adapter.reframeToVisibleArea()

    const { fitBoundsCalls } = adapter.__calls
    assert(fitBoundsCalls.length === 1, 'reframe should call fitBounds when route points exist')
    assert(fitBoundsCalls[0].bounds.points[0].lat === 1, 'reframe should prioritize route points over marker points')
  }

  {
    const adapter = createAdapter() as any
    adapter.setLayerMarkers(MAP_MARKER_LAYERS.orders, [createOrder('order-1', 10, 20), createOrder('order-2', 11, 21)])
    adapter.__calls.fitBoundsCalls.length = 0

    adapter.reframeToVisibleArea()

    const { fitBoundsCalls } = adapter.__calls
    assert(fitBoundsCalls.length === 1, 'reframe should fit visible marker points when route points are absent')
    assert(fitBoundsCalls[0].bounds.points[0].lat === 10, 'reframe should fallback to marker points')
  }

  {
    const adapter = createAdapter() as any
    adapter.reframeToVisibleArea()
    assert(adapter.__calls.fitBoundsCalls.length === 0, 'reframe should no-op when there are no points to frame')
  }
}
