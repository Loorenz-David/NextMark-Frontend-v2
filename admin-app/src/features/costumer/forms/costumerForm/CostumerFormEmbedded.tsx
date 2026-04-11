import { AnimatePresence } from 'framer-motion'

import { BasicButton } from '@/shared/buttons/BasicButton'
import { InfoHover } from '@/shared/layout/InfoHover'
import { ConfirmActionPopup } from '@/shared/popups/ConfirmActionPopup'

import type { Costumer } from '../../dto/costumer.dto'
import { CostumerFormFeature } from './CostumerForm'
import { useCostumerFormLayoutModel } from './CostumerForm.layout.model'
import { CostumerFormFields } from './components/CostumerFormFields'
import { CostumerFormFooter } from './components/CostumerFormFooter'
import { COSTUMER_FORM_EMBEDDED_INFO } from './info/embeddedCostumer.info'
import type { CostumerFormPayload } from './state/CostumerForm.types'

type CostumerFormEmbeddedProps = {
  payload?: CostumerFormPayload
  headerTitle: string
  headerSubtitle?: string
  closeLabel?: string
  onRequestClose: () => void
  onSavedCostumer?: (costumer: Costumer) => void
}

const CostumerFormEmbeddedBody = ({
  headerTitle,
  headerSubtitle,
  closeLabel = 'Back',
}: {
  headerTitle: string
  headerSubtitle?: string
  closeLabel?: string
}) => {
  const model = useCostumerFormLayoutModel()

  return (
    <div className="relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--color-border)]/60 bg-[var(--color-ligth-bg)]">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)]/70 bg-[var(--color-page)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">{headerTitle}</h2>
              <InfoHover content={COSTUMER_FORM_EMBEDDED_INFO} />
            </div>
            {headerSubtitle ? (
              <p className="text-[11px] text-[var(--color-muted)]">{headerSubtitle}</p>
            ) : null}
          </div>

          <BasicButton
            params={{
              variant: 'text',
              onClick: model.closeController.requestClose,
              ariaLabel: 'Close costumer form',
              className: 'px-1 py-1',
            }}
          >
            {closeLabel}
          </BasicButton>
        </div>
      </header>

      <CostumerFormFields model={model} />
      <CostumerFormFooter onSave={model.handleSave} />

      <AnimatePresence>
        {model.closeController.closeState === 'confirming' ? (
          <ConfirmActionPopup
            onConfirm={model.closeController.confirmClose}
            onCancel={model.closeController.cancelClose}
            message="You have unsaved changes. Close without saving?"
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export const CostumerFormEmbedded = ({
  payload,
  headerTitle,
  headerSubtitle,
  closeLabel,
  onRequestClose,
  onSavedCostumer,
}: CostumerFormEmbeddedProps) => (
  <CostumerFormFeature
    payload={payload}
    onClose={onRequestClose}
    submitOptions={{
      closeOnSuccess: false,
      onSavedCostumer,
    }}
  >
    <CostumerFormEmbeddedBody
      headerTitle={headerTitle}
      headerSubtitle={headerSubtitle}
      closeLabel={closeLabel}
    />
  </CostumerFormFeature>
)
