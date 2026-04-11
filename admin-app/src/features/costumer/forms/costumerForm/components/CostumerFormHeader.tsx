import { BasicButton } from '@/shared/buttons/BasicButton'

import type { CostumerFormMode } from '../state/CostumerForm.types'

export const CostumerFormHeader = ({
  label,
  mode,
  isMobile,
  onClose,
}: {
  label: string
  mode: CostumerFormMode
  isMobile: boolean
  onClose: () => void
}) => {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)]/70 bg-[var(--color-page)] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text)]">{label}</h2>
          <p className="text-[11px] text-[var(--color-muted)]">
            {mode === 'create' ? 'Add a new costumer profile.' : 'Update costumer details.'}
          </p>
        </div>

        <BasicButton
          params={{
            variant: 'text',
            onClick: onClose,
            ariaLabel: 'Close costumer form',
            className: isMobile ? 'px-2 py-1' : 'px-1 py-1',
          }}
        >
          Close
        </BasicButton>
      </div>
    </header>
  )
}
