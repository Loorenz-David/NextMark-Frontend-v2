import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type {
  ListTrustedDevicesResponse,
  RegisterTrustedDeviceInput,
  RegisterTrustedDeviceResponse,
  RotateTrustedDeviceSecretResponse,
  TrustedDeviceDetailResponse,
} from '../types/trustedDevice'

const BASE_PATH = '/auths/trusted-devices'

export const trustedDeviceApi = {
  register: (
    payload: RegisterTrustedDeviceInput,
  ): Promise<ApiResult<RegisterTrustedDeviceResponse>> =>
    apiClient.request<RegisterTrustedDeviceResponse>({
      path: BASE_PATH,
      method: 'POST',
      data: payload,
    }),

  list: (signal?: AbortSignal): Promise<ApiResult<ListTrustedDevicesResponse>> =>
    apiClient.request<ListTrustedDevicesResponse>({
      path: BASE_PATH,
      method: 'GET',
      signal,
    }),

  getById: (
    deviceClientId: string,
    signal?: AbortSignal,
  ): Promise<ApiResult<TrustedDeviceDetailResponse>> =>
    apiClient.request<TrustedDeviceDetailResponse>({
      path: `${BASE_PATH}/${deviceClientId}`,
      method: 'GET',
      signal,
    }),

  remove: (deviceClientId: string): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: `${BASE_PATH}/${deviceClientId}`,
      method: 'DELETE',
    }),

  rotateSecret: (
    deviceClientId: string,
  ): Promise<ApiResult<RotateTrustedDeviceSecretResponse>> =>
    apiClient.request<RotateTrustedDeviceSecretResponse>({
      path: `${BASE_PATH}/${deviceClientId}/secret`,
      method: 'POST',
    }),
}
