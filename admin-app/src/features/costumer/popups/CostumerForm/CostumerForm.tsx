import { AnimatePresence } from 'framer-motion'

import type { StackComponentProps } from '@/shared/stack-manager/types'
import { ConfirmActionPopup } from '@/shared/popups/ConfirmActionPopup'

import { CostumerFormFeature } from '@/features/costumer/forms/costumerForm/CostumerForm'
import {
  type CostumerFormLayoutModel,
  useCostumerFormLayoutModel,
} from '@/features/costumer/forms/costumerForm/CostumerForm.layout.model'
import { CostumerFormDesktopLayout } from '@/features/costumer/forms/costumerForm/components/CostumerFormDesktop.layout'
import { CostumerFormMobileLayout } from '@/features/costumer/forms/costumerForm/components/CostumerFormMobile.layout'
import type { CostumerFormPayload } from '@/features/costumer/forms/costumerForm/state/CostumerForm.types'

import { CostumerFormShell } from './CostumerFormShell'

type CostumerFormPopupViewProps = {
  model: CostumerFormLayoutModel
}

const CostumerFormPopupBody = () => {
  const model = useCostumerFormLayoutModel()

  return (
    <>
      <CostumerFormShell<CostumerFormPopupViewProps>
        onRequestClose={model.closeController.requestClose}
        desktopView={CostumerFormDesktopLayout}
        mobileView={CostumerFormMobileLayout}
        viewProps={{ model }}
      />

      <AnimatePresence>
        {model.closeController.closeState === 'confirming' ? (
          <div className="fixed inset-0 z-[120]">
            <ConfirmActionPopup
              onConfirm={model.closeController.confirmClose}
              onCancel={model.closeController.cancelClose}
              message="You have unsaved changes. Close without saving?"
            />
          </div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

export const CostumerForm = ({ payload, onClose }: StackComponentProps<CostumerFormPayload>) => (
  <CostumerFormFeature payload={payload} onClose={onClose}>
    <CostumerFormPopupBody />
  </CostumerFormFeature>
)
