type AssignedRouteTimelineRailProps = {
  isTerminal?: boolean
}

export function AssignedRouteTimelineRail({ isTerminal = false }: AssignedRouteTimelineRailProps) {
  return (
    <div className="relative flex w-14 shrink-0 justify-center self-stretch">
      {!isTerminal ? (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 top-0 w-[3px] -translate-x-1/2 rounded-full"
          style={{ backgroundColor: 'var(--timeline-accent)' }}
        />
      ) : null}
    </div>
  )
}
