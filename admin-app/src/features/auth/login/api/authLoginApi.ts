import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'
import type { LoginPayload, LoginResponse } from '@/features/auth/login/types/authLogin'

export const authLoginApi = {
  login: (payload: LoginPayload): Promise<ApiResult<LoginResponse>> =>
    apiClient.request<LoginResponse>({
      path: '/auths/login',
      method: 'POST',
      data: payload,
      requiresAuth: false,
    }),
}
