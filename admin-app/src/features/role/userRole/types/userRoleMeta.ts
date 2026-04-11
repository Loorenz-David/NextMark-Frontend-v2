export type UserRolePagination = {
  has_more: boolean
  next_cursor: {
    after_id: number
  } | null
  prev_cursor: {
    before_id: number
  } | null
}

export type UserRoleQueryFilters = {
  team_id?: number | string
  client_id?: string
  role_name?: string
  base_role_id?: number | string
  is_system?: boolean
  sort?: 'id_asc' | 'id_desc'
  after_id?: number
  before_id?: number
  limit?: number
}
