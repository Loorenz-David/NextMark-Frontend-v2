import type { Order } from '@/features/order/types/order'

import {
  buildStartEndMarker,
  resolveLocalDeliveryGroupOperationBadgeDirections,
  resolveLocalDeliveryOperationBadgeDirections,
} from '../localDeliveryMap.flow'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const buildOrder = (overrides?: Partial<Order>): Order => ({
  client_id: 'order-client-1',
  operation_type: 'dropoff',
  client_address: {
    street_address: 'Main 1',
    city: 'Stockholm',
    country: 'SE',
    postal_code: '11120',
    coordinates: { lat: 59.3293, lng: 18.0686 },
  },
  ...overrides,
})

export const runLocalDeliveryMapFlowTests = () => {
  {
    const directions = resolveLocalDeliveryOperationBadgeDirections(
      buildOrder({ operation_type: 'pickup' }),
    )
    assert(
      directions.length === 1 && directions[0] === 'up',
      'single pickup local marker should map to up direction',
    )
  }

  {
    const directions = resolveLocalDeliveryOperationBadgeDirections(
      buildOrder({ operation_type: 'pickup_dropoff' }),
    )
    assert(
      directions.includes('up') && directions.includes('down'),
      'single pickup_dropoff local marker should map to both directions',
    )
  }

  {
    const directions = resolveLocalDeliveryGroupOperationBadgeDirections([
      { order: buildOrder({ operation_type: 'pickup' }) },
      { order: buildOrder({ operation_type: 'dropoff' }) },
    ])
    assert(
      directions.includes('up') && directions.includes('down'),
      'grouped local marker should resolve operation directions as union',
    )
  }

  {
    const startMarker = buildStartEndMarker({
      label: 'S',
      status: 'start',
      idPrefix: 'route-start-test',
      boundary: {
        label: 'Start location',
        location: {
          street_address: 'Boundary 1',
          city: 'Stockholm',
          country: 'SE',
          postal_code: '11120',
          coordinates: { lat: 59.3293, lng: 18.0686 },
        },
        time: null,
        hasWarnings: false,
        warnings: [],
      },
      onClick: () => undefined,
    })

    assert(!!startMarker, 'start boundary marker should be created when coordinates are available')
    assert(
      !startMarker?.operationBadgeDirections,
      'start/end boundary markers should not include operation badge directions',
    )
  }
}

