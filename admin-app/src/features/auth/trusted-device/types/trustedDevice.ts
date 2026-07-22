/** The device shape returned by `serialize_device` on the backend. */
export type TrustedDeviceEnvelope = {
  client_id: string
  name: string
  is_active: boolean
  last_used_at?: string | null
  created_at?: string | null
  revoked_at?: string | null
}

/** Normalized frontend entity (keyed by `client_id`). */
export type TrustedDevice = {
  client_id: string
  name: string
  is_active: boolean
  last_used_at?: string | null
  created_at?: string | null
  revoked_at?: string | null
  active_user_count?: number
}

export type TrustedDeviceMap = {
  byClientId: Record<string, TrustedDevice>
  allIds: string[]
}

export type AssignedUser = {
  id: number
  client_id: string
  username: string
  profile_picture?: string | null
}

export type RegisterTrustedDeviceInput = {
  name: string
  user_client_ids: string[]
}

export type RegisterTrustedDeviceResponse = {
  trusted_device: TrustedDeviceEnvelope
  device_secret: string
  assigned_user_count: number
}

export type ListTrustedDevicesResponse = {
  trusted_devices: Array<TrustedDeviceEnvelope & { active_user_count: number }>
}

export type TrustedDeviceDetailResponse = {
  trusted_device: TrustedDeviceEnvelope
  users: AssignedUser[]
}

export type RotateTrustedDeviceSecretResponse = {
  trusted_device: TrustedDeviceEnvelope
  device_secret: string
}
