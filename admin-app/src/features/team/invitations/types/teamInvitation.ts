export type TeamInviteSent = {
  id?: number
  client_id: string
  target_username: string
  target_email: string
  user_role_name: string
  creation_date?: string | null
}

export type TeamInviteReceived = {
  id?: number
  client_id: string
  from_team_name: string
  user_role_name: string
  creation_date?: string | null
}

export type TeamInviteSentMap = {
  byClientId: Record<string, TeamInviteSent>
  allIds: string[]
}

export type TeamInviteReceivedMap = {
  byClientId: Record<string, TeamInviteReceived>
  allIds: string[]
}

export type TeamInviteTargetUser = {
  email: string
  username: string
}

export type TeamInviteCreatePayload = {
  client_id: string
  user_role_id: number
  user_role_name: string
  target_user: TeamInviteTargetUser
}

export type ClientIdMap = Record<string, number> & {
  ids_without_match?: number[]
}
