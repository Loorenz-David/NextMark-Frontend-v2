import type { address } from '@/types/address'
import type { Phone } from '@/types/phone'

export type CostumerAddress = {
  id?: number
  client_id?: string
  label?: string | null
  address?: address | null
  is_default?: boolean
}

export type CostumerPhone = {
  id?: number
  client_id?: string
  label?: string | null
  phone?: Phone | null
  phone_type?: string | null
  is_default_primary?: boolean
  is_default_secondary?: boolean
}

export type CostumerOperatingHours = {
  id?: number
  client_id?: string
  weekday: number
  open_time?: string | null
  close_time?: string | null
  is_closed?: boolean
}

export type Costumer = {
  id?: number
  client_id: string
  first_name: string
  last_name: string
  email?: string | null
  external_source?: string | null
  external_costumer_id?: string | null

  default_address?: CostumerAddress | null
  default_primary_phone?: CostumerPhone | null
  default_secondary_phone?: CostumerPhone | null

  addresses?: CostumerAddress[]
  phones?: CostumerPhone[]
  operating_hours?: CostumerOperatingHours[]

  order_count?: number
  active_order_count?: number
  __optimistic?: boolean
}

export type CostumerMap = {
  byClientId: Record<string, Costumer>
  allIds: string[]
}

export type CostumerStats = {
  total_costumers: number
  total_with_orders: number
  total_without_orders: number
}

export type CostumerPagination = {
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

export type CostumerQueryFilters = {
  q?: string
  email?:string
  sort?: 'created_at_desc' | 'created_at_asc' | 'last_name_asc'
  after_date?: string
  after_id?: number
  before_date?: string
  before_id?: number
  limit?: number
}

export type CostumerCreateFields = {
  client_id?: string
  first_name: string
  last_name: string
  email?: string | null
  external_source?: string | null
  external_costumer_id?: string | null

  default_address_id?: number | null
  default_primary_phone_id?: number | null
  default_secondary_phone_id?: number | null

  addresses?: CostumerAddress[]
  phones?: CostumerPhone[]
  operating_hours?: CostumerOperatingHours[]
}

export type CostumerCreatePayload = CostumerCreateFields | CostumerCreateFields[]

export type CostumerUpdateFields = Partial<
  Pick<
    CostumerCreateFields,
    | 'first_name'
    | 'last_name'
    | 'email'
    | 'external_source'
    | 'external_costumer_id'
    | 'default_address_id'
    | 'default_primary_phone_id'
    | 'default_secondary_phone_id'
    | 'addresses'
    | 'phones'
    | 'operating_hours'
  >
> & {
  delete_address_ids?: number[]
  delete_phone_ids?: number[]
  replace_operating_hours?: boolean
}

export type CostumerUpdateTargetPayload = {
  target_id: number
  fields: CostumerUpdateFields
}

export type CostumerDeletePayload = {
  target_id?: number
  target_ids?: number[]
}

export type CostumerListResponse = {
  costumer: CostumerMap | Costumer[]
  costumer_stats: CostumerStats
  costumer_pagination: CostumerPagination
}

export type CostumerDetailResponse = {
  costumer: CostumerMap | Costumer
}

export type CostumerCreateResponse = {
  created: Array<{
    costumer: Costumer
  }>
}

export type CostumerUpdateResponse = {
  updated: Array<{
    costumer: Costumer
  }>
}

export type CostumerDeleteResponse = {
  deleted: {
    costumer_ids: number[]
  }
}
