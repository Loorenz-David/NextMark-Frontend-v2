export type OrderStats = {
  orders: {
    total: number
    by_state: Record<number, number>
  }
  items: {
    total: number
  }
}

export type OrderPagination = {
  has_more: boolean
  next_cursor: string | null
  prev_cursor: string | null
}

export type OrderQueryStringQueries =
  | 'order_scalar_id'
  | 'reference_number'
  | 'external_source'
  | 'tracking_number'
  | 'client_name'
  | 'client_first_name/client_last_name'
  | 'client_email'
  | 'client_address'
  | 'client_phone'
  | 'plan_label'
  | 'plan_type'
  | 'article_number'
  | 'item_type'

export type OrderQueryFilters = {
  q?: string
  s?: OrderQueryStringQueries[]
  order_state_id?: number | number[] | null
  order_state?: string[] | null
  plan_type?: string | string[] | null
  plan_id?: number | number[] | null
  order_schedule_from?: string | null
  order_schedule_to?: string | null
  schedule_order?: boolean
  unschedule_order?: boolean
  after_cursor?: string
  before_cursor?: string
  limit?: number
  sort?: 'date_asc' | 'date_desc'
  show_archived?: boolean
}

export type OrderQueryStoreFilters = {
  q: string
  filters: Omit<OrderQueryFilters, 'q'>
}
