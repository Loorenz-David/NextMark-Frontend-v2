export type FilterConfig =
  | {
      type: 'option'
      key: string
      label: string
      value: string | number | boolean
    }
  | {
      type: 'popup-multi-select'
      key: string
      label: string
      popupKey: string
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
  | {
      type: 'popup-date-range'
      keyStart: string
      keyEnd: string
      label: string
      popupKey: string
    }

export type SearchFilterBarProps = {
  applySearch: (input: string) => void
  updateFilter?: (key: string, value: unknown) => void
  openPopupFilter?: (popupKey: string) => void
  filters?: Record<string, unknown>
  config?: FilterConfig[]
  hideFilteredIcon?: boolean
  placeholder?: string
  searchValue?: string
}
