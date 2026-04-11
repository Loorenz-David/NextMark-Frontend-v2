import type { ApiResult } from '@shared-api'
import { driverApiClient } from '@/app/services/client'
import type {
  CaseChatCreateFields,
  OrderCaseCreateFields,
  OrderCaseDeletePayload,
  OrderCaseStateUpdateFields,
} from '../domain'
import type {
  CaseChatDetailResponseDto,
  CaseChatListResponseDto,
  OrderCaseCreateResponseDto,
  OrderCaseDetailResponseDto,
  OrderCaseListQueryDto,
  OrderCaseListResponseDto,
} from './orderCase.dto'

export const getOrderCasesApi = (query?: OrderCaseListQueryDto): Promise<ApiResult<OrderCaseListResponseDto>> =>
  driverApiClient.request<OrderCaseListResponseDto>({
    path: '/order_cases/',
    method: 'GET',
    query,
  })

export const getOrderCaseApi = (id: number): Promise<ApiResult<OrderCaseDetailResponseDto>> =>
  driverApiClient.request<OrderCaseDetailResponseDto>({
    path: `/order_cases/${id}`,
    method: 'GET',
  })

export const createOrderCaseApi = (
  payload: OrderCaseCreateFields,
): Promise<ApiResult<OrderCaseCreateResponseDto>> =>
  driverApiClient.request<OrderCaseCreateResponseDto>({
    path: '/order_cases/',
    method: 'POST',
    data: { fields: payload },
  })

export const updateOrderCaseStateApi = (
  id: number,
  payload: OrderCaseStateUpdateFields,
): Promise<ApiResult<Record<string, never>>> =>
  driverApiClient.request<Record<string, never>>({
    path: `/order_cases/${id}/state`,
    method: 'PATCH',
    data: payload,
  })

export const deleteOrderCaseApi = (
  payload: OrderCaseDeletePayload,
): Promise<ApiResult<Record<string, never>>> =>
  driverApiClient.request<Record<string, never>>({
    path: '/order_cases/',
    method: 'DELETE',
    data: payload,
  })

export const getCaseChatsApi = (
  query?: { order_case_id?: number; order_id?: number },
): Promise<ApiResult<CaseChatListResponseDto>> =>
  driverApiClient.request<CaseChatListResponseDto>({
    path: '/order_cases/case_chats/',
    method: 'GET',
    query,
  })

export const getUnseenCaseChatsApi = (): Promise<ApiResult<CaseChatListResponseDto>> =>
  driverApiClient.request<CaseChatListResponseDto>({
    path: '/order_cases/case_chats/unseen/',
    method: 'GET',
  })

export const getCaseChatApi = (id: number): Promise<ApiResult<CaseChatDetailResponseDto>> =>
  driverApiClient.request<CaseChatDetailResponseDto>({
    path: `/order_cases/case_chats/${id}`,
    method: 'GET',
  })

export const createCaseChatApi = (
  payload: CaseChatCreateFields,
): Promise<ApiResult<CaseChatDetailResponseDto>> =>
  driverApiClient.request<CaseChatDetailResponseDto>({
    path: '/order_cases/case_chats/',
    method: 'POST',
    data: { fields: payload },
  })

export const markCaseChatReadApi = (
  caseChatId: number,
): Promise<ApiResult<Record<string, never>>> =>
  driverApiClient.request<Record<string, never>>({
    path: `/order_cases/case_chats/${caseChatId}/read/`,
    method: 'PUT',
  })

export const markOrderCaseChatsReadApi = (
  orderCaseId: number,
): Promise<ApiResult<Record<string, unknown>>> =>
  driverApiClient.request<Record<string, unknown>>({
    path: `/order_cases/${orderCaseId}/read/`,
    method: 'PUT',
  })
