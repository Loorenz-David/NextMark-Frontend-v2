import { useEffect, useMemo, useState, type ChangeEvent } from 'react'

import { FilteredIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { CustomDatePicker } from '@/shared/inputs/CustomDatePicker'
import { InputField } from '@/shared/inputs/InputField'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'

import type { FilterConfig, SearchFilterBarProps } from './SearchFilterBar.types'

const EMPTY_RANGE: [Date | null, Date | null] = [null, null]

const parseDateFilterValue = (value: unknown): Date | null => {
  if (typeof value !== 'string' || !value.trim()) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDateFilterValue = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isDateRangeFilter = (filter: FilterConfig): filter is Extract<FilterConfig, { type: 'date-range' }> =>
  filter.type === 'date-range'

const isNumberListFilter = (filter: FilterConfig): filter is Extract<FilterConfig, { type: 'number-list' }> =>
  filter.type === 'number-list'

const parseNumberListValue = (rawValue: string): number | number[] | undefined => {
  const normalized = rawValue.trim()
  if (!normalized) return undefined

  const parts = normalized
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (!parts.length) return undefined

  const parsed = parts
    .map((part) => Number(part))
    .filter((value) => Number.isFinite(value))

  if (!parsed.length) return undefined

  return parsed.length === 1 ? parsed[0] : parsed
}

export const SearchFilterBar = ({
  applySearch,
  updateFilter,
  openPopupFilter,
  filters = {},
  config = [],
  hideFilteredIcon = false,
  placeholder,
  searchValue = '',
}: SearchFilterBarProps) => {
  const [open, setOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(searchValue)
  const [tempRange, setTempRange] = useState<[Date | null, Date | null]>(EMPTY_RANGE)
  const [tempNumberListValues, setTempNumberListValues] = useState<Record<string, string>>({})

  useEffect(() => {
    setSearchInput(searchValue)
  }, [searchValue])

  const dateRangeFilter = useMemo(
    () => config.find(isDateRangeFilter) ?? null,
    [config],
  )

  useEffect(() => {
    if (!open || !dateRangeFilter) return

    const start = parseDateFilterValue(filters[dateRangeFilter.keyStart])
    const end = parseDateFilterValue(filters[dateRangeFilter.keyEnd])
    setTempRange([start, end])
  }, [dateRangeFilter, filters, open])

  useEffect(() => {
    if (!open) return

    const nextValues: Record<string, string> = {}
    for (const filter of config) {
      if (!isNumberListFilter(filter)) continue
      const currentValue = filters[filter.key]

      if (Array.isArray(currentValue)) {
        nextValues[filter.key] = currentValue.join(', ')
      } else if (typeof currentValue === 'number') {
        nextValues[filter.key] = String(currentValue)
      } else {
        nextValues[filter.key] = ''
      }
    }

    setTempNumberListValues(nextValues)
  }, [config, filters, open])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchInput(value)
    applySearch(value)
  }

  const applyDateRange = (filter: Extract<FilterConfig, { type: 'date-range' }>) => {
    if (!updateFilter) return

    const [start, end] = tempRange

    if (start) {
      updateFilter(filter.keyStart, formatDateFilterValue(start))
    }

    if (end) {
      updateFilter(filter.keyEnd, formatDateFilterValue(end))
    }

    setOpen(false)
  }

  const applyNumberList = (filter: Extract<FilterConfig, { type: 'number-list' }>) => {
    if (!updateFilter) return

    const rawValue = tempNumberListValues[filter.key] ?? ''
    const parsed = parseNumberListValue(rawValue)

    if (parsed === undefined) {
      updateFilter(filter.key, undefined)
    } else {
      updateFilter(filter.key, parsed)
    }

    setOpen(false)
  }

  const isOptionSelected = (filter: Extract<FilterConfig, { type: 'option' }>) => {
    if (filters[filter.key] === filter.value) return true

    return Object.values(filters).some((filterValue) => {
      if (!Array.isArray(filterValue)) return false
      return filterValue.some((item) => item === filter.key || item === filter.value)
    })
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <FloatingPopover
        open={open}
        onOpenChange={setOpen}
        matchReferenceWidth
        closeOnInsideClick
        reference={(
          <div className="flex w-full items-center gap-2 rounded-full border-1 border-[var(--color-muted)]/40 bg-[var(--color-muted)]/10  py-1 pl-4 ">
            <div className="flex-1">
              <InputField
                value={searchInput}
                onChange={handleSearchChange}
                placeholder={placeholder ?? 'Search...'}
                fieldClassName=""
                inputClassName="text-xs w-full"

              />
            </div>
            {!hideFilteredIcon ? (
              <BasicButton
                params={{
                  variant: 'ghost',
                  ariaLabel: 'Open filters',
                  onClick: () => setOpen(prev => !prev),
                  className: 'pr-3',
                }}
              >
                <FilteredIcon className="h-4 w-4 text-[rgb(var(--color-light-blue-r))]" />
              </BasicButton>
            ) : null}
          </div>
        )}
      >
        <div className="admin-glass-popover flex max-h-[320px] flex-col gap-2 overflow-y-auto scroll-thin rounded-xl border border-[var(--color-border-accent)] p-2 shadow-md">
          {config.length === 0 ? (
            <div className="px-2 py-1 text-xs text-[var(--color-muted)]">
              No filters configured.
            </div>
          ) : null}

          {config.map((filter, index) => {
            if (filter.type === 'option') {
              const selected = isOptionSelected(filter)
              return (
                <button
                  key={`${filter.type}-${filter.key}-${String(filter.value)}-${index}`}
                  type="button"
                  data-popover-close="true"
                  onClick={() => updateFilter?.(filter.key, filter.value)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-white/[0.08]"
                >
                  <span>{filter.label}</span>
                  {selected ? (
                    <span className="rounded-full border border-[rgb(var(--color-light-blue-r),0.22)] bg-[rgb(var(--color-light-blue-r),0.12)] px-2 py-0.5 text-[10px] text-[rgb(var(--color-light-blue-r))]">
                      Selected
                    </span>
                  ) : null}
                </button>
              )
            }

            if (filter.type === 'popup-multi-select') {
              const currentValue = filters[filter.key]
              const selectedCount = Array.isArray(currentValue) ? currentValue.filter(Boolean).length : 0

              return (
                <button
                  key={`${filter.type}-${filter.key}-${index}`}
                  type="button"
                  onClick={() => {
                    openPopupFilter?.(filter.popupKey)
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-white/[0.08]"
                >
                  <span>{filter.label}</span>
                  {selectedCount > 0 ? (
                    <span className="rounded-full border border-[rgb(var(--color-light-blue-r),0.22)] bg-[rgb(var(--color-light-blue-r),0.12)] px-2 py-0.5 text-[10px] text-[rgb(var(--color-light-blue-r))]">
                      {selectedCount} selected
                    </span>
                  ) : null}
                </button>
              )
            }

            if (filter.type === 'number-list') {
              const value = tempNumberListValues[filter.key] ?? ''
              return (
                <div
                  key={`${filter.type}-${filter.key}-${index}`}
                  className="flex flex-col gap-2 rounded-md border border-white/[0.08] bg-white/[0.04] p-2"
                >
                  <span className="text-xs font-semibold text-[var(--color-muted)]">
                    {filter.label}
                  </span>
                  <InputField
                    value={value}
                    onChange={(event) => {
                      const nextValue = event.target.value
                      setTempNumberListValues((current) => ({
                        ...current,
                        [filter.key]: nextValue,
                      }))
                    }}
                    placeholder={filter.placeholder ?? 'Enter one or more ids (comma separated)'}
                    fieldClassName=""
                    inputClassName="text-xs w-full"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <BasicButton
                      params={{
                        variant: 'text',
                        onClick: () => {
                          setTempNumberListValues((current) => ({
                            ...current,
                            [filter.key]: '',
                          }))
                          updateFilter?.(filter.key, undefined)
                        },
                        ariaLabel: `Clear ${filter.label}`,
                      }}
                    >
                      Clear
                    </BasicButton>
                    <BasicButton
                      params={{
                        variant: 'secondary',
                        onClick: () => applyNumberList(filter),
                        ariaLabel: `Apply ${filter.label}`,
                      }}
                    >
                      Apply
                    </BasicButton>
                  </div>
                </div>
              )
            }

            if (filter.type === 'popup-date-range') {
              const hasStart = typeof filters[filter.keyStart] === 'string' && String(filters[filter.keyStart]).trim().length > 0
              const hasEnd = typeof filters[filter.keyEnd] === 'string' && String(filters[filter.keyEnd]).trim().length > 0
              const hasSelection = hasStart || hasEnd

              return (
                <button
                  key={`${filter.type}-${filter.keyStart}-${filter.keyEnd}-${index}`}
                  type="button"
                  onClick={() => {
                    openPopupFilter?.(filter.popupKey)
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-white/[0.08]"
                >
                  <span>{filter.label}</span>
                  {hasSelection ? (
                    <span className="rounded-full border border-[rgb(var(--color-light-blue-r),0.22)] bg-[rgb(var(--color-light-blue-r),0.12)] px-2 py-0.5 text-[10px] text-[rgb(var(--color-light-blue-r))]">
                      Selected
                    </span>
                  ) : null}
                </button>
              )
            }

            const [start, end] = tempRange
            return (
              <div
                key={`${filter.type}-${filter.keyStart}-${filter.keyEnd}-${index}`}
                className="flex flex-col gap-2 rounded-md border border-white/[0.08] bg-white/[0.04] p-2"
              >
                <span className="text-xs font-semibold text-[var(--color-muted)]">
                  {filter.label}
                </span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[var(--color-muted)]/80">Start</span>
                    <CustomDatePicker
                      date={start}
                      onChange={(value) => setTempRange([parseDateFilterValue(value), end])}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[var(--color-muted)]/80">End</span>
                    <CustomDatePicker
                      date={end}
                      onChange={(value) => setTempRange([start, parseDateFilterValue(value)])}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <BasicButton
                    params={{
                      variant: 'text',
                      onClick: () => setTempRange(EMPTY_RANGE),
                      ariaLabel: 'Clear date range',
                    }}
                  >
                    Clear
                  </BasicButton>
                  <BasicButton
                    params={{
                      variant: 'secondary',
                      onClick: () => applyDateRange(filter),
                      ariaLabel: 'Apply date range filter',
                    }}
                  >
                    Apply
                  </BasicButton>
                </div>
              </div>
            )
          })}
        </div>
      </FloatingPopover>
    </div>
  )
}
