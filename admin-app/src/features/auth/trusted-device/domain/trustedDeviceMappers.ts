import type {
  TrustedDevice,
  TrustedDeviceEnvelope,
  TrustedDeviceMap,
} from '../types/trustedDevice'

export const mapTrustedDevice = (
  device: TrustedDeviceEnvelope,
  activeUserCount?: number,
): TrustedDevice => ({
  client_id: device.client_id,
  name: device.name,
  is_active: device.is_active,
  last_used_at: device.last_used_at ?? null,
  created_at: device.created_at ?? null,
  revoked_at: device.revoked_at ?? null,
  active_user_count: activeUserCount,
})

export const mapTrustedDeviceList = (
  devices: Array<TrustedDeviceEnvelope & { active_user_count: number }>,
): TrustedDevice[] =>
  devices.map((device) => mapTrustedDevice(device, device.active_user_count))

export const toTrustedDeviceMap = (devices: TrustedDevice[]): TrustedDeviceMap => ({
  byClientId: Object.fromEntries(devices.map((device) => [device.client_id, device])),
  allIds: devices.map((device) => device.client_id),
})
