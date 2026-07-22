import { useSyncExternalStore } from 'react'

import {
  deviceCredentialStorage,
  type DeviceCredential,
} from '../store/deviceCredentialStorage'

/** Reactively reads this browser's stored trusted-device credential. */
export const useDeviceCredential = (): DeviceCredential | null =>
  useSyncExternalStore(
    (onChange) => deviceCredentialStorage.subscribe(onChange),
    () => deviceCredentialStorage.getCredential(),
    () => null,
  )
