import { useEffect } from 'react'

import { ArchiveIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { ActiveFilterPills, SearchFilterBar } from '@/shared/searchBars'

import { filterConfig } from '../../domain/orderCaseFilter.config'
import type { OrderCaseQueryFilters } from '../../types'
import type { OrderCaseStats } from '../../types/orderCaseMeta'
import { pluralLabel } from '@shared-utils'

type OrderCaseMainHeaderProps = {
  applySearch: (input: string) => void
  updateFilters: (key: string, value: unknown) => void
  deleteFilter: (key: string) => void
  resetQuery: () => void
  onClose: () => void
  orderCaseStats?:OrderCaseStats
  query: {
    q: string
    filters: OrderCaseQueryFilters
  }
}

export const OrderCaseMainHeader = ({
  applySearch,
  updateFilters,
  deleteFilter,
  resetQuery,
  onClose,
  orderCaseStats,
  query,
}: OrderCaseMainHeaderProps) => {
  const filterLabelMap = filterConfig.reduce<Record<string, string>>((acc, filter) => {
    if (filter.type === 'option') {
      acc[filter.key] = filter.label
    }
    return acc
  }, {})

  useEffect(() => {
    return () => {
      resetQuery()
    }
  }, [resetQuery])

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center rounded-xl bg-[var(--color-muted)]/10 px-3 py-3">
            <ArchiveIcon className="h-6 w-6 text-[var(--color-muted)]" />
          </div>
          <HeaderTitle orderCaseStats={orderCaseStats} />
        </div>
        <BasicButton
          params={{
            variant: 'text',
            onClick: onClose,
            ariaLabel: 'Close cases',
          }}
        >
          Close
        </BasicButton>
      </div>

      <div className="flex flex-col">
        <div className="flex gap-4 px-4 pb-3 pt-4 max-h-[60px]">
          <SearchFilterBar
            placeholder="Search cases..."
            applySearch={applySearch}
            config={filterConfig}
            updateFilter={(key, value) => updateFilters(key, value)}
            filters={query.filters}
          />
        </div>

        <div className="flex w-full px-2">
          <ActiveFilterPills
            className="px-4"
            filters={query.filters}
            removeFilter={deleteFilter}
            formatFilterLabel={(key) => filterLabelMap[key] ?? key}
          />
        </div>
      </div>
    </>
  )
}


const HeaderTitle = ({orderCaseStats}:{orderCaseStats?:OrderCaseStats})=>{
  const caseCount = orderCaseStats?.order_cases.total ?? 0
  const openCount = orderCaseStats?.open_cases.total ?? 0
  const resolvingCount = orderCaseStats?.resolving_cases.total  ?? 0
  return (
    <div className="flex min-w-0 flex-col">
      <span className="text-[0.98rem] font-semibold tracking-tight text-[var(--color-text)]">
        Order Cases
      </span>
      <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[0.72rem] text-[var(--color-muted)]">
        <span>{caseCount} {pluralLabel('case',caseCount)} •</span>
        <span>{openCount} {pluralLabel('open',openCount)} •</span>
        <span>{resolvingCount} {pluralLabel('resolving',resolvingCount)}</span>
      </div>
    </div>
  )
}
