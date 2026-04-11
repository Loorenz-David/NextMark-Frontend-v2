import type { RoutePlanObjective } from '@/features/plan/types/plan'

export type PlanStats = {
  plans: {
    total: number
    by_state: Record<number, number>
  }
  orders: {
    total: number
  }
  items: {
    total: number
  }
}

export type PlanPagination = {
  has_more: boolean
  next_cursor: string | null
  prev_cursor: string | null
}

export type DeliveryPlanStatePagination = {
  has_more: boolean
  next_cursor: {
    after_id: number
  } | null
  prev_cursor: {
    before_id: number
  } | null
}

export type PlanQueryFilters = {
  mode?: 'month' | 'date' | 'range'
  team_id?: number | string
  label?: string
  plan_type?: RoutePlanObjective
  start_date?: string
  end_date?: string
  created_at_from?: string
  created_at_to?: string
  plan_state_id?: number
  sort?: 'date_asc' | 'date_desc'
  after_cursor?: string
  before_cursor?: string
  filters?: Record<string, unknown>
  orders?: Record<string, unknown>
  limit?: number
}

export type DeliveryPlanStateQueryFilters = {
  team_id?: number | string
  client_id?: string
  name?: string
  color?: string
  index?: number
  is_system?: boolean
  sort?: 'id_asc' | 'id_desc'
  after_id?: number
  before_id?: number
  limit?: number
}
