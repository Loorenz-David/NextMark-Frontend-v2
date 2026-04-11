import { CloseIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'

import type { FeaturePopupHeaderProps } from './types'

export const FeaturePopupHeader = ({
  title,
  subtitle,
  onClose,
  actions,
}: FeaturePopupHeaderProps) => (
  <header className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3 md:px-5">
    <div className="min-w-0 flex-1">
      <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
      {subtitle ? (
        <div className="mt-1 text-xs text-[var(--color-muted)]">{subtitle}</div>
      ) : null}
    </div>

    <div className="flex items-center gap-2">
      {actions}
      {onClose ? (
        <BasicButton
          params={{
            variant: 'rounded',
            onClick: onClose,
          }}
        >
          <CloseIcon className="h-4 w-4 app-icon" />
        </BasicButton>
      ) : null}
    </div>
  </header>
)
