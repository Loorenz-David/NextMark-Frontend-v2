import { AnimatePresence } from 'framer-motion'

import { useMobile } from '@/app/viewport'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { PageBackButton } from '@/shared/buttons/PageBackButton'
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
  const { isMobile } = useMobile()

  return (
    <div
      className={`relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[var(--color-ligth-bg)] ${
        isMobile ? '' : 'rounded-xl border border-[var(--color-border)]/60'
      }`}
    >
      <header
        className={`sticky top-0 z-10 border-b border-[var(--color-border)]/70 bg-[var(--color-page)] ${
          isMobile ? 'py-2 pl-3 pr-3' : 'px-4 py-3'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {isMobile ? (
            <PageBackButton
              onClick={model.closeController.requestClose}
              ariaLabel="Close costumer form"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">{headerTitle}</h2>
              <InfoHover content={COSTUMER_FORM_EMBEDDED_INFO} />
            </div>
            {headerSubtitle ? (
              <p className="text-[11px] text-[var(--color-muted)]">{headerSubtitle}</p>
            ) : null}
          </div>

          {!isMobile ? (
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
          ) : null}
        </div>
      </header>

      <CostumerFormFields model={model} compact={isMobile} />
      <CostumerFormFooter onSave={model.handleSave} isMobile={isMobile} />

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
