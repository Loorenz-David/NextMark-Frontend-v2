import { useMemo, useState } from 'react'

import { SearchBar } from '@/shared/buttons'
import { Switch } from '@/shared/inputs/Switch'

import { itemRelationSelectorClasses } from './ItemRelationSelector.styles'
import type { ItemRelationSearchValue, ItemRelationSelectorProps } from './ItemRelationSelector.types'

export const ItemRelationSelector = ({
  options,
  selectedValues,
  onToggle,
  queryFn,
  filterOptions,
  searchPlaceholder,
  className,
}: ItemRelationSelectorProps) => {
  const [searchValue, setSearchValue] = useState<ItemRelationSearchValue>({
    input: '',
    filters: [],
  })

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues])

  const filteredOptions = useMemo(
    () => queryFn(searchValue, options),
    [options, queryFn, searchValue],
  )

  const handleSearchChange = (value: ItemRelationSearchValue) => {
    setSearchValue(value)
  }

  if (!options.length) {
    return <div className={itemRelationSelectorClasses.empty}>No items available.</div>
  }

  return (
    <div className={`${itemRelationSelectorClasses.container} ${className ?? ''}`}>
      <div className='flex py-4 px-2 bg-[var(--color-page)]'>
        <SearchBar
          placeholder={searchPlaceholder ?? 'Search'}
          onChange={handleSearchChange}
          options={filterOptions}
          className="w-full rounded-full border border-[var(--color-muted)]/40 bg-[var(--color-page)] px-3 py-2 text-sm text-[var(--color-text)]"
          iconClassName="p-1 pr-2"
        />
      </div>

      {filteredOptions.length === 0 ? (
        <div className={itemRelationSelectorClasses.empty}>No items match your search.</div>
      ) : (
        <div className={itemRelationSelectorClasses.list}>
          {filteredOptions.map((option) => {
            const isSelected = selectedSet.has(option.value)
            return (
              <div key={option.value} className={itemRelationSelectorClasses.row}>
                <div className={itemRelationSelectorClasses.rowContent}>
                  <span className={itemRelationSelectorClasses.label}>{option.label}</span>
                  <span className={itemRelationSelectorClasses.description}>{option.description}</span>
                </div>
                <Switch
                  value={isSelected}
                  onChange={(nextValue) => {
                    onToggle(option.value, nextValue ? 'add' : 'remove')
                  }}
                  ariaLabel={`${option.label} relation`}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
