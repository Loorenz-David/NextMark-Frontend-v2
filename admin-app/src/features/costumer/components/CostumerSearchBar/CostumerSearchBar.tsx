import { useEffect, useMemo, useRef, useState } from 'react'
import { SearchFilterBar } from '@/shared/searchBars'
import { AnimationRenderer } from '@/shared/spiners'

import { runCostumerQueryFlow } from '../../flows/costumerQuery.flow'


import { useCostumerSearch } from '../../flows/useCostumerSearch.flow'
import { PlusIcon } from '@/assets/icons'
import type { CostumerSearchBarProps } from './CostumerSearchBar.types'


export const shouldRunCostumerQuery = (input: string): boolean => input.trim().length > 0

const SEARCH_DEBOUNCE_MS = 400
const MIN_SEARCH_LOADING_MS = 1000


export const CostumerSearchBar = ({
  onSelectCostumer,
  placeholder = 'Search costumers...',
  className,
  handleStartCreate,
  selectedCostumerClientId,
}: CostumerSearchBarProps) => {
  
  
  const {queryCostumers , visibleCostumers, isLoading, error} = runCostumerQueryFlow()
  const [showLoading, setShowLoading] = useState(false)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const loadingStartAtRef = useRef<number | null>(null)

  const { searchInput, setSearchInput } = useCostumerSearch({
    debounceMs: SEARCH_DEBOUNCE_MS,
    queryCostumers
  })
  
  const results = useMemo(() => visibleCostumers, [visibleCostumers])

  const hasQuery = shouldRunCostumerQuery(searchInput)
  const isBusy = hasQuery && (isDebouncing || isLoading)

  useEffect(() => {
    if (!hasQuery) {
      setIsDebouncing(false)
      return
    }

    setIsDebouncing(true)
    const timeoutId = window.setTimeout(() => {
      setIsDebouncing(false)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [hasQuery, searchInput])

  useEffect(() => {
    if (isBusy) {
      if (!showLoading) {
        loadingStartAtRef.current = Date.now()
        setShowLoading(true)
      }
      return
    }

    if (!showLoading) {
      return
    }

    const startedAt = loadingStartAtRef.current ?? Date.now()
    const elapsed = Date.now() - startedAt
    const remaining = Math.max(0, MIN_SEARCH_LOADING_MS - elapsed)
    const timeoutId = window.setTimeout(() => {
      setShowLoading(false)
      loadingStartAtRef.current = null
    }, remaining)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isBusy, showLoading])

  return (
    <div className={className}>
      <SearchFilterBar
        placeholder={placeholder}
        applySearch={(input) => setSearchInput(input)}
        hideFilteredIcon
      />

      <div className="mt-2  overflow-y-auto scroll-thin rounded-lg border border-[var(--color-border)]/60 bg-[var(--color-page)]/50">
          <div className="flex w-full justify start items-center py-2 px-3 gap-3 cursor-pointer hover:bg-[var(--color-muted)]/10"
            onClick={()=>handleStartCreate()}
          > 
          <div className="p-1 border-1 border-dashed border-[var(--color-muted)]/80 rounded-full">
            <PlusIcon className="h-3 w-3 text-[var(--color-muted)]/80"/>
          </div>
            <span className="text-[12px] text-[var(--color-muted)]"> 
              Create Costumer
            </span>
          </div>
        {!hasQuery ? (
          <div className=" "></div>
        ) : showLoading ? (
          <div className="flex h-[200px] flex-col items-center justify-center gap-1 px-3 py-2">
            <AnimationRenderer animation="jumpUp" width="72px" height="72px" />
            <span className="text-xs text-[var(--color-muted)]">Searching...</span>
          </div>
        ) : error ? (
          <div className="px-3 py-2 text-xs text-red-500 h-[200px]">{error}</div>
        ) : results.length === 0 ? (
          <div className="px-3 py-2 text-xs text-[var(--color-muted)] h-[200px]">No costumers found.</div>
        ) : (
          <div className="flex flex-col h-[200px] pt-2">
            {results.map((costumer) => {
              const fullName = `${costumer.first_name} ${costumer.last_name}`.trim()
              const isSelected = Boolean(
                selectedCostumerClientId &&
                  costumer.client_id &&
                  costumer.client_id === selectedCostumerClientId,
              )

              return (
                <button
                  key={costumer.client_id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      return
                    }
                    onSelectCostumer(costumer)
                  }}
                  disabled={isSelected}
                  className={`flex w-full flex-col border-b border-[var(--color-border)]/40 px-3 py-2 text-left last:border-b-0 ${
                    isSelected
                      ? 'cursor-not-allowed bg-blue-50'
                      : 'cursor-pointer hover:bg-[var(--color-muted)]/10'
                  }`}
                >
                  <div className="flex w-full items-start gap-2">
                    <span
                      className={`min-w-0 flex-1 break-words whitespace-normal text-sm leading-4 ${
                        isSelected ? 'text-blue-700' : 'text-[var(--color-text)]'
                      }`}
                    >
                      {fullName}
                    </span>
                    {isSelected ? (
                      <span className="ml-1 shrink-0 self-start rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-blue-700">
                        Selected
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[11px] text-[var(--color-muted)]">{costumer.email ?? 'No email'}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
