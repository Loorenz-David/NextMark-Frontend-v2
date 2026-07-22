import type { TrustedDeviceEnvelope } from '../../types/trustedDevice'
import {
  mapTrustedDevice,
  mapTrustedDeviceList,
  toTrustedDeviceMap,
} from '../trustedDeviceMappers'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const envelope = (clientId: string): TrustedDeviceEnvelope => ({
  client_id: clientId,
  name: `Device ${clientId}`,
  is_active: true,
  last_used_at: null,
  created_at: '2026-01-01T00:00:00Z',
  revoked_at: null,
})

export const runTrustedDeviceMappersTests = () => {
  // single mapping carries the active user count
  {
    const device = mapTrustedDevice(envelope('tdv_1'), 3)
    assert(device.client_id === 'tdv_1', 'client_id mapped')
    assert(device.name === 'Device tdv_1', 'name mapped')
    assert(device.is_active, 'is_active mapped')
    assert(device.active_user_count === 3, 'active_user_count carried through')
  }

  // list mapping uses each row's active_user_count
  {
    const devices = mapTrustedDeviceList([
      { ...envelope('tdv_1'), active_user_count: 2 },
      { ...envelope('tdv_2'), active_user_count: 0 },
    ])
    assert(devices.length === 2, 'both rows mapped')
    assert(devices[0].active_user_count === 2, 'first row count mapped')
    assert(devices[1].active_user_count === 0, 'second row count mapped')
  }

  // entity-map shape keyed by client_id
  {
    const map = toTrustedDeviceMap([
      mapTrustedDevice(envelope('tdv_1')),
      mapTrustedDevice(envelope('tdv_2')),
    ])
    assert(map.allIds.length === 2, 'allIds has both')
    assert(map.byClientId.tdv_1?.client_id === 'tdv_1', 'keyed by client_id')
    assert(map.allIds[0] === 'tdv_1' && map.allIds[1] === 'tdv_2', 'order preserved')
  }
}
