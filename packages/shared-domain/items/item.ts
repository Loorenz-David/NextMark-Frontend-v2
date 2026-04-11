export type Item = {
  id?: number
  client_id: string
  article_number: string
  reference_number?: string | null
  item_type: string
  item_state_id?: number | null
  item_position_id?: number | null
  order_id: number
  properties?: Record<string, unknown> | null
  page_link?: string | null
  dimension_depth?: number | null
  dimension_height?: number | null
  dimension_width?: number | null
  weight?: number | null
  quantity: number
}

export type ItemMap = {
  byClientId: Record<string, Item>
  allIds: string[]
}

export type ItemUpdateFields = Partial<Item>
