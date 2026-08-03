import {
  ContainerPlanActionsMenu,
  PLAN_TYPE_LABELS,
  planIconTypeMap,
} from '@/features/plan'
import { useRoutePlanStateByServerId } from '@/features/plan/store/useRoutePlanState.selector'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { StateCard } from '@/shared/layout/StateCard'

import type { InternationalShippingPlanSummary } from '../domain/internationalShippingPlanSummary'

type InternationalShippingPlanHeaderProps = {
  summary: InternationalShippingPlanSummary
  planId: number
  planStateId?: number | null
  onRequestClose?: () => void
}

const PlanTypeIcon = planIconTypeMap.international_shipping

export const InternationalShippingPlanHeader = ({
  summary,
  planId,
  planStateId,
  onRequestClose,
}: InternationalShippingPlanHeaderProps) => {
  const planState = useRoutePlanStateByServerId(planStateId ?? 1)

  return (
    <header className="relative isolate flex w-full min-w-0 flex-col overflow-hidden bg-[var(--surface-page-header)] shadow-[var(--shadow-panel-section)]">
      <div className="admin-glass-divider relative z-10 flex min-w-0 items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
          <div className="inline-flex items-center justify-center rounded-xl border border-border-subtle bg-surface-hover px-3 py-3 shadow-[inset_0_1px_0_var(--color-ligth-bg)]">
            <PlanTypeIcon className="h-6 w-6 text-[var(--color-muted)]" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <span className="truncate text-lg font-semibold text-[var(--color-text)]">
              {summary.label}
            </span>
            <p className="truncate text-[11px] font-normal text-[var(--color-muted)]">
              {PLAN_TYPE_LABELS.international_shipping} • {summary.dateLabel}
            </p>
            <p className="truncate text-[11px] font-normal text-[var(--color-muted)]/80">
              {summary.orderCount} orders • {summary.itemCount} items
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {planState ? (
            <StateCard
              label={planState.name}
              color={planState.color ? planState.color : '#2f2f2fff'}
            />
          ) : null}
          {/* Deleting is the only action a container plan offers today; the
              panel closes with the plan it was showing. */}
          <ContainerPlanActionsMenu planId={planId} onDeleted={onRequestClose} />
          {onRequestClose ? (
            <BasicButton
              params={{
                variant: 'text',
                onClick: onRequestClose,
                ariaLabel: 'Close international shipping plan',
                className: 'shrink-0',
              }}
            >
              Close
            </BasicButton>
          ) : null}
        </div>
      </div>
    </header>
  )
}
