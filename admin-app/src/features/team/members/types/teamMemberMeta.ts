export type TeamMemberPagination = {
  has_more: boolean
  next_cursor: {
    after_id: number
  } | null
  prev_cursor: {
    before_id: number
  } | null
}

export type TeamMemberQueryFilters = {
  team_id?: number | string
  client_id?: string
  username?: string
  email?: string
  role_id?: number
  sort?: 'id_asc' | 'id_desc'
  after_id?: number
  before_id?: number
  limit?: number
}
