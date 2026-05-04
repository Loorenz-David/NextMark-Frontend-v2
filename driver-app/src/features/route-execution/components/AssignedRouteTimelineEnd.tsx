import type { AssignedRouteTerminalDisplay } from '../domain/assignedRouteDisplay.types'

type AssignedRouteTimelineEndProps = {
  end: AssignedRouteTerminalDisplay
  onNavigate?: () => void
}

export function AssignedRouteTimelineEnd({ end, onNavigate }: AssignedRouteTimelineEndProps) {
  return (
    <button
      className="w-full appearance-none bg-transparent border-none p-0 text-left"
      onClick={onNavigate}
      type="button"
    >
      <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-2 pb-6">
        <div className="grid min-h-full grid-rows-[1fr_auto_auto] justify-items-center text-white">
          <span
            aria-hidden="true"
            className="w-[3px] -mb-px -mt-px self-stretch"
            style={{ backgroundColor: 'var(--timeline-accent)' }}
          />
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 rounded-full"
            style={{ backgroundColor: 'var(--timeline-accent)' }}
          />
          <div className="mt-1 min-h-6 text-center">
            {end.timeLabel ? (
              <span className="text-xs font-semibold leading-none">{end.timeLabel}</span>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 pb-2 pt-6">
          <p className="text-sm font-semibold leading-tight text-white">{end.title}</p>
          {end.addressLine ? (
            <p className="mt-1 line-clamp-2 text-xs leading-snug text-white/70">{end.addressLine}</p>
          ) : (
            <p className="mt-1 text-sm text-white/45">Address unavailable</p>
          )}
        </div>
      </div>
    </button>
  )
}
