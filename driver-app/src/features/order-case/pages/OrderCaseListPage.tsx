import { OrderCaseListEmptyState, OrderCaseListSection, OrderCasePageHeader } from '../components'
import { useOrderCaseListPageController } from '../controllers'

export function OrderCaseListPage() {
  const {
    activeCases,
    resolvedCases,
    error,
    hasLoaded,
    isLoading,
    onClose,
    onOpenCase,
  } = useOrderCaseListPageController()

  return (
    <section className="relative z-10 [grid-area:overlay] flex h-full min-h-0 w-full flex-col bg-[rgb(var(--bg-app-color))] text-white">
      <OrderCasePageHeader
        onClose={onClose}
        subtitle="Track open, resolving, and resolved cases for this order."
        title="Cases"
      />

      <div
        className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
        data-bottom-sheet-scroll-root
      >
        {isLoading && !hasLoaded ? (
          <div className="rounded-2xl border border-white/12 bg-white/6 px-4 py-5 text-sm text-white/60">
            Loading cases...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-5 text-sm text-red-100">
            {error}
          </div>
        ) : activeCases.length === 0 && resolvedCases.length === 0 ? (
          <OrderCaseListEmptyState />
        ) : (
          <div className="space-y-6">
            <OrderCaseListSection
              cases={activeCases}
              onOpenCase={onOpenCase}
              title="Active"
            />
            <OrderCaseListSection
              cases={resolvedCases}
              onOpenCase={onOpenCase}
              title="Resolved"
            />
          </div>
        )}
      </div>
    </section>
  )
}
