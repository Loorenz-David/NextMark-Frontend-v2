import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type {
  CaseChat,
  CaseChatCreateFields,
  OrderCase,
  OrderCaseCreateFields,
  OrderCaseDeletePayload,
  OrderCaseMap,
  OrderCaseQueryFilters,
  OrderCaseStateUpdateFields,
} from '../types'
import type { OrderCasePagination, OrderCaseStats } from '../types/orderCaseMeta'

export type OrderCaseListResponse = {
  order_cases: OrderCaseMap | OrderCase[] | Record<string, OrderCase>
  order_cases_stats: OrderCaseStats
  order_cases_pagination: OrderCasePagination
}

export type OrderCaseDetailResponse = {
  order_case: OrderCaseMap | OrderCase
}

export type CaseChatListResponse = {
  case_chats: CaseChat[] | Record<string, CaseChat>
}

export type CaseChatDetailResponse = {
  case_chat: CaseChat[] | CaseChat | Record<string, CaseChat>
}

export type OrderCaseCreateResponse = {
  order_case?: Record<string, unknown>
}

export const getOrderCases = (query?: Partial<OrderCaseQueryFilters>):
Promise<ApiResult<OrderCaseListResponse>> =>
  apiClient.request<OrderCaseListResponse>({
    path: '/order_cases/',
    method: 'GET',
    query,
  })

export const getOrderCase = (id: number): Promise<ApiResult<OrderCaseDetailResponse>> =>
  apiClient.request<OrderCaseDetailResponse>({
    path: `/order_cases/${id}`,
    method: 'GET',
  })

export const createOrderCase = (
  payload: OrderCaseCreateFields,
): Promise<ApiResult<OrderCaseCreateResponse>> =>
  apiClient.request<OrderCaseCreateResponse>({
    path: '/order_cases/',
    method: 'POST',
    data: { fields: payload },
  })

export const updateOrderCaseState = (
  id: number,
  payload: OrderCaseStateUpdateFields,
): Promise<ApiResult<Record<string, never>>> =>
  apiClient.request<Record<string, never>>({
    path: `/order_cases/${id}/state`,
    method: 'PATCH',
    data: payload,
  })

export const deleteOrderCase = (
  payload: OrderCaseDeletePayload,
): Promise<ApiResult<Record<string, never>>> =>
  apiClient.request<Record<string, never>>({
    path: '/order_cases/',
    method: 'DELETE',
    data: payload,
  })

export const getCaseChats = (
  query?: { order_case_id?: number; order_id?: number },
): Promise<ApiResult<CaseChatListResponse>> =>
  apiClient.request<CaseChatListResponse>({
    path: '/order_cases/case_chats/',
    method: 'GET',
    query,
  })

export const getUnseenCaseChats = (): Promise<ApiResult<CaseChatListResponse>> =>
  apiClient.request<CaseChatListResponse>({
    path: '/order_cases/case_chats/unseen/',
    method: 'GET',
  })

export const getCaseChat = (id: number): Promise<ApiResult<CaseChatDetailResponse>> =>
  apiClient.request<CaseChatDetailResponse>({
    path: `/order_cases/case_chats/${id}`,
    method: 'GET',
  })

export const createCaseChat = (
  payload: CaseChatCreateFields,
): Promise<ApiResult<CaseChatDetailResponse>> =>
  apiClient.request<CaseChatDetailResponse>({
    path: '/order_cases/case_chats/',
    method: 'POST',
    data: { fields: payload },
  })

export const markCaseChatRead = (
  caseChatId: number,
): Promise<ApiResult<Record<string, never>>> =>
  apiClient.request<Record<string, never>>({
    path: `/order_cases/case_chats/${caseChatId}/read/`,
    method: 'PUT',
  })

export const markOrderCaseChatsRead = (
  orderCaseId: number,
): Promise<ApiResult<Record<string, unknown>>> =>
  apiClient.request<Record<string, unknown>>({
    path: `/order_cases/${orderCaseId}/read/`,
    method: 'PUT',
  })

export const useGetOrderCases = () => getOrderCases
export const useGetOrderCase = () => getOrderCase
export const useCreateOrderCase = () => createOrderCase
export const useUpdateOrderCaseState = () => updateOrderCaseState
export const useDeleteOrderCase = () => deleteOrderCase
export const useGetCaseChats = () => getCaseChats
export const useGetUnseenCaseChats = () => getUnseenCaseChats
export const useGetCaseChat = () => getCaseChat
export const useCreateCaseChat = () => createCaseChat
export const useMarkCaseChatRead = () => markCaseChatRead
export const useMarkOrderCaseChatsRead = () => markOrderCaseChatsRead
