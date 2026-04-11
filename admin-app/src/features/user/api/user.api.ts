import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { UserResponse, UserUpdatePayload } from '../types/user'

export const getUser = (): Promise<ApiResult<UserResponse>> =>
  apiClient.request<UserResponse>({
    path: '/users/',
    method: 'GET',
  })

export const updateUser = (
  payload: UserUpdatePayload | UserUpdatePayload[],
): Promise<ApiResult<Record<string, never>>> =>
  apiClient.request<Record<string, never>>({
    path: '/users/',
    method: 'PATCH',
    data: { target: payload },
  })

export const useGetUser = () => getUser

export const useUpdateUser = () => updateUser
