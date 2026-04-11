import type { Phone, address } from '../core'
import type { RouteSolution, RouteSolutionStop } from '../delivery-planning'
import type { Item } from '../items'
import type { ISODateTime } from '../types'

export type OrderDeliveryWindowType =
  | 'EXACT_DATETIME'
  | 'DATE_ONLY'
  | 'TIME_RANGE'
  | 'DATE_RANGE'
  | 'FULL_RANGE'

export type OrderOperationTypes =
  | 'pickup'
  | 'dropoff'
  | 'pickup_dropoff'

export type OrderDeliveryWindow = {
  id?: number
  client_id?: string | null
  start_at: ISODateTime
  end_at: ISODateTime
  window_type: OrderDeliveryWindowType
}

export type Order = {
  id?: number
  client_id: string
  order_plan_objective?: string | null
  operation_type?: OrderOperationTypes | null
  order_scalar_id?: number | null
  reference_number?: string | null
  external_order_id?: string | null
  external_source?: string | null
  external_tracking_number?: string | null
  external_tracking_link?: string | null
  tracking_number?: string | null
  tracking_link?: string | null
  client_first_name?: string | null
  client_last_name?: string | null
  client_email?: string | null
  client_primary_phone?: Phone | null
  client_secondary_phone?: Phone | null
  client_address?: address | null
  costumer_id?: number | null
  costumer?: {
    costumer_id?: number | null
    client_id?: string | null
  } | null
  delivery_windows?: OrderDeliveryWindow[]
  creation_date?: ISODateTime | null
  updated_at?: ISODateTime | null
  items_updated_at?: ISODateTime | null
  order_state_id?: number | null
  delivery_plan_id?: number | null
  route_group_id?: number | null
  total_weight?: number | null
  total_items?: number | null
  item_type_counts?: Record<string, number> | null
  total_volume?: number | null
  open_order_cases?: number | null
  archive_at?: ISODateTime | null
  client_form_token_hash?: string | null
  client_form_submitted_at?: ISODateTime | null
  order_notes?: string[] | null
  __optimistic?: boolean
}

export type OrderMap = {
  byClientId: Record<string, Order>
  allIds: string[]
}

export type OrderUpdateFields = Partial<Order>
export type OrderCreatePayload = Order | Order[]

export type ClientIdMap = Record<string, number> & {
  ids_without_match?: number[]
}

export type OrderStopResponseMap = Record<string, RouteSolutionStop> & {
  ids_without_match?: number[]
}

export type OrderCreateBundle = {
  order: Order
  items?: Item[]
  order_stops?: RouteSolutionStop[]
  route_solution?: RouteSolution[]
}

/** Plan-level totals returned by mutating endpoints (backend Phase A.9). */
export type PlanTotalsEntry = {
  id: number
  total_weight: number | null
  total_volume: number | null
  total_items: number | null
  total_orders: number | null
}

export type OrderCreateResponse = {
  created: OrderCreateBundle[]
  plan_totals?: PlanTotalsEntry[]
}

export type OrderPlanUpdateBundle = {
  order: Order
  order_stops?: RouteSolutionStop[]
  route_solution?: RouteSolution[]
}

export type OrderPlanUpdateResponse = {
  updated: OrderPlanUpdateBundle[]
  plan_totals?: PlanTotalsEntry[]
}

export type OrderUpdateResponse = {
  updated: OrderPlanUpdateBundle[]
}

export type OrderDeleteResponse = {
  deleted: {
    order_ids: number[]
    order_client_ids: string[]
  }
  updated: Array<{
    route_solution?: RouteSolution[]
    order_stops?: RouteSolutionStop[]
  }>
}
