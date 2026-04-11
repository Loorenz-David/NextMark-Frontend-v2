import { motion } from 'framer-motion'
import { useAssignedRouteSearchController } from '../controllers/useAssignedRouteSearchController.controller'

const searchBodyTransition = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1] as const,
}

export function AssignedRouteSearchBody() {
  const controller = useAssignedRouteSearchController()

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      data-bottom-sheet-scroll-root
      exit={{ opacity: 0, y: 18 }}
      initial={{ opacity: 0, y: 18 }}
      transition={searchBodyTransition}
    >
      {controller.searchMode === 'personal' && controller.isSearchingAddresses ? (
        <div className="px-4 py-5 text-sm text-white/65">Searching addresses…</div>
      ) : null}

      {controller.personalSearchError ? (
        <div className="px-4 py-5 text-sm text-rose-300">{controller.personalSearchError}</div>
      ) : null}

      {!controller.query.trim() ? (
        <div className="px-4 py-5 text-sm text-white/65">
          {controller.searchMode === 'team'
            ? 'Search your current route by order, customer, address, or item fields.'
            : 'Search for an address using Google autocomplete.'}
        </div>
      ) : null}

      {controller.query.trim() && controller.results.length === 0 && !controller.isSearchingAddresses && !controller.personalSearchError ? (
        <div className="px-4 py-5 text-sm text-white/65">
          No results found.
        </div>
      ) : null}

      {controller.results.length > 0 ? (
        <div className="flex flex-col gap-2 px-1 pb-4">
          {controller.results.map((result) => (
            <button
              key={result.id}
              className="flex w-full flex-col items-start gap-1 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-left text-white transition hover:bg-white/10"
              onClick={() => { void controller.selectResult(result) }}
              type="button"
            >
              <div className="flex w-full items-center justify-between gap-3">
                <strong className="min-w-0 truncate text-sm font-semibold text-white">{result.title}</strong>
                {'badgeLabel' in result && result.badgeLabel ? (
                  <span className="shrink-0 rounded-full border border-white/12 bg-white/8 px-2 py-1 text-[11px] text-white/72">
                    {result.badgeLabel}
                  </span>
                ) : null}
              </div>
              {result.subtitle ? (
                <p className="text-xs text-white/62">{result.subtitle}</p>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </motion.div>
  )
}
