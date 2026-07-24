import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type {
  ClientFormRuleCreateFields,
  ClientFormRuleMap,
  ClientFormRuleUpdateFields,
} from '../types/clientFormRule'
import type { ClientFormCreateResponse } from './clientFormCreateResponse'

const BASE_PATH = '/client_form_config/rules'

export type ClientFormRuleListResponse = {
  client_form_rules: ClientFormRuleMap
}

export const clientFormRulesApi = {
  list: (enabled?: boolean): Promise<ApiResult<ClientFormRuleListResponse>> =>
    apiClient.request<ClientFormRuleListResponse>({
      path: BASE_PATH,
      method: 'GET',
      ...(enabled === undefined ? {} : { query: { enabled } }),
    }),

  create: (
    fields: ClientFormRuleCreateFields | ClientFormRuleCreateFields[],
  ): Promise<ApiResult<ClientFormCreateResponse>> =>
    apiClient.request<ClientFormCreateResponse>({
      path: BASE_PATH,
      method: 'PUT',
      data: { fields },
    }),

  /** `target_id` must be the numeric server id — string ids raise a 510 backend-wide. */
  update: (
    targetId: number,
    fields: ClientFormRuleUpdateFields,
  ): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: BASE_PATH,
      method: 'PATCH',
      data: { target: { target_id: targetId, fields } },
    }),

  remove: (targetIds: number[]): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: BASE_PATH,
      method: 'DELETE',
      data: { target_ids: targetIds },
    }),

  /** `ordered_ids` must list every rule for the team exactly once — partial lists are rejected. */
  reorder: (orderedIds: number[]): Promise<ApiResult<number[]>> =>
    apiClient.request<number[]>({
      path: `${BASE_PATH}/reorder`,
      method: 'POST',
      data: { ordered_ids: orderedIds },
    }),
}

export const useGetClientFormRules = () =>
  useCallback((enabled?: boolean) => clientFormRulesApi.list(enabled), [])

export const useCreateClientFormRule = () =>
  useCallback(
    (fields: ClientFormRuleCreateFields | ClientFormRuleCreateFields[]) =>
      clientFormRulesApi.create(fields),
    [],
  )

export const useUpdateClientFormRule = () =>
  useCallback(
    (targetId: number, fields: ClientFormRuleUpdateFields) =>
      clientFormRulesApi.update(targetId, fields),
    [],
  )

export const useDeleteClientFormRule = () =>
  useCallback((targetId: number) => clientFormRulesApi.remove([targetId]), [])

export const useReorderClientFormRules = () =>
  useCallback((orderedIds: number[]) => clientFormRulesApi.reorder(orderedIds), [])
