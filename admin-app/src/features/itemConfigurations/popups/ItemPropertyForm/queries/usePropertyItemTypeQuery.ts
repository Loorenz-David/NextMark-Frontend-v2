import { useMemo } from 'react'

import type { SearchBarFilterOption } from '@/shared/buttons/SearchBar'
import type { ItemRelationOption, ItemRelationQueryFn, ItemRelationSearchValue } from '@/shared/relations/ItemRelationSelector'

import { useItemTypes } from '../../../hooks/useItemSelectors'

const FILTER_SELECTED = 'selected'

const normalize = (value: string | null | undefined) => (value ?? '').toLowerCase().trim()

const matchesText = (option: ItemRelationOption, input: string | null) => {
  const query = normalize(input)
  if (!query) {
    return true
  }

  const haystack = [option.label, option.description]
    .filter(Boolean)
    .map((entry) => normalize(entry))

  return haystack.some((entry) => entry.includes(query))
}

export const usePropertyItemTypeQuery = (selectedValues: number[]) => {
  const itemTypes = useItemTypes()
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues])

  const options = useMemo<ItemRelationOption[]>(
    () =>
      itemTypes
        .filter((itemType) => itemType.id !== undefined && itemType.id !== null)
        .map((itemType) => ({
          label: itemType.name,
          description: 'item type',
          value: itemType.id as number,
        })),
    [itemTypes],
  )

  const filterOptions = useMemo<SearchBarFilterOption[]>(
    () => [{ label: 'Selected', value: FILTER_SELECTED }],
    [],
  )

  const queryFn: ItemRelationQueryFn = useMemo(
    () => (searchValue: ItemRelationSearchValue, items: ItemRelationOption[]) => {
      const filterSet = new Set(searchValue.filters)
      const requireSelected = filterSet.has(FILTER_SELECTED)

      return items.filter((option) => {
        if (!matchesText(option, searchValue.input)) {
          return false
        }
        if (requireSelected && !selectedSet.has(option.value)) {
          return false
        }
        return true
      })
    },
    [selectedSet],
  )

  return { options, queryFn, filterOptions }
}
