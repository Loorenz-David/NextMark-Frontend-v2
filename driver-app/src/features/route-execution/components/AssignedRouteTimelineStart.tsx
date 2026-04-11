import type { AssignedRouteTerminalDisplay } from '../domain/assignedRouteDisplay.types'

type AssignedRouteTimelineStartProps = {
  start: AssignedRouteTerminalDisplay
}

export function AssignedRouteTimelineStart({ start }: AssignedRouteTimelineStartProps) {
  return (
    <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-2 pt-6">
      <div className="grid min-h-full grid-rows-[auto_auto_auto_1fr] justify-items-center text-white">
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 rounded-full"
          style={{ backgroundColor: 'var(--timeline-accent)' }}
        />
        <span
          aria-hidden="true"
          className=" h-2.5 w-[3px]"
          style={{ backgroundColor: 'var(--timeline-accent)' }}
        />
        <div className="mt-1 min-h-6 text-center">
          {start.timeLabel ? (
            <span className="text-xs font-semibold leading-none">{start.timeLabel}</span>
          ) : null}
        </div>
        <span
          aria-hidden="true"
          className="mt-3 w-[3px] -mb-px self-stretch"
          style={{ backgroundColor: 'var(--timeline-accent)' }}
        />
      </div>

      <div className="min-w-0 pb-5 pt-1">
        <p className="text-sm font-semibold leading-tight text-white">{start.title}</p>
        {start.addressLine ? (
          <p className="mt-1 line-clamp-2 text-xs leading-snug text-white/70">{start.addressLine}</p>
        ) : (
          <p className="mt-1 text-sm text-white/45">Address unavailable</p>
        )}
      </div>
    </div>
  )
}
