import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'
import type { IntegrationKey } from '../types/integration'

export type IntegrationBootstrapEntry = { id: number }
export type IntegrationBootstrapValue = IntegrationBootstrapEntry | number | null

export type IntegrationsBootstrapResponse = Record<IntegrationKey, IntegrationBootstrapValue>

export const integrationsBootstrapApi = {
  getActiveIntegrations: (): Promise<ApiResult<IntegrationsBootstrapResponse>> =>
    apiClient.request<IntegrationsBootstrapResponse>({
      path: '/integrations/',
      method: 'GET',
    }),
}
