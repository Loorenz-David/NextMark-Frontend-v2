import { AnimatePresence } from 'framer-motion'

import { ConfirmActionPopup } from '@/shared/popups/ConfirmActionPopup'

import type { PopupCloseController } from './types'

type FeaturePopupClosePromptProps = {
  controller: PopupCloseController
  message?: string
}

export const FeaturePopupClosePrompt = ({
  controller,
  message = 'You have unsaved changes. Close without saving?',
}: FeaturePopupClosePromptProps) => (
  <AnimatePresence>
    {controller.closeState === 'confirming' ? (
      <div className="fixed inset-0 z-[120]">
        <ConfirmActionPopup
          onConfirm={controller.confirmClose}
          onCancel={controller.cancelClose}
          message={message}
        />
      </div>
    ) : null}
  </AnimatePresence>
)
