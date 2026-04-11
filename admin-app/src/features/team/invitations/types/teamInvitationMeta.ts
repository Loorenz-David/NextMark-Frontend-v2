export type TeamInvitePagination = {
  has_more: boolean
  next_cursor: {
    after_id: number
  } | null
  prev_cursor: {
    before_id: number
  } | null
}

export type TeamInviteSentQueryFilters = {
  team_id?: number | string
  client_id?: string
  user_id?: number
  target_user_id?: number
  username?: string
  target_username?: string
  email?: string
  target_email?: string
  role_id?: number
  user_role_id?: number
  sort?: 'id_asc' | 'id_desc'
  after_id?: number
  before_id?: number
  limit?: number
}

export type TeamInviteReceivedQueryFilters = {
  client_id?: string
  user_id?: number
  target_user_id?: number
  from_team_name?: string
  role_id?: number
  user_role_id?: number
  user_role_name?: string
  sort?: 'id_asc' | 'id_desc'
  after_id?: number
  before_id?: number
  limit?: number
}
