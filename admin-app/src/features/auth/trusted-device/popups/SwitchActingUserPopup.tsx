import type { StackComponentProps } from '@/shared/stack-manager/types'
import {
  FeaturePopupBody,
  FeaturePopupClosePrompt,
  FeaturePopupHeader,
  FeaturePopupShell,
  useFeaturePopupCloseController,
} from '@/shared/popups/featurePopup'
import {
  useAvailableAuthUsers,
  useTrustedDevice,
} from '@/features/auth/login/hooks/useAuthSelectors'

import { ActingUserCard } from '../components/ActingUserCard'
import { useTrustedDeviceUserSwitch } from '../hooks/useTrustedDeviceUserSwitch'

export const SwitchActingUserPopup = ({ onClose }: StackComponentProps) => {
  const closeController = useFeaturePopupCloseController({
    hasUnsavedChanges: false,
    onClose,
  })
  // Users are derived from the auth store — never trusted from a popup payload.
  const users = useAvailableAuthUsers()
  const trustedDevice = useTrustedDevice()
  const switchUser = useTrustedDeviceUserSwitch()

  const handleSelect = async (userClientId: string, isActive: boolean) => {
    if (isActive) {
      // Selecting the already-active user is a no-op close — no reset.
      await closeController.confirmClose()
      return
    }
    switchUser(userClientId)
  }

  return (
    <>
      <FeaturePopupShell
        onRequestClose={closeController.requestClose}
        size="mdNoHeight"
        variant="center"
      >
        <FeaturePopupHeader
          title="Switch account"
          subtitle={trustedDevice?.name ?? undefined}
          onClose={closeController.requestClose}
        />
        <FeaturePopupBody className="flex h-full flex-col bg-[var(--color-ligth-bg)]">
          <div className="flex flex-col gap-2 px-4 py-4">
            {users.map((entry) => (
              <ActingUserCard
                key={entry.clientId}
                user={entry.user}
                isActive={entry.isActive}
                onSelect={() => {
                  void handleSelect(entry.clientId, entry.isActive)
                }}
              />
            ))}
          </div>
        </FeaturePopupBody>
      </FeaturePopupShell>

      <FeaturePopupClosePrompt controller={closeController} />
    </>
  )
}
