import { useEffect, useMemo, useState } from 'react'

import { usePopupContext } from '@/shared/popups/MainPopup/PopupContext'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'
import { usePopupManager } from '@/shared/resource-manager/useResourceManager'
import { useMessageHandler } from '@shared-message-handler'

import { deviceCredentialStorage } from '../../store/deviceCredentialStorage'

const POPUP_KEY = 'trustedDevice.reprovision'

/**
 * Re-provision this browser after a secret was rotated elsewhere: paste the
 * device id + new secret to update the locally-stored credential. No network call —
 * the pasted secret is trusted as-is and validated on the next login.
 */
export const TrustedDeviceReprovisionPopup = () => {
  const { setPopupHeader } = usePopupContext()
  const popupManager = usePopupManager()
  const { showMessage } = useMessageHandler()

  const [clientId, setClientId] = useState('')
  const [secret, setSecret] = useState('')

  useEffect(() => {
    setPopupHeader({ label: 'Re-provision this browser' })
    return () => setPopupHeader(null)
  }, [setPopupHeader])

  const handleSave = () => {
    const trimmedClientId = clientId.trim()
    const trimmedSecret = secret.trim()
    if (!trimmedClientId || !trimmedSecret) {
      showMessage({ status: 400, message: 'Enter both the device id and secret.' })
      return
    }
    deviceCredentialStorage.saveCredential({
      client_id: trimmedClientId,
      device_secret: trimmedSecret,
    })
    showMessage({ status: 200, message: 'This browser is now linked to the device.' })
    popupManager.closeByKey(POPUP_KEY)
  }

  const footerConfig = useMemo(
    () => ({ saveButton: { label: 'Save to this browser', action: handleSave } }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clientId, secret],
  )

  return (
    <>
      <div className="flex h-full flex-col gap-5 overflow-y-auto px-2 pb-[88px] scroll-thin">
        <p className="text-xs text-[var(--color-muted)]">
          Use this if the device secret was rotated on another machine and logins here
          started failing. Paste the current credential to restore this browser.
        </p>
        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-muted)]">
          Device id
          <input
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            placeholder="tdv_…"
            className="rounded-lg border border-white/10 bg-[var(--color-page)] px-3 py-2 font-mono text-sm text-[var(--color-text)] outline-none focus:border-white/25"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-muted)]">
          Device secret
          <input
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            placeholder="paste the rotated secret"
            className="rounded-lg border border-white/10 bg-[var(--color-page)] px-3 py-2 font-mono text-sm text-[var(--color-text)] outline-none focus:border-white/25"
          />
        </label>
      </div>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
