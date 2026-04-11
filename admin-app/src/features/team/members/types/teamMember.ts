import type { Phone } from '@/types/phone'

export type TeamMember = {
  id: number
  client_id: string
  username: string
  email: string
  phone_number?: Phone | null
  user_role_id?: number | null
  profile_picture?: string | null
  show_app_tutorial?: boolean
  last_online?: string | null
  last_location?: Record<string, unknown> | null
}

export type TeamMemberMap = {
  byClientId: Record<string, TeamMember>
  allIds: string[]
}

export type TeamMemberRoleChange = {
  user_id: number
  user_role_id: number
}
