import { RouteCard } from './RouteCard'
import { useRoutesListController } from '../controllers'

export function RoutesListContent() {
  const controller = useRoutesListController()

  if (controller.status === 'loading' && controller.routeCards.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white/85 px-4 py-6 text-sm text-slate-500 shadow-sm">
        Loading routes...
      </div>
    )
  }

  if (controller.status === 'error') {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 shadow-sm">
        <p>{controller.error ?? 'Unable to load routes.'}</p>
        <button
          type="button"
          onClick={() => void controller.refreshRoutes()}
          className="mt-3 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Retry
        </button>
      </div>
    )
  }

  if (controller.routeCards.length === 0) {
    return (
      <div className=" px-4 py-6 text-sm text-[rgb(var(--bg-soft-light))] ">
        No routes available.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {controller.routeCards.map((route) => (
        <RouteCard
          key={route.routeClientId}
          label={route.label}
          dateRangeLabel={route.dateRangeLabel}
          isSelected={route.isSelected}
          onSelect={controller.onSelectRoute
            ? () => controller.onSelectRoute?.(route.routeClientId)
            : undefined}
        />
      ))}
    </div>
  )
}
