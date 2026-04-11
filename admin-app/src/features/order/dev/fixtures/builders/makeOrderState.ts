import type { OrderState } from '@/features/order/types/orderState'

const DEFAULT_ORDER_STATE: OrderState = {
  id: 1,
  client_id: 'fixture_order_state_1',
  name: 'Confirmed',
  color: '#4F46E5',
  index: 1,
  is_system: true,
}

export const makeOrderState = (overrides: Partial<OrderState> = {}): OrderState => ({
  ...DEFAULT_ORDER_STATE,
  ...overrides,
})
