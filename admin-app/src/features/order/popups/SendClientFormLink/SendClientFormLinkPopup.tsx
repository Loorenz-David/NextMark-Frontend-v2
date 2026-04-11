import type { StackComponentProps } from '@/shared/stack-manager/types'
import {
  FeaturePopupBody,
  FeaturePopupClosePrompt,
  FeaturePopupHeader,
  FeaturePopupShell,
  useFeaturePopupCloseController,
} from '@/shared/popups/featurePopup'

import { SendClientFormLinkForm } from '@/features/order/forms/sendClientFormLink/SendClientFormLinkForm'
import type { SendClientFormLinkPopupPayload } from '@/features/order/forms/sendClientFormLink/state/sendClientFormLink.types'

export const SendClientFormLinkPopup = ({
  payload,
  onClose,
}: StackComponentProps<SendClientFormLinkPopupPayload>) => {
  const closeController = useFeaturePopupCloseController({
    hasUnsavedChanges: false,
    onClose,
  })

  if (!payload) {
    throw new Error('SendClientFormLinkPopup payload is missing.')
  }

  return (
    <>
      <FeaturePopupShell onRequestClose={closeController.requestClose} size="sm" variant="center">
        <FeaturePopupHeader
          title="Send Client Form Link"
          onClose={closeController.requestClose}
        />
        <FeaturePopupBody className="px-0 py-0">
          <SendClientFormLinkForm
            payload={payload}
            onSuccessClose={closeController.confirmClose}
          />
        </FeaturePopupBody>
      </FeaturePopupShell>
      <FeaturePopupClosePrompt controller={closeController} />
    </>
  )
}
