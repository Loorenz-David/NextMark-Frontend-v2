import type { ReactNode } from 'react'

export type ObjectLinkSelectorMode = 'single' | 'multi'

export type ObjectLinkSelectorItemId = string | number

export type ObjectLinkSelectorItem = {
  id: ObjectLinkSelectorItemId
  label: string
  details?: string | null
  icon?: ReactNode
}

export type ObjectLinkSelectorProps = {
  mode?: ObjectLinkSelectorMode
  options: ObjectLinkSelectorItem[]
  selectedItems: ObjectLinkSelectorItem[]
  onSelectItem: (item: ObjectLinkSelectorItem) => void
  onRemoveSelectedItem?: (item: ObjectLinkSelectorItem) => void
  onQueryChange?: (value: string) => void
  queryValue?: string
  defaultQueryValue?: string
  placeholder?: string
  emptyOptionsMessage?: string
  emptySelectedMessage?: string
  selectedOverlayTitle?: string
  selectedButtonLabel?: string
  loading?: boolean
  disabled?: boolean
  containerClassName?: string
}

export type ObjectLinkSelectorInputProps = {
  mode: ObjectLinkSelectorMode
  open: boolean
  disabled: boolean
  placeholder: string
  displayValue: string
  selectedCount: number
  selectedButtonLabel: string
  containerClassName?: string
  onInputChange: (value: string) => void
  onInputFocus: () => void
  onToggleOptions: () => void
  onOpenSelectedOverlay: () => void
}

export type ObjectLinkSelectorOptionCardProps = {
  item: ObjectLinkSelectorItem
  selected?: boolean
  onSelect?: (item: ObjectLinkSelectorItem) => void
  onRemove?: (item: ObjectLinkSelectorItem) => void
}

export type ObjectLinkSelectorSelectedOverlayProps = {
  open: boolean
  title: string
  items: ObjectLinkSelectorItem[]
  emptyMessage: string
  onClose: () => void
  onRemoveItem?: (item: ObjectLinkSelectorItem) => void
}
