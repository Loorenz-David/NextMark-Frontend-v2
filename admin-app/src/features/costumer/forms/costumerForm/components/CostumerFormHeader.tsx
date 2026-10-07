import { BasicButton } from '@/shared/buttons/BasicButton'
import { PageBackButton } from '@/shared/buttons/PageBackButton'

import type { CostumerFormMode } from '../state/CostumerForm.types'

const modeSubtitle = (mode: CostumerFormMode) =>
  mode === 'create' ? 'Add a new costumer profile.' : 'Update costumer details.'

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
  if (isMobile) {
    return (
      <header className="flex shrink-0 items-center gap-2 border-b border-[var(--color-border)]/70 bg-[var(--color-page)] py-2 pl-3 pr-3">
        <PageBackButton onClick={onClose} ariaLabel="Close costumer form" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-[var(--color-text)]">{label}</h2>
          <p className="text-xs text-[var(--color-muted)]">{modeSubtitle(mode)}</p>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)]/70 bg-[var(--color-page)] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text)]">{label}</h2>
          <p className="text-[11px] text-[var(--color-muted)]">{modeSubtitle(mode)}</p>
        </div>

        <BasicButton
          params={{
            variant: 'text',
            onClick: onClose,
            ariaLabel: 'Close costumer form',
            className: 'px-1 py-1',
          }}
        >
          Close
        </BasicButton>
      </div>
    </header>
  )
}
