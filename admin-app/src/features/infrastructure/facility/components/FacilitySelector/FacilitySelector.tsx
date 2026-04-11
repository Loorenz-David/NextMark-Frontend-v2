import { useMemo, useState } from 'react'

import { ObjectLinkSelector } from '@/shared/inputs/ObjectLinkSelector'

import { mapFacilityToSelectorItem } from '../../domain/facilitySelector.domain'
import { useFacilities } from '../../hooks/useFacilitySelectors'
import { useHydrateSelectedFacilities } from '../../hooks/useHydrateSelectedFacilities'
import { useFacilitySelectorQuery } from '../../hooks/useFacilitySelectorQuery'

import type { FacilitySelectorProps } from './FacilitySelector.types'

export const FacilitySelector = ({
  mode = 'single',
  selectedFacilityIds,
  onSelectionChange,
  placeholder = 'Select a facility',
  containerClassName,
}: FacilitySelectorProps) => {
  const [query, setQuery] = useState('')
  const facilities = useFacilities()
  useHydrateSelectedFacilities(selectedFacilityIds)
  const { items, isLoading } = useFacilitySelectorQuery({ query })

  const selectedItems = useMemo(() => {
    const selectedIdSet = new Set(selectedFacilityIds.map(String))
    return facilities
      .filter(
        (facility) =>
          selectedIdSet.has(String(facility.id ?? '')) || selectedIdSet.has(String(facility.client_id)),
      )
      .map(mapFacilityToSelectorItem)
  }, [facilities, selectedFacilityIds])

  const options = useMemo(() => items.map(mapFacilityToSelectorItem), [items])

  return (
    <ObjectLinkSelector
      mode={mode}
      options={options}
      selectedItems={selectedItems}
      queryValue={query}
      onQueryChange={setQuery}
      loading={isLoading}
      placeholder={placeholder}
      containerClassName={containerClassName}
      emptyOptionsMessage="No facilities found."
      emptySelectedMessage="No selected facilities."
      selectedOverlayTitle="Selected facilities"
      selectedButtonLabel={mode === 'single' ? 'Facility' : 'Facilities'}
      onSelectItem={(item) => {
        setQuery('')

        if (mode === 'single') {
          onSelectionChange([item.id])
          return
        }

        const nextIds = Array.from(new Set([...selectedFacilityIds, item.id]))
        onSelectionChange(nextIds)
      }}
      onRemoveSelectedItem={(item) => {
        setQuery('')
        onSelectionChange(selectedFacilityIds.filter((id) => String(id) !== String(item.id)))
      }}
    />
  )
}
