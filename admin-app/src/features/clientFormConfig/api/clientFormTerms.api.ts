import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { TermsDocument } from '../domain/termsDocument'
import type { ClientFormTermsVersionDtoMap } from '../types/clientFormTerms'

const BASE_PATH = '/client_form_config/terms'

export type ClientFormTermsListResponse = {
  client_form_terms_versions: ClientFormTermsVersionDtoMap
}

export type ClientFormTermsPublishResponse = {
  id: number
  version_number: number
}

export const clientFormTermsApi = {
  /** Full history, newest version first. */
  list: (isActive?: boolean): Promise<ApiResult<ClientFormTermsListResponse>> =>
    apiClient.request<ClientFormTermsListResponse>({
      path: BASE_PATH,
      method: 'GET',
      ...(isActive === undefined ? {} : { query: { is_active: isActive } }),
    }),

  /** Versions are append-only — publishing writes a new row and moves the active flag. */
  publish: (content: TermsDocument): Promise<ApiResult<ClientFormTermsPublishResponse>> =>
    apiClient.request<ClientFormTermsPublishResponse>({
      path: BASE_PATH,
      method: 'PUT',
      data: { fields: { content } },
    }),
}

export const useGetClientFormTerms = () =>
  useCallback((isActive?: boolean) => clientFormTermsApi.list(isActive), [])

export const usePublishClientFormTerms = () =>
  useCallback((content: TermsDocument) => clientFormTermsApi.publish(content), [])
