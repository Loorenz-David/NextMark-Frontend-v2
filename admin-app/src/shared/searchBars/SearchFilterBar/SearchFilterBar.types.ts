export type FilterConfig =
  | {
      type: 'option'
      key: string
      label: string
      value: string | number | boolean
    }
  | {
      type: 'number-list'
      key: string
      label: string
      placeholder?: string
    }
  | {
      type: 'date-range'
      keyStart: string
      keyEnd: string
      label: string
    }

export type SearchFilterBarProps = {
  applySearch: (input: string) => void
  updateFilter?: (key: string, value: unknown) => void
  /** When set, the filter icon delegates to the caller instead of the inline config popover. */
  onOpenFilters?: () => void
  /** Badge next to the filter icon; hidden when 0 or undefined. */
  activeFilterCount?: number
  filters?: Record<string, unknown>
  config?: FilterConfig[]
  hideFilteredIcon?: boolean
  placeholder?: string
  searchValue?: string
}
