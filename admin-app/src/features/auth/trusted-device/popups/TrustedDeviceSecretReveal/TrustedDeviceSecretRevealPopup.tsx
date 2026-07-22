import { useEffect, useMemo } from 'react'

import type { StackComponentProps } from '@/shared/stack-manager/types'
import { usePopupContext } from '@/shared/popups/MainPopup/PopupContext'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'
import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

import { SecretRevealPanel } from '../../components/SecretRevealPanel'

const POPUP_KEY = 'trustedDevice.secretReveal'

export type TrustedDeviceSecretRevealPayload = {
  deviceName: string
  secret: string
}

/** Reveals a rotated device secret once (opened after a successful rotate). */
export const TrustedDeviceSecretRevealPopup = ({
  payload,
}: StackComponentProps<TrustedDeviceSecretRevealPayload>) => {
  const { setPopupHeader } = usePopupContext()
  const popupManager = usePopupManager()

  useEffect(() => {
    setPopupHeader({ label: 'New device secret' })
    return () => setPopupHeader(null)
  }, [setPopupHeader])

  const footerConfig = useMemo(
    () => ({
      saveButton: {
        label: 'Done',
        action: () => popupManager.closeByKey(POPUP_KEY),
      },
    }),
    [popupManager],
  )

  if (!payload) {
    return null
  }

  return (
    <>
      <div className="flex h-full flex-col gap-4 overflow-y-auto px-2 pb-[88px] scroll-thin">
        <p className="text-xs text-[var(--color-muted)]">
          New secret for <span className="text-[var(--color-text)]">{payload.deviceName}</span>.
        </p>
        <SecretRevealPanel secret={payload.secret} />
      </div>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
