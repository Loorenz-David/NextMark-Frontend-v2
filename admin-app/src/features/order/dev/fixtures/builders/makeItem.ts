import type { Item } from '@/features/order/item/types'

const DEFAULT_ITEM: Item = {
  id: 21001,
  client_id: 'fixture_item_21001',
  article_number: 'ART-21001',
  reference_number: 'REF-21001',
  item_type: 'package',
  item_state_id: 1,
  order_id: 11001,
  dimension_depth: 25,
  dimension_height: 18,
  dimension_width: 32,
  weight: 9.2,
  quantity: 1,
}

export const makeItem = (overrides: Partial<Item> = {}): Item => ({
  ...DEFAULT_ITEM,
  ...overrides,
})
