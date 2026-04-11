import { useMemo } from 'react'

import type { SearchBarFilterOption } from '@/shared/buttons/SearchBar'
import type { ItemRelationOption, ItemRelationQueryFn, ItemRelationSearchValue } from '@/shared/relations/ItemRelationSelector'

import { useItemProperties } from '../../../hooks/useItemSelectors'

const FILTER_REQUIRED = 'required'
const FILTER_SELECTED = 'selected'

const normalize = (value: string | null | undefined) => (value ?? '').toLowerCase().trim()

const matchesText = (option: ItemRelationOption, input: string | null) => {
  const query = normalize(input)
  if (!query) {
    return true
  }

  const haystack = [
    option.label,
    option.description,
    ...(option.meta?.options ?? []),
  ]
    .filter(Boolean)
    .map((entry) => normalize(entry))

  return haystack.some((entry) => entry.includes(query))
}

export const useItemTypePropertyQuery = (selectedValues: number[]) => {
  const properties = useItemProperties()
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues])

  const options = useMemo<ItemRelationOption[]>(
    () =>
      properties
        .filter((property) => property.id !== undefined && property.id !== null)
        .map((property) => ({
          label: property.name,
          description: property.field_type,
          value: property.id as number,
          meta: {
            options: property.options ?? [],
            required: property.required ?? false,
          },
        })),
    [properties],
  )

  const filterOptions = useMemo<SearchBarFilterOption[]>(
    () => [
      { label: 'Required', value: FILTER_REQUIRED },
      { label: 'Selected', value: FILTER_SELECTED },
    ],
    [],
  )

  const queryFn: ItemRelationQueryFn = useMemo(
    () => (searchValue: ItemRelationSearchValue, items: ItemRelationOption[]) => {
      const filterSet = new Set(searchValue.filters)
      const requireRequired = filterSet.has(FILTER_REQUIRED)
      const requireSelected = filterSet.has(FILTER_SELECTED)

      return items.filter((option) => {
        if (!matchesText(option, searchValue.input)) {
          return false
        }
        if (requireRequired && !option.meta?.required) {
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
