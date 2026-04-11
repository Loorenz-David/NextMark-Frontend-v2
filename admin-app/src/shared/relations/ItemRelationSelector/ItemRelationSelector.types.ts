export type ItemRelationOption = {
  label: string
  description: string
  value: number
  meta?: {
    options?: string[]
    required?: boolean
  }
}

export type ItemRelationSearchValue = {
  input: string | null
  filters: unknown[]
}

export type ItemRelationQueryFn = (
  searchValue: ItemRelationSearchValue,
  options: ItemRelationOption[],
) => ItemRelationOption[]

export type ItemRelationSelectorProps = {
  options: ItemRelationOption[]
  selectedValues: number[]
  onToggle: (value: number, action: 'add' | 'remove') => void
  queryFn: ItemRelationQueryFn
  filterOptions?: { label: string; value: unknown }[]
  searchPlaceholder?: string
  className?: string
}
