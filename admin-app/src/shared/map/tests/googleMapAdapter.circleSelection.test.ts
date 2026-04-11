import { MAP_MARKER_LAYERS } from '../domain/constants/markerLayers'
import { GoogleMapAdapter } from '../infrastructure/GoogleMapAdapter'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const createLatLng = (lat: number, lng: number) => ({
  lat: () => lat,
  lng: () => lng,
})

const createMarkerElement = () => {
  const el = document.createElement('div')
  el.className = 'map-marker map-marker--variant-order'
  return el
}

export const runGoogleMapAdapterCircleSelectionTests = () => {
  ;(globalThis as any).google = {
    maps: {
      geometry: {
        spherical: {
          computeDistanceBetween: (a: any, b: any) => {
            const dx = a.lat() - b.lat
            const dy = a.lng() - b.lng
            return Math.sqrt(dx * dx + dy * dy)
          },
        },
      },
      event: {
        removeListener: () => undefined,
      },
    },
  }

  const adapter = new GoogleMapAdapter() as any
  const orderNearEl = createMarkerElement()
  const orderFarEl = createMarkerElement()
  const routeGroupEl = createMarkerElement()

  adapter.layers = new Map([
    [
      MAP_MARKER_LAYERS.orders,
      {
        visible: true,
        markers: new Map([
          [
            'order-near',
            {
              marker: { map: {}, position: { lat: 0, lng: 0 } },
              el: orderNearEl,
              order: { id: 'order-near' },
            },
          ],
          [
            'order-far',
            {
              marker: { map: {}, position: { lat: 10, lng: 10 } },
              el: orderFarEl,
              order: { id: 'order-far' },
            },
          ],
        ]),
      },
    ],
    [
      MAP_MARKER_LAYERS.routeGroup,
      {
        visible: true,
        markers: new Map([
          [
            'local-delivery-1',
            {
              marker: { map: {}, position: { lat: 0, lng: 0 } },
              el: routeGroupEl,
              order: { id: 'route-group-1' },
            },
          ],
        ]),
      },
    ],
  ])

  let callbackIds: string[] = []
  adapter.circleSelectionCallback = (ids: string[]) => {
    callbackIds = ids
  }
  adapter.circleSelectionLayerId = MAP_MARKER_LAYERS.orders

  adapter.computeCircleSelection({
    getCenter: () => createLatLng(0, 0),
    getRadius: () => 1,
  })

  assert(callbackIds.length === 1 && callbackIds[0] === 'order-near', 'should select only in-circle order ids')
  assert(orderNearEl.classList.contains('map-marker--multi-selected'), 'near order should get multi selected class')
  assert(
    !orderFarEl.classList.contains('map-marker--multi-selected'),
    'far order should not get multi selected class',
  )
  assert(
    !routeGroupEl.classList.contains('map-marker--multi-selected'),
    'non-orders layer markers should not get multi selected class',
  )

  adapter.circleSelectionLayerId = MAP_MARKER_LAYERS.routeGroup
  callbackIds = []

  adapter.computeCircleSelection({
    getCenter: () => createLatLng(0, 0),
    getRadius: () => 1,
  })

  assert(
    callbackIds.length === 1 && callbackIds[0] === 'route-group-1',
    'should select route-group marker ids when routeGroup layer is active',
  )
  assert(
    routeGroupEl.classList.contains('map-marker--multi-selected'),
    'route-group marker should get multi selected class',
  )

  adapter.disableCircleSelection()
  assert(
    !routeGroupEl.classList.contains('map-marker--multi-selected'),
    'disableCircleSelection should clear active layer multi selected class',
  )
}
