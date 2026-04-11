import type { address } from '@/types/address'
import {  TimeIcon } from '@/assets/icons'
import type { RouteSolutionWarning } from '@/features/plan/routeGroup/types/routeSolution'
import { RouteSolutionWarnings } from '@/features/plan/routeGroup/components/warnings/RouteSolutionWarnings'
import type { RouteSolutionWarningRegistry } from '@/features/plan/routeGroup/domain/routeSolutionWarningRegistry'
import type { useRouteGroupPageActions } from '@/features/plan/routeGroup/actions/useRouteGroupPageActions'

type RouteGroupBoundaryLocationCardProps = {
  label: string
  address: address
  time:string | null
  warnings?: RouteSolutionWarning[] | null
  planStartDate?: string | null
  warningRegistry: RouteSolutionWarningRegistry
  routeGroupActions: ReturnType<typeof useRouteGroupPageActions>
  containerClassName?:string
}

export const RouteGroupBoundaryLocationCard = ({
  label,
  address,
  time,
  warnings,
  planStartDate,
  warningRegistry,
  routeGroupActions,
  containerClassName
}: RouteGroupBoundaryLocationCardProps) => {
  const streetAddress = address?.street_address ?? '—'
  
  return (
    <div
      className={`admin-glass-panel admin-surface-compact flex justify-between rounded-2xl border border-white/10 p-4 transition-all duration-200 hover:border-white/18 hover:bg-white/[0.08] ${containerClassName ?? ''}`}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-[var(--color-text)]/78">
          {label}
        </span>
        <span className="truncate text-xs text-[var(--color-muted)]/95">{streetAddress}</span>
      </div>
      <div className="flex shrink-0 flex-col justify-end text-xs text-[var(--color-muted)]">
        <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-2 py-1">
          <RouteSolutionWarnings
            warnings={warnings}
            planStartDate={planStartDate}
            registry={warningRegistry}
            routeGroupActions={routeGroupActions}
          />
          <TimeIcon className="h-3 w-3 text-[var(--color-light-blue)]" />
          {time}
        </div>
      </div>
    </div>
  )
}
