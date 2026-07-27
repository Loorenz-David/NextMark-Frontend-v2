import { RouteRenderer } from '../infrastructure/route/RouteRenderer'
import type { MapInstanceManager } from '../infrastructure/core/MapInstanceManager'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

type PolylineOptions = {
  map: unknown
  path: Array<{ lat: number; lng: number }>
  strokeColor: string
  strokeOpacity: number
  strokeWeight: number
}

class MockPolyline {
  static instances: MockPolyline[] = []

  options: PolylineOptions
  detached = false

  constructor(options: PolylineOptions) {
    this.options = options
    MockPolyline.instances.push(this)
  }

  setMap(map: unknown) {
    this.detached = map === null
  }

  getPath() {
    return {
      getArray: () => this.options.path.map((point) => ({
        lat: () => point.lat,
        lng: () => point.lng,
      })),
    }
  }
}

export const runRouteRendererProgressTests = () => {
  const previousGoogle = globalThis.google
  const previousConsoleError = console.error
  const renderedPointCounts: number[] = []

  try {
    console.error = () => undefined
    globalThis.google = {
      maps: {
        geometry: {
          encoding: {
            decodePath: (encoded: string) => {
              if (encoded === 'invalid') {
                throw new Error('invalid encoded path')
              }

              return [
                { lat: () => 59, lng: () => 18 },
                { lat: () => 60, lng: () => 19 },
              ]
            },
          },
        },
      },
    } as typeof google

    MockPolyline.instances = []
    const renderer = new RouteRenderer(
      {
        getMap: () => ({ id: 'map' }),
        getPolylineCtor: () => MockPolyline,
      } as unknown as MapInstanceManager,
      (points) => renderedPointCounts.push(points.length),
    )

    renderer.drawRoute({
      segments: [
        { path: 'completed', state: 'completed' },
        { path: 'pending', state: 'pending' },
      ],
    })

    assert(MockPolyline.instances.length === 4, 'each segment should render an outer and inner polyline')
    assert(
      MockPolyline.instances[1]?.options.strokeColor === '#2563eb',
      'completed segments should use the admin completed blue',
    )
    assert(
      MockPolyline.instances[3]?.options.strokeColor === '#bfdbfe',
      'pending segments should use the admin pending blue',
    )
    assert(renderedPointCounts[0] === 4, 'bounds should receive decoded points once per segment')

    const initialPolylines = [...MockPolyline.instances]
    renderer.drawRoute({
      segments: [
        { path: 'invalid', state: 'pending' },
        { path: 'valid', state: 'completed' },
      ],
      fitBounds: false,
    })

    assert(
      initialPolylines.every((polyline) => polyline.detached),
      'redrawing should detach the previous progress polylines',
    )
    assert(MockPolyline.instances.length === 6, 'a decoding failure should not prevent later segments rendering')
    assert(renderedPointCounts.length === 1, 'fitBounds false should suppress route reframing')

    renderer.clearRoute()
    assert(
      MockPolyline.instances.slice(-2).every((polyline) => polyline.detached),
      'clearing should detach both strokes',
    )
  } finally {
    console.error = previousConsoleError
    globalThis.google = previousGoogle
  }
}
