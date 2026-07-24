import { MessageIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'

import type { OrderCaseState } from '../../types'
import { OrderCaseStateSelector } from '../OrderCaseStateSelector'

type OrderCaseDetailsHeaderProps = {
  title: string
  state: OrderCaseState
  onChangeState: (nextState: OrderCaseState) => void
  onClose: () => void
}

export const OrderCaseDetailsHeader = ({
  title,
  state,
  onChangeState,
  onClose,
}: OrderCaseDetailsHeaderProps) => {
  return (
    <div className="px-5 pt-4">
      <div className="admin-glass-panel-strong relative overflow-hidden rounded-3xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-primary)_18%,transparent),transparent_70%)]" />

        <div className="relative flex items-start justify-between gap-4 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] shadow-[var(--shadow-button-accent-subtle)]">
              <MessageIcon className="h-[22px] w-[22px] text-[var(--color-primary)]" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-[0.98rem] font-semibold tracking-tight text-[var(--color-text)]">
                {title}
              </span>
              <span className="mt-0.5 text-[0.72rem] text-[var(--color-muted)]">
                Current state: {state}
              </span>
            </div>
          </div>

          <BasicButton
            params={{
              variant: 'toolbarSecondary',
              onClick: onClose,
              ariaLabel: 'Close case details',
              className: 'min-w-[116px] justify-center px-4 uppercase tracking-[0.24em] text-[0.66rem]',
            }}
          >
            Close
          </BasicButton>
        </div>

        <div className="admin-glass-divider border-t px-5 py-3">
          <OrderCaseStateSelector value={state} onSelect={onChangeState} />
        </div>
      </div>
    </div>
  )
}
