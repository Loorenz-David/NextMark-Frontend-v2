import type { SessionUser } from '@/features/auth/login/store/sessionStorage'

export type LoginPayload = {
  email: string
  password: string
  time_zone: string
  app_scope: 'admin'
}

export type LoginResponse = {
  access_token: string
  refresh_token: string
  socket_token?: string
  country_code?: string | null
  city?: string | null
  default_country_code?: string | null
  default_city_key?: string | null
  user?: SessionUser | null
}
