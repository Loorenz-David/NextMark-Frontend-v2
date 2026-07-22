import type { TrustedDevice } from '../types/trustedDevice'

export const filterTrustedDevices = (
  devices: TrustedDevice[],
  query: string,
): TrustedDevice[] => {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return devices
  }
  return devices.filter(
    (device) =>
      device.name.toLowerCase().includes(normalized) ||
      device.client_id.toLowerCase().includes(normalized),
  )
}
