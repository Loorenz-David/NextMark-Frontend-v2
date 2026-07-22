import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { usePopupManager } from '@/shared/resource-manager/useResourceManager'
import { useMessageHandler } from '@shared-message-handler'

import { trustedDeviceApi } from '../api/trustedDeviceApi'
import { mapTrustedDevice } from '../domain/trustedDeviceMappers'
import { deviceCredentialStorage } from '../store/deviceCredentialStorage'
import {
  removeTrustedDevice,
  upsertTrustedDevice,
} from '../store/trustedDeviceStore'

const resolveError = (error: unknown, fallback: string) => ({
  status: error instanceof ApiError ? error.status : 500,
  message: error instanceof ApiError ? error.message : fallback,
})

const isThisBrowserDevice = (clientId: string): boolean =>
  deviceCredentialStorage.getCredential()?.client_id === clientId

export const useTrustedDeviceActions = () => {
  const popupManager = usePopupManager()
  const { showMessage } = useMessageHandler()

  const openEnroll = useCallback(() => {
    popupManager.open({ key: 'trustedDevice.enroll' })
  }, [popupManager])

  const openReprovision = useCallback(() => {
    popupManager.open({ key: 'trustedDevice.reprovision' })
  }, [popupManager])

  /**
   * Delete/revoke a device. When it is THIS browser's device, the local
   * credential is forgotten regardless of the server result (best-effort revoke).
   */
  const deleteDevice = useCallback(
    async (clientId: string) => {
      const isThisBrowser = isThisBrowserDevice(clientId)
      try {
        await trustedDeviceApi.remove(clientId)
        removeTrustedDevice(clientId)
        if (isThisBrowser) {
          deviceCredentialStorage.clearCredential()
        }
        showMessage({
          status: 200,
          message: isThisBrowser
            ? 'This browser is no longer a trusted device.'
            : 'Trusted device removed.',
        })
      } catch (error) {
        if (isThisBrowser) {
          deviceCredentialStorage.clearCredential()
        }
        const resolved = resolveError(error, 'Unable to remove the trusted device.')
        showMessage(resolved)
      }
    },
    [showMessage],
  )

  /**
   * Rotate a device secret. The new secret is returned once — reveal it, and if
   * it belongs to this browser, update the stored credential so logins keep working.
   */
  const rotateSecret = useCallback(
    async (clientId: string) => {
      try {
        const response = await trustedDeviceApi.rotateSecret(clientId)
        const { trusted_device, device_secret } = response.data
        upsertTrustedDevice(mapTrustedDevice(trusted_device))
        if (isThisBrowserDevice(clientId)) {
          deviceCredentialStorage.saveCredential({
            client_id: clientId,
            device_secret,
          })
        }
        popupManager.open({
          key: 'trustedDevice.secretReveal',
          payload: { deviceName: trusted_device.name, secret: device_secret },
        })
      } catch (error) {
        const resolved = resolveError(error, 'Unable to rotate the device secret.')
        showMessage(resolved)
      }
    },
    [popupManager, showMessage],
  )

  return { openEnroll, openReprovision, deleteDevice, rotateSecret }
}
