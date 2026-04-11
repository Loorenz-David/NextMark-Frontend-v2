import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'
import type { RegisterFields, RegisterResponse } from '@/features/auth/register/types/authRegister'

export const authRegisterApi = {
  register: (payload: RegisterFields): Promise<ApiResult<RegisterResponse>> =>
    apiClient.request<RegisterResponse>({
      path: '/user_registration/',
      method: 'POST',
      data: { fields: payload },
      requiresAuth: false,
    }),
}
