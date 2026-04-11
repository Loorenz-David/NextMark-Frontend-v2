import type { AssignedRouteSummaryDisplay } from '../domain/assignedRouteDisplay.types'

type AssignedRouteSummaryHeaderProps = {
  summary: AssignedRouteSummaryDisplay
}

export function AssignedRouteSummaryHeader({ summary }: AssignedRouteSummaryHeaderProps) {
  const metaSegments = [
    summary.finishTimeLabel ? `Finish ${summary.finishTimeLabel}` : null,
    summary.stopCountLabel,
    summary.distanceLabel,
  ].filter((segment): segment is string => Boolean(segment))

  return (
    <>
    <header className="px-5  pt-1">
      {metaSegments.length > 0 ? (
        <p className="flex flex-wrap items-center text-xs text-white/70">
          {metaSegments.map((segment, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && <span className="mx-2 text-white/40">•</span>}
              {segment}
            </span>
          ))}
        </p>
      ) : null}

      <h2 className=" line-clamp-2 text-base font-semibold leading-tight text-white">
        {summary.routeTitle}
      </h2>

    </header>
      <div className="mt-4 border-t border-white/20" />
    </>
  )
}
