import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { ClientFormSettings, ClientFormSettingsFields } from '../types/clientFormSettings'

const BASE_PATH = '/client_form_config/settings'

export type ClientFormSettingsResponse = {
  client_form_settings: ClientFormSettings
}

export const clientFormSettingsApi = {
  get: (): Promise<ApiResult<ClientFormSettingsResponse>> =>
    apiClient.request<ClientFormSettingsResponse>({
      path: BASE_PATH,
      method: 'GET',
    }),

  /** Upsert — creates the singleton row on the first call, patches it afterwards. */
  update: (fields: ClientFormSettingsFields): Promise<ApiResult<{ id: number }>> =>
    apiClient.request<{ id: number }>({
      path: BASE_PATH,
      method: 'PATCH',
      data: { fields },
    }),
}

export const useGetClientFormSettings = () => useCallback(() => clientFormSettingsApi.get(), [])

export const useUpdateClientFormSettings = () =>
  useCallback((fields: ClientFormSettingsFields) => clientFormSettingsApi.update(fields), [])
