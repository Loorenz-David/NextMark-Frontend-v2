import type { SessionUser } from '@/features/auth/login/store/sessionStorage'

export type AuthenticationMode = 'single_user' | 'trusted_device'

export type LoginPayload = {
  email: string
  password: string
  time_zone: string
  app_scope: 'admin'
}

/** Location fields the backend may still return outside the nested user object. */
type LoginLocationFields = {
  country_code?: string | null
  city?: string | null
  default_country_code?: string | null
  default_city_key?: string | null
}

export type SingleUserLoginResponse = LoginLocationFields & {
  authentication_mode: 'single_user'
  access_token: string
  refresh_token: string
  socket_token?: string
  user?: SessionUser | null
}

export type TrustedDeviceSessionResponse = LoginLocationFields & {
  user_client_id: string
  access_token: string
  refresh_token: string
  socket_token?: string
  user: SessionUser
}

export type TrustedDeviceLoginResponse = {
  authentication_mode: 'trusted_device'
  trusted_device: {
    client_id: string
    name: string
  }
  active_user_client_id: string
  sessions: TrustedDeviceSessionResponse[]
}

export type LoginResponse = SingleUserLoginResponse | TrustedDeviceLoginResponse
