import { useEffect, useMemo, useState } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { usePopupContext } from '@/shared/popups/MainPopup/PopupContext'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'
import { usePopupManager } from '@/shared/resource-manager/useResourceManager'
import { useMessageHandler } from '@shared-message-handler'

import { trustedDeviceApi } from '../../api/trustedDeviceApi'
import { mapTrustedDevice } from '../../domain/trustedDeviceMappers'
import { deviceCredentialStorage } from '../../store/deviceCredentialStorage'
import { upsertTrustedDevice } from '../../store/trustedDeviceStore'
import { AssignUsersField } from '../../components/AssignUsersField'
import { SecretRevealPanel } from '../../components/SecretRevealPanel'

const POPUP_KEY = 'trustedDevice.enroll'

type RevealState = { clientId: string; secret: string }

export const TrustedDeviceEnrollPopup = () => {
  const { setPopupHeader } = usePopupContext()
  const popupManager = usePopupManager()
  const { showMessage } = useMessageHandler()

  const [name, setName] = useState('')
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reveal, setReveal] = useState<RevealState | null>(null)

  useEffect(() => {
    setPopupHeader({ label: reveal ? 'Device trusted' : 'Trust this device' })
    return () => setPopupHeader(null)
  }, [reveal, setPopupHeader])

  const toggleUser = (clientId: string) =>
    setSelectedClientIds((current) =>
      current.includes(clientId)
        ? current.filter((id) => id !== clientId)
        : [...current, clientId],
    )

  const close = () => popupManager.closeByKey(POPUP_KEY)

  const handleEnroll = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      showMessage({ status: 400, message: 'Give this device a name.' })
      return
    }
    if (isSubmitting) {
      return
    }
    setIsSubmitting(true)
    try {
      const response = await trustedDeviceApi.register({
        name: trimmedName,
        user_client_ids: selectedClientIds,
      })
      const { trusted_device, device_secret, assigned_user_count } = response.data

      // Persist BEFORE revealing — the reveal is a backup, not the source of truth.
      deviceCredentialStorage.saveCredential({
        client_id: trusted_device.client_id,
        device_secret,
      })
      upsertTrustedDevice(mapTrustedDevice(trusted_device, assigned_user_count))
      setReveal({ clientId: trusted_device.client_id, secret: device_secret })
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 500
      const message =
        error instanceof ApiError ? error.message : 'Unable to trust this device.'
      showMessage({ status, message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const footerConfig = useMemo(
    () =>
      reveal
        ? { saveButton: { label: 'Done', action: close } }
        : {
            saveButton: {
              label: isSubmitting ? 'Trusting…' : 'Trust this device',
              action: () => {
                void handleEnroll()
              },
            },
          },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reveal, isSubmitting, name, selectedClientIds],
  )

  return (
    <>
      <div className="flex h-full flex-col gap-5 overflow-y-auto px-2 pb-[88px] scroll-thin">
        {reveal ? (
          <SecretRevealPanel secret={reveal.secret} clientId={reveal.clientId} />
        ) : (
          <>
            <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-muted)]">
              Device name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Front desk iMac"
                className="rounded-lg border border-white/10 bg-[var(--color-page)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-white/25"
              />
            </label>
            <AssignUsersField
              selectedClientIds={selectedClientIds}
              onToggle={toggleUser}
            />
            <p className="text-xs text-[var(--color-muted)]">
              This browser will store a device secret and act as a trusted device for the
              selected operators. Treat this as a privileged action.
            </p>
          </>
        )}
      </div>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
