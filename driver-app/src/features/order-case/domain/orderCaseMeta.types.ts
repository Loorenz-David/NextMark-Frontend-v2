import type { OrderCaseState } from './orderCase.types'

export type OrderCaseQueryStringQueries =
  | 'created_by_user'
  | 'user_in_conversation'
  | 'order_reference'
  | 'chat'

export type OrderCaseQueryFilters = {
  q?: string
  s?: OrderCaseQueryStringQueries[]
  order_id?: number | number[] | null
  state?: OrderCaseState | OrderCaseState[] | null
  creation_date_from?: string
  creation_date_to?: string
  limit?: number
  sort?: 'date_asc' | 'date_desc'
}

export type OrderCaseStats = {
  order_cases: {
    total: number
    by_state: Record<number, number>
  }
  open_cases: {
    total: number
  }
  resolving_cases: {
    total: number
  }
}

export type OrderCasePagination = {
  has_more: boolean
  next_cursor: {
    after_date: string
    after_id: number
  } | null
  prev_cursor: {
    before_date: string
    before_id: number
  } | null
}
