import { useMemo, useState } from 'react'

import { ObjectLinkSelector } from '@/shared/inputs/ObjectLinkSelector'

import { mapVehicleToSelectorItem } from '../../domain/vehicleSelector.domain'
import { useHydrateSelectedVehicles } from '../../hooks/useHydrateSelectedVehicles'
import { useVehicles } from '../../hooks/useVehicleSelectors'
import { useVehicleSelectorQuery } from '../../hooks/useVehicleSelectorQuery'
import type { VehicleSelectorProps } from './VehicleSelector.types'

const isSelectionProps = (
  props: VehicleSelectorProps,
): props is Extract<
  VehicleSelectorProps,
  { onSelectionChange: (nextIds: Array<number | string>) => void }
> => typeof (props as { onSelectionChange?: unknown }).onSelectionChange === 'function'

export const VehicleSelector = ({
  placeholder = 'Select a vehicle',
  containerClassName,
  ...props
}: VehicleSelectorProps) => {
  const [query, setQuery] = useState('')
  const vehicles = useVehicles()
  const selectionProps = isSelectionProps(props) ? props : null
  const legacyProps = selectionProps ? null : props
  const mode = selectionProps?.mode ?? 'single'
  const selectedVehicleIds = useMemo(
    () =>
      selectionProps
        ? selectionProps.selectedVehicleIds
        : legacyProps?.selectedVehicle != null
          ? [legacyProps.selectedVehicle]
          : [],
    [legacyProps?.selectedVehicle, selectionProps],
  )
  useHydrateSelectedVehicles(selectedVehicleIds)
  const { items, isLoading } = useVehicleSelectorQuery({ query })

  const handleSelectionChange = (nextIds: Array<number | string>) => {
    if (selectionProps) {
      selectionProps.onSelectionChange(nextIds)
      return
    }

    const resolvedLegacyProps = legacyProps as Exclude<
      VehicleSelectorProps,
      Extract<
        VehicleSelectorProps,
        { onSelectionChange: (nextIds: Array<number | string>) => void }
      >
    >
    const nextValue = nextIds[0]
    resolvedLegacyProps.onSelectVehicle(
      typeof nextValue === 'number' ? nextValue : nextValue ? Number(nextValue) : null,
    )
  }

  const selectedItems = useMemo(() => {
    const selectedIdSet = new Set(selectedVehicleIds.map(String))
    return vehicles
      .filter((vehicle) => vehicle.id != null)
      .filter(
        (vehicle) =>
          selectedIdSet.has(String(vehicle.id ?? '')) ||
          selectedIdSet.has(String(vehicle.client_id)),
      )
      .map(mapVehicleToSelectorItem)
  }, [selectedVehicleIds, vehicles])

  const options = useMemo(
    () => items.filter((vehicle) => vehicle.id != null).map(mapVehicleToSelectorItem),
    [items],
  )

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
      emptyOptionsMessage="No vehicles found."
      emptySelectedMessage="No selected vehicles."
      selectedOverlayTitle={mode === 'single' ? 'Selected vehicle' : 'Selected vehicles'}
      selectedButtonLabel={mode === 'single' ? 'Vehicle' : 'Vehicles'}
      onSelectItem={(item) => {
        setQuery('')

        if (mode === 'single') {
          handleSelectionChange([item.id])
          return
        }

        const nextIds = Array.from(new Set([...selectedVehicleIds, item.id]))
        handleSelectionChange(nextIds)
      }}
      onRemoveSelectedItem={(item) => {
        setQuery('')
        handleSelectionChange(selectedVehicleIds.filter((id) => String(id) !== String(item.id)))
      }}
    />
  )
}
