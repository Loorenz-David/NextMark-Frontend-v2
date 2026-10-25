import {
  ContainerPlanActionsMenu,
  PLAN_TYPE_LABELS,
  planIconTypeMap,
} from '@/features/plan'
import { useRoutePlanStateByServerId } from '@/features/plan/store/useRoutePlanState.selector'
import { useMobile } from '@/app/viewport'
import { CloseIcon } from '@/assets/icons'
import { PageBackButton } from '@/shared/buttons/PageBackButton'
import { RoundIconButton } from '@/shared/buttons/RoundIconButton'

import type { StorePickupPlanSummary } from '../domain/storePickupPlanSummary'

type StorePickupPlanHeaderProps = {
  summary: StorePickupPlanSummary
  planId: number
  planStateId?: number | null
  onRequestClose?: () => void
}

const PlanTypeIcon = planIconTypeMap.store_pickup

export const StorePickupPlanHeader = ({
  summary,
  planId,
  planStateId,
  onRequestClose,
}: StorePickupPlanHeaderProps) => {
  const planState = useRoutePlanStateByServerId(planStateId ?? 1)
  const { isMobile } = useMobile()

  return (
    <header className="relative isolate flex w-full min-w-0 flex-col overflow-hidden bg-[var(--surface-page-header)] shadow-[var(--shadow-panel-section)]">
      <div className="admin-glass-divider relative z-10 flex min-w-0 items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
          {isMobile && onRequestClose ? (
            <PageBackButton onClick={onRequestClose} ariaLabel="Close store pickup plan" />
          ) : null}
          <div className="inline-flex items-center justify-center rounded-xl border border-border-subtle bg-surface-hover px-3 py-3 shadow-[inset_0_1px_0_var(--color-ligth-bg)]">
            <PlanTypeIcon className="h-6 w-6 text-[var(--color-muted)]" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <span className="truncate text-lg font-semibold text-[var(--color-text)]">
              {summary.label}
            </span>
            <p className="truncate text-2xs font-normal text-[var(--color-muted)]">
              {PLAN_TYPE_LABELS.store_pickup} • {summary.dateLabel}
            </p>
            <p className="truncate text-2xs font-normal text-[var(--color-muted)]/80">
              {summary.orderCount} orders • {summary.itemCount} items
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* The plan's state and counts live in the menu with its actions;
              the panel closes with the plan it was showing on delete. */}
          <ContainerPlanActionsMenu
            planId={planId}
            orderCount={summary.orderCount}
            itemCount={summary.itemCount}
            stateLabel={planState?.name ?? null}
            stateColor={planState?.color || '#2f2f2fff'}
            onDeleted={onRequestClose}
          />
          {onRequestClose && !isMobile ? (
            <RoundIconButton ariaLabel="Close store pickup plan" onClick={onRequestClose}>
              <CloseIcon className="h-3.5 w-3.5 text-[var(--color-text)]" />
            </RoundIconButton>
          ) : null}
        </div>
      </div>
    </header>
  )
}
