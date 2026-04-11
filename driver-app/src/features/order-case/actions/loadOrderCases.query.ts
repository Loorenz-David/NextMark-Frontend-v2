import {
  extractCaseChatsFromOrderCasesDto,
  mapOrderCasesDtoToOrderCases,
  type CaseChatMap,
  type OrderCaseMap,
  type OrderCasePagination,
  type OrderCaseQueryFilters,
  type OrderCaseStats,
} from '../domain'
import { getOrderCasesApi } from '../api'
import type { OrderCaseDto } from '../api'

export type LoadOrderCasesQueryResult = {
  orderId: number
  cases: OrderCaseMap
  caseChats: CaseChatMap
  stats?: OrderCaseStats
  pagination?: OrderCasePagination
  query: OrderCaseQueryFilters
}

export async function loadOrderCasesQuery(
  orderId: number,
): Promise<LoadOrderCasesQueryResult> {
  const query: OrderCaseQueryFilters = { order_id: orderId }
  const response = await getOrderCasesApi(query)
  const data = response.data
  const orderCasesPayload = data.order_cases as OrderCaseDto | Record<string, OrderCaseDto> | OrderCaseDto[] | null | undefined

  return {
    orderId,
    query,
    cases: mapOrderCasesDtoToOrderCases(orderCasesPayload),
    caseChats: extractCaseChatsFromOrderCasesDto(orderCasesPayload),
    stats: data.order_cases_stats,
    pagination: data.order_cases_pagination,
  }
}
