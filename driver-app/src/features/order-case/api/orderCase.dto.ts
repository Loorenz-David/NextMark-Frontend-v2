import type { CaseChatMap, OrderCaseMap } from '../domain'
import type { OrderCasePagination, OrderCaseQueryFilters, OrderCaseStats } from '../domain'

export type CaseChatDto = {
  id?: number
  client_id?: string | null
  message?: string | null
  creation_date?: string | null
  user_id?: number | null
  user_name?: string | null
  order_case_id?: number | null
}

export type OrderCaseDto = {
  id?: number
  client_id?: string | null
  order_id?: number | null
  label?: string | null
  state?: string | null
  creation_date?: string | null
  created_by?: number | null
  unseen_chats?: number | null
  order_reference?: string | number | null
  chats?: CaseChatDto[] | Record<string, CaseChatDto> | null
}

export type OrderCaseListResponseDto = {
  order_cases: OrderCaseMap | OrderCaseDto[] | Record<string, OrderCaseDto>
  order_cases_stats: OrderCaseStats
  order_cases_pagination: OrderCasePagination
}

export type OrderCaseDetailResponseDto = {
  order_case: OrderCaseMap | OrderCaseDto
}

export type CaseChatListResponseDto = {
  case_chats: CaseChatMap | CaseChatDto[] | Record<string, CaseChatDto>
}

export type CaseChatDetailResponseDto = {
  case_chat: CaseChatMap | CaseChatDto[] | CaseChatDto | Record<string, CaseChatDto>
}

export type OrderCaseCreateResponseDto = {
  order_case?: OrderCaseDto | Record<string, unknown>
}

export type OrderCaseListQueryDto = Partial<OrderCaseQueryFilters>
