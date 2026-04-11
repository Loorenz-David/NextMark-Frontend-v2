import type { ApiResult } from '@shared-api'
import type { Phone } from '@shared-domain'
import { driverApiClient } from './client'

export type DriverRegisterPayload = {
  username: string
  email: string
  password: string
  phone_number: Phone
  time_zone: string
}

export type DriverRegisterResponse = Record<string, never>

export const authRegisterApi = {
  register: (payload: DriverRegisterPayload): Promise<ApiResult<DriverRegisterResponse>> =>
    driverApiClient.request<DriverRegisterResponse>({
      path: '/user_registration/',
      method: 'POST',
      data: { fields: payload },
      requiresAuth: false,
    }),
}
