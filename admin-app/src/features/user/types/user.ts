import type { Phone } from '@/types/phone'

export type User = {
  id?: number
  client_id: string
  username: string
  email: string
  phone_number?: Phone | null
  user_role_id?: number | null
  profile_picture?: string | null
  show_app_tutorial?: boolean
}

export type UserMap = {
  byClientId: Record<string, User>
  allIds: string[]
}

export type UserUpdateFields = {
  username?: string
  email?: string
  password?: string
  phone_number?: Phone | null
  profile_picture?: string | null
  show_app_tutorial?: boolean
  last_online?: string | null
  last_location?: Record<string, unknown> | null
}

export type UserResponse = {
  user: User | UserMap
}

export type UserUpdatePayload = {
  target_id: number | string
  fields: UserUpdateFields
}
