import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'
import type { ClientIdMap, UserRole, UserRoleFields, UserRoleMap, UserRoleUpdateFields } from '@/features/role/userRole/types/userRole'
import type { UserRolePagination, UserRoleQueryFilters } from '@/features/role/userRole/types/userRoleMeta'

export type UserRoleListResponse = {
  user_roles: UserRoleMap
  user_roles_pagination: UserRolePagination
}

export type UserRoleDetailResponse = {
  user_role: UserRoleMap | UserRole
}

export type UserRoleUpdatePayload = {
  target_id: number | string
  fields: UserRoleUpdateFields
}

export type UserRoleDeletePayload = {
  target_id?: number | string
  target_ids?: Array<number | string>
}

export type UserRoleCreateResponse = {
  user_role: ClientIdMap
  date_range_access_rule?: ClientIdMap
  order_state_transition_rule?: ClientIdMap
}

export const userRoleApi = {
  listUserRoles: (query?: UserRoleQueryFilters): Promise<ApiResult<UserRoleListResponse>> =>
    apiClient.request<UserRoleListResponse>({
      path: '/user_roles/',
      method: 'GET',
      query,
    }),

  getUserRole: (roleId: number | string): Promise<ApiResult<UserRoleDetailResponse>> =>
    apiClient.request<UserRoleDetailResponse>({
      path: `/user_roles/${roleId}`,
      method: 'GET',
    }),

  createUserRole: (payload: UserRoleFields | UserRoleFields[]): Promise<ApiResult<UserRoleCreateResponse>> =>
    apiClient.request<UserRoleCreateResponse>({
      path: '/user_roles/',
      method: 'PUT',
      data: { fields: payload },
    }),

  updateUserRole: (payload: UserRoleUpdatePayload | UserRoleUpdatePayload[]): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/user_roles/',
      method: 'PATCH',
      data: { target: payload },
    }),

  deleteUserRole: (payload: UserRoleDeletePayload): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/user_roles/',
      method: 'DELETE',
      data: payload,
    }),
}
