
export type OrderDtoCollection<T> = {
  byClientId: Record<string, T>
  allIds: string[]
}

export type OrderItemDto = {
  id: number
  client_id: string
  article_number: string
  reference_number: string | null
  item_type: string | null
  item_state_id: number | null
  item_position_id: number | null
  order_id: number | null
  properties: unknown
  page_link: string | null
  dimension_depth: number | null
  dimension_height: number | null
  dimension_width: number | null
  weight: number | null
  quantity: number | null
}

export type OrderDto = {
  id: number
  client_id: string
  order_plan_objective: string | null
  operation_type: string | null
  order_scalar_id: number | null
  reference_number: string | null
  external_order_id: string | null
  external_source: string | null
  tracking_number: string | null
  client_first_name: string | null
  client_last_name: string | null
  client_email: string | null
  client_primary_phone: unknown
  client_secondary_phone: unknown
  client_address: Record<string, unknown> | null
  marketing_messages: boolean | null
  creation_date: string | null
  updated_at: string | null
  items_updated_at: string | null
  order_state_id: number | null
  delivery_plan_id: number | null
  costumer_id: number | null
  delivery_windows: Array<{
    id: number
    client_id: string
    start_at: string | null
    end_at: string | null
    window_type: string | null
  }>
  open_order_cases: number
  order_notes: string[] | null
  items: OrderDtoCollection<OrderItemDto>
}

export type RouteOrdersDto = {
  orders: OrderDtoCollection<OrderDto>
}
