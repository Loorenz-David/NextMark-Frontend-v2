import type { Order } from '@/features/order/types/order'

const DEFAULT_ORDER: Order = {
  id: 11001,
  client_id: 'fixture_order_11001',
  order_plan_objective: 'local_delivery',
  operation_type: 'dropoff',
  order_scalar_id: 5001,
  reference_number: 'RG-5001',
  external_source: 'fixture',
  client_first_name: 'Alex',
  client_last_name: 'Johnson',
  client_email: 'alex.johnson@example.com',
  client_address: {
    street_address: '1 Fixture Way',
    city: 'Stockholm',
    country: 'Sweden',
    postal_code: '11122',
    coordinates: {
      lat: 59.33258,
      lng: 18.0649,
    },
  },
  costumer_id: 3001,
  costumer: {
    costumer_id: 3001,
    client_id: 'fixture_customer_3001',
  },
  creation_date: '2026-03-26T08:00:00.000Z',
  updated_at: '2026-03-26T08:00:00.000Z',
  items_updated_at: '2026-03-26T08:00:00.000Z',
  order_state_id: 2,
  delivery_plan_id: 7101,
  total_weight: 18.5,
  total_items: 2,
  total_volume: 0.14,
  open_order_cases: 0,
}

export const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  ...DEFAULT_ORDER,
  ...overrides,
  client_address: overrides.client_address
    ? {
      street_address:
          overrides.client_address.street_address ?? DEFAULT_ORDER.client_address!.street_address,
      city: overrides.client_address.city ?? DEFAULT_ORDER.client_address!.city,
      country: overrides.client_address.country ?? DEFAULT_ORDER.client_address!.country,
      postal_code:
          overrides.client_address.postal_code ?? DEFAULT_ORDER.client_address!.postal_code,
      coordinates: {
        ...DEFAULT_ORDER.client_address!.coordinates,
        ...overrides.client_address.coordinates,
      },
    }
    : DEFAULT_ORDER.client_address,
  costumer: {
    ...DEFAULT_ORDER.costumer,
    ...overrides.costumer,
  },
})
