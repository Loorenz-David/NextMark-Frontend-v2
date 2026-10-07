import { CloseIcon } from '@/assets/icons'
import { useMobile } from '@/app/viewport'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { PageBackButton } from '@/shared/buttons/PageBackButton'

import type { FeaturePopupHeaderProps } from './types'

/**
 * Popup header. On a phone the popup is a full-screen page, so it closes
 * with the standard back chevron at the start instead of an X at the end.
 */
export const FeaturePopupHeader = ({
  title,
  subtitle,
  onClose,
  actions,
}: FeaturePopupHeaderProps) => {
  const { isMobile } = useMobile()

  return (
    <header
      className={`flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--surface-popup-chrome)] ${
        isMobile ? 'py-2 pl-3 pr-3' : 'items-start px-4 py-3 md:px-5'
      }`}
    >
      {isMobile && onClose ? <PageBackButton onClick={onClose} ariaLabel="Back" /> : null}

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold text-[var(--color-text)]">{title}</h2>
        {subtitle ? (
          <div className={`text-xs text-[var(--color-muted)] ${isMobile ? '' : 'mt-1'}`}>
            {subtitle}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        {!isMobile && onClose ? (
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
}
