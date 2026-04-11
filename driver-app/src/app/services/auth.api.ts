import type { ApiResult, SessionSnapshot } from '@shared-api'
import { driverApiClient } from './client'

export type LoginPayload = {
  email: string
  password: string
  time_zone: string
  app_scope: 'driver'
}

export type LoginResponse = {
  access_token: string
  refresh_token: string
  socket_token?: string
  user?: SessionSnapshot['user'] | null
}

export const authApi = {
  login: (payload: LoginPayload): Promise<ApiResult<LoginResponse>> =>
    driverApiClient.request<LoginResponse>({
      path: '/auths/login',
      method: 'POST',
      data: payload,
      requiresAuth: false,
    }),
}
