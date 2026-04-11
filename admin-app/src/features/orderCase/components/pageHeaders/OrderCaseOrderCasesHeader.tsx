import { ArchiveIcon, PlusIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'
import type { OrderCaseStats } from '../../types/orderCaseMeta'
import { pluralLabel } from '@shared-utils'

type OrderCaseOrderCasesHeaderProps = {
  onCreateCase: () => void
  onClose: () => void
  orderCaseStats?:OrderCaseStats
}

export const OrderCaseOrderCasesHeader = ({
  orderCaseStats,
  onCreateCase,
  onClose,
}: OrderCaseOrderCasesHeaderProps) => {
  return (
    <div className="px-5 pt-4">
      <div className="admin-glass-panel-strong relative overflow-hidden rounded-[28px]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(131,204,185,0.18),transparent_70%)]" />

        <div className="relative flex items-start justify-between gap-4 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] border border-white/12 bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] shadow-[0_12px_28px_rgba(131,204,185,0.1)]">
              <ArchiveIcon className="h-[22px] w-[22px] text-[var(--color-primary)]" />
            </div>
            <HeaderTitle orderCaseStats={orderCaseStats}/>
          </div>

          <BasicButton
            params={{
              variant: 'toolbarSecondary',
              onClick: onClose,
              ariaLabel: 'Close order cases',
              className: 'min-w-[116px] justify-center px-4 uppercase tracking-[0.24em] text-[0.66rem]',
            }}
          >
            Close
          </BasicButton>
        </div>

        <div className="admin-glass-divider flex justify-end border-t px-5 py-3">
          <BasicButton
            params={{
              variant: 'primary',
              onClick: onCreateCase,
              ariaLabel: 'Create case',
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4 stroke-[var(--color-secondary)]" />
            Case
          </BasicButton>
        </div>
      </div>
    </div>
  )
}


const HeaderTitle = ({orderCaseStats}:{orderCaseStats?:OrderCaseStats})=>{
  const caseCount = orderCaseStats?.order_cases.total ?? 0
  const openCount = orderCaseStats?.open_cases.total ?? 0
  const resolvingCount = orderCaseStats?.resolving_cases.total  ?? 0
  return (
    <div className="flex min-w-0 flex-col">
      <span className="text-[0.98rem] font-semibold tracking-tight text-[var(--color-text)]">
        Order Cases
      </span>
      <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[0.72rem] text-[var(--color-muted)]">
        <span>{caseCount} {pluralLabel('case',caseCount)} •</span>
        <span>{openCount} {pluralLabel('open',openCount)} •</span>
        <span>{resolvingCount} {pluralLabel('resolving',resolvingCount)}</span>
      </div>
    </div>
  )
}
